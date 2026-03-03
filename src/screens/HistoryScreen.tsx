import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions, deleteTransaction } from '../storage';
import { Transaction, COLORS } from '../types';
import TransactionItem from '../components/TransactionItem';

interface Group { date: string; txs: Transaction[] }

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

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
    Alert.alert('刪除記錄', '確定要刪除這筆記錄？', [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除', style: 'destructive',
        onPress: async () => {
          await deleteTransaction(id);
          setTxs(prev => prev.filter(t => t.id !== id));
        },
      },
    ]);
  };

  const allMonths = [...new Set(txs.map(t => t.date.slice(0, 7)))].sort((a, b) => b.localeCompare(a));
  const filtered = selMonth ? txs.filter(t => t.date.startsWith(selMonth)) : txs;
  const groups = groupByDate(filtered);

  const monthTotalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const monthTotalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const monthLabel = (m: string) => {
    const [y, mo] = m.split('-');
    return `${parseInt(mo)}月`;
  };

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

      {/* Monthly Summary Bar */}
      {filtered.length > 0 && (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryBarItem}>
            <Text style={{ color: COLORS.income, fontWeight: '700' }}>↑ NT${monthTotalIncome.toLocaleString()}</Text>
          </Text>
          <Text style={styles.summaryBarDivider}>｜</Text>
          <Text style={styles.summaryBarItem}>
            <Text style={{ color: COLORS.expense, fontWeight: '700' }}>↓ NT${monthTotalExpense.toLocaleString()}</Text>
          </Text>
          <Text style={styles.summaryBarDivider}>｜</Text>
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
                  <TransactionItem key={tx.id} item={tx} onDelete={handleDelete} />
                ))}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTxt}>這個月沒有記錄</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  tabsWrap: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabs: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  tab: {
    paddingHorizontal: 18, paddingVertical: 7,
    borderRadius: 20, backgroundColor: COLORS.bg,
  },
  tabActive: { backgroundColor: COLORS.accent },
  tabTxt: { fontSize: 14, fontWeight: '600', color: COLORS.muted },
  tabActiveTxt: { color: '#fff' },

  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryBarItem: { fontSize: 13, paddingHorizontal: 4 },
  summaryBarDivider: { fontSize: 13, color: COLORS.border, paddingHorizontal: 2 },

  listContent: { padding: 16, paddingBottom: 48 },
  group: { marginBottom: 18 },
  dateHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8, paddingHorizontal: 2,
  },
  dateLabel: { fontSize: 13, fontWeight: '700', color: COLORS.muted },
  dateSums: { fontSize: 13 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyEmoji: { fontSize: 52, marginBottom: 14 },
  emptyTxt: { fontSize: 16, fontWeight: '600', color: COLORS.muted },
  emptySub: { fontSize: 13, color: COLORS.muted, marginTop: 6 },
});
