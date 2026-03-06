import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions, deleteTransaction } from '../storage';
import { Transaction, TxType, COLORS } from '../types';
import TransactionItem from '../components/TransactionItem';
import EditModal from '../components/EditModal';
import AppModal from '../components/AppModal';

interface Group { date: string; txs: Transaction[] }

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

type FilterType = 'all' | TxType;

function groupByDate(txs: Transaction[]): Group[] {
  const map: Record<string, Transaction[]> = {};
  txs.forEach(t => {
    if (!map[t.date]) map[t.date] = [];
    map[t.date].push(t);
  });
  return Object.entries(map)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, txs]) => ({ date, txs }));
}

function dateHeader(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAYS[d.getDay()]}）`;
}

export default function HistoryScreen() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [selMonth, setSelMonth] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await getTransactions();
    setTxs(data);
    setSelMonth(prev => {
      if (!prev && data.length > 0) return data[0].date.slice(0, 7);
      return prev;
    });
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleDelete = (id: string) => {
    setPendingDeleteId(id);
  };

  const allMonths = [...new Set(txs.map(t => t.date.slice(0, 7)))].sort((a, b) => b.localeCompare(a));

  let filtered = selMonth ? txs.filter(t => t.date.startsWith(selMonth)) : txs;
  if (filterType !== 'all') filtered = filtered.filter(t => t.type === filterType);
  if (searchText.trim()) {
    const q = searchText.trim().toLowerCase();
    filtered = filtered.filter(t =>
      t.category.toLowerCase().includes(q) || t.note.toLowerCase().includes(q)
    );
  }

  const groups = groupByDate(filtered);
  const monthTotalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const monthTotalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const monthLabel = (m: string) => {
    const [, mo] = m.split('-');
    return `${parseInt(mo)}月`;
  };

  const FILTER_OPTIONS: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'expense', label: '支出' },
    { key: 'income', label: '收入' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Month Tabs */}
      {allMonths.length > 0 && (
        <View style={styles.tabsWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
            {allMonths.map(m => (
              <TouchableOpacity
                key={m}
                style={[styles.tab, selMonth === m && styles.tabActive]}
                onPress={() => setSelMonth(m)}
              >
                <Text style={[styles.tabTxt, selMonth === m && styles.tabActiveTxt]}>
                  {monthLabel(m)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="搜尋類別或備註..."
          placeholderTextColor={COLORS.muted + '80'}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Type Filter Pills */}
      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.filterPill, filterType === opt.key && styles.filterPillActive]}
            onPress={() => setFilterType(opt.key)}
          >
            <Text style={[styles.filterTxt, filterType === opt.key && styles.filterTxtActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Monthly Summary Bar */}
      {filtered.length > 0 && (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryBarItem}>
            <Text style={{ color: COLORS.income, fontWeight: '700' }}>↑ {monthTotalIncome.toLocaleString()}</Text>
          </Text>
          <Text style={styles.summaryBarDivider}>│</Text>
          <Text style={styles.summaryBarItem}>
            <Text style={{ color: COLORS.expense, fontWeight: '700' }}>↓ {monthTotalExpense.toLocaleString()}</Text>
          </Text>
          <Text style={styles.summaryBarDivider}>│</Text>
          <Text style={styles.summaryBarItem}>
            <Text style={{ color: COLORS.muted }}>{filtered.length} 筆</Text>
          </Text>
        </View>
      )}

      {/* Content */}
      {txs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTxt}>還沒有任何記錄</Text>
          <Text style={styles.emptySub}>新增第一筆記帳吧！</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={item => item.date}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const dayIncome = item.txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
            const dayExpense = item.txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
            return (
              <View style={styles.group}>
                <View style={styles.dateHeader}>
                  <Text style={styles.dateLabel}>{dateHeader(item.date)}</Text>
                  <Text style={styles.dateSums}>
                    {dayIncome > 0 && <Text style={{ color: COLORS.income }}>+{dayIncome.toLocaleString()} </Text>}
                    {dayExpense > 0 && <Text style={{ color: COLORS.expense }}>-{dayExpense.toLocaleString()}</Text>}
                  </Text>
                </View>
                {item.txs.map(tx => (
                  <TransactionItem
                    key={tx.id}
                    item={tx}
                    onDelete={handleDelete}
                    onEdit={setEditingTx}
                  />
                ))}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTxt}>
                {searchText ? '找不到符合的記錄' : '這個月沒有記錄'}
              </Text>
            </View>
          }
        />
      )}

      <EditModal
        visible={editingTx !== null}
        transaction={editingTx}
        onClose={() => setEditingTx(null)}
        onSaved={load}
      />

      <AppModal
        visible={pendingDeleteId !== null}
        title="刪除記錄"
        message="確定要刪除這筆記錄？"
        confirmText="刪除"
        danger
        onConfirm={async () => {
          if (pendingDeleteId) {
            await deleteTransaction(pendingDeleteId);
            setTxs(prev => prev.filter(t => t.id !== pendingDeleteId));
          }
          setPendingDeleteId(null);
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  tabsWrap: {
    backgroundColor: COLORS.cardSolid,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabs: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tabTxt: { fontSize: 14, fontWeight: '600', color: COLORS.muted },
  tabActiveTxt: { color: '#fff' },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text, padding: 0 },

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterTxt: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  filterTxtActive: { color: '#fff' },

  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 4,
  },
  summaryBarItem: { fontSize: 13, paddingHorizontal: 4 },
  summaryBarDivider: { fontSize: 13, color: COLORS.border, paddingHorizontal: 2 },

  listContent: { padding: 16, paddingBottom: 100 },
  group: { marginBottom: 18 },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  dateLabel: { fontSize: 13, fontWeight: '700', color: COLORS.muted },
  dateSums: { fontSize: 13 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 14 },
  emptyTxt: { fontSize: 16, fontWeight: '600', color: COLORS.muted },
  emptySub: { fontSize: 13, color: COLORS.muted, marginTop: 6, opacity: 0.7 },
});
