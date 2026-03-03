import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions } from '../storage';
import { Transaction, COLORS } from '../types';
import TransactionItem from '../components/TransactionItem';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function OverviewScreen() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setTxs(await getTransactions());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthlyTxs = txs.filter(t => t.date.startsWith(thisMonth));

  const totalBalance =
    txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) -
    txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const monthIncome = monthlyTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const monthExpense = monthlyTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const monthNet = monthIncome - monthExpense;

  const recent = txs.slice(0, 5);

  const greeting = () => {
    const h = now.getHours();
    if (h < 6) return '深夜了 🌙';
    if (h < 12) return '早安 ☀️';
    if (h < 14) return '午安 🌤️';
    if (h < 18) return '下午好 🌤️';
    return '晚安 🌙';
  };

  const progressPct = monthIncome > 0
    ? Math.min(monthExpense / monthIncome, 1)
    : monthExpense > 0 ? 1 : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.dateLabel}>
              {now.getMonth() + 1}月{now.getDate()}日（{WEEKDAYS[now.getDay()]}）
            </Text>
          </View>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabelTop}>總資產餘額</Text>
          <Text style={[
            styles.balanceAmount,
            { color: totalBalance >= 0 ? '#A8E6CF' : '#FFAAA5' }
          ]}>
            NT$ {Math.abs(totalBalance).toLocaleString()}
            {totalBalance < 0 ? ' ↓' : ''}
          </Text>
          <View style={styles.divider} />
          <View style={styles.balanceRow}>
            <View style={styles.balanceMeta}>
              <Text style={styles.balanceMetaLabel}>本月結餘</Text>
              <Text style={[
                styles.balanceMetaAmt,
                { color: monthNet >= 0 ? '#A8E6CF' : '#FFAAA5' }
              ]}>
                {monthNet >= 0 ? '+' : '-'}NT${Math.abs(monthNet).toLocaleString()}
              </Text>
            </View>
            <View style={styles.balanceMeta}>
              <Text style={styles.balanceMetaLabel}>記錄筆數</Text>
              <Text style={styles.balanceMetaAmt}>{txs.length} 筆</Text>
            </View>
          </View>
        </View>

        {/* Monthly Cards */}
        <View style={styles.row}>
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.cardIcon}>↑</Text>
            <Text style={styles.cardLabel}>本月收入</Text>
            <Text style={[styles.cardAmt, { color: COLORS.income }]}>
              NT${monthIncome.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.card, styles.halfCard]}>
            <Text style={[styles.cardIcon, { color: COLORS.expense }]}>↓</Text>
            <Text style={styles.cardLabel}>本月支出</Text>
            <Text style={[styles.cardAmt, { color: COLORS.expense }]}>
              NT${monthExpense.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Spending Bar */}
        {monthIncome > 0 && (
          <View style={styles.card}>
            <View style={styles.barHeader}>
              <Text style={styles.barLabel}>本月花費進度</Text>
              <Text style={styles.barPct}>{Math.round(progressPct * 100)}%</Text>
            </View>
            <View style={styles.barBg}>
              <View style={[
                styles.barFill,
                {
                  width: `${Math.round(progressPct * 100)}%` as any,
                  backgroundColor: progressPct > 0.9 ? COLORS.expense : progressPct > 0.7 ? '#F39C12' : COLORS.income,
                }
              ]} />
            </View>
            <Text style={styles.barSub}>收入 NT${monthIncome.toLocaleString()} / 支出 NT${monthExpense.toLocaleString()}</Text>
          </View>
        )}

        {/* Recent */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>最近記錄</Text>
          {recent.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>💰</Text>
              <Text style={styles.emptyTxt}>還沒有記帳記錄</Text>
              <Text style={styles.emptySub}>點下方「新增」開始記帳</Text>
            </View>
          ) : (
            recent.map(tx => <TransactionItem key={tx.id} item={tx} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  dateLabel: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  balanceCard: {
    backgroundColor: COLORS.dark,
    borderRadius: 20,
    padding: 24,
    marginBottom: 14,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceLabelTop: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 10 },
  balanceAmount: { fontSize: 40, fontWeight: '800', letterSpacing: -1 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 16 },
  balanceRow: { flexDirection: 'row', gap: 24 },
  balanceMeta: {},
  balanceMetaLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 },
  balanceMetaAmt: { fontSize: 16, fontWeight: '700', color: '#fff' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  halfCard: { flex: 1 },
  cardIcon: { fontSize: 18, color: COLORS.income, marginBottom: 6 },
  cardLabel: { fontSize: 12, color: COLORS.muted, marginBottom: 6 },
  cardAmt: { fontSize: 20, fontWeight: '700' },
  barHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  barLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  barPct: { fontSize: 13, fontWeight: '700', color: COLORS.muted },
  barBg: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  barSub: { fontSize: 11, color: COLORS.muted, marginTop: 8 },
  section: { marginTop: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 52, marginBottom: 14 },
  emptyTxt: { fontSize: 16, fontWeight: '600', color: COLORS.muted },
  emptySub: { fontSize: 13, color: COLORS.muted, marginTop: 6 },
});
