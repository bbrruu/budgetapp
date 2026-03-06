import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions, getBudgetSettings, clearAllData } from '../storage';
import { Transaction, BudgetSettings, COLORS } from '../types';
import TransactionItem from '../components/TransactionItem';
import EditModal from '../components/EditModal';
import BudgetModal from '../components/BudgetModal';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function OverviewScreen() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [budgetSettings, setBudgetSettings] = useState<BudgetSettings>({ monthlyBudget: 0 });
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  const load = useCallback(async () => {
    setTxs(await getTransactions());
    setBudgetSettings(await getBudgetSettings());
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

  const recent = txs.slice(0, 4);

  const greeting = () => {
    const h = now.getHours();
    if (h < 6) return '🌙 深夜了';
    if (h < 12) return '☀️ 早安';
    if (h < 14) return '🌤️ 午安';
    if (h < 18) return '🌇 下午好';
    return '🌃 晚安';
  };

  // Budget-based progress
  const hasBudget = budgetSettings.monthlyBudget > 0;
  const budgetBase = hasBudget ? budgetSettings.monthlyBudget : monthIncome;
  const progressPct = budgetBase > 0
    ? Math.min(monthExpense / budgetBase, 1)
    : monthExpense > 0 ? 1 : 0;

  const progressColor = progressPct > 0.9 ? COLORS.expense : progressPct > 0.7 ? '#FBBF24' : COLORS.accentCyan;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting()}</Text>
          <Text style={styles.dateLabel}>
            {now.getMonth() + 1}月{now.getDate()}日（{WEEKDAYS[now.getDay()]}）
          </Text>
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={['rgba(129, 140, 248, 0.15)', 'rgba(34, 211, 238, 0.08)', 'rgba(15, 23, 42, 0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>總資產餘額</Text>
          <Text style={styles.balanceAmount}>
            <Text style={{ color: COLORS.muted, fontSize: 24 }}>NT$ </Text>
            <Text style={{ color: totalBalance >= 0 ? COLORS.text : COLORS.expense }}>
              {Math.abs(totalBalance).toLocaleString()}
            </Text>
          </Text>

          {/* Inline income / expense */}
          <View style={styles.inlineRow}>
            <View style={styles.inlineItem}>
              <View style={[styles.dot, { backgroundColor: COLORS.income }]} />
              <Text style={styles.inlineLabel}>收入</Text>
              <Text style={[styles.inlineAmt, { color: COLORS.income }]}>
                +{monthIncome.toLocaleString()}
              </Text>
            </View>
            <View style={styles.inlineDivider} />
            <View style={styles.inlineItem}>
              <View style={[styles.dot, { backgroundColor: COLORS.expense }]} />
              <Text style={styles.inlineLabel}>支出</Text>
              <Text style={[styles.inlineAmt, { color: COLORS.expense }]}>
                -{monthExpense.toLocaleString()}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Progress Bar */}
        {(hasBudget || monthIncome > 0) && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                {hasBudget ? '預算使用' : '花費進度'}
              </Text>
              <Text style={[styles.progressPct, { color: progressColor }]}>
                {Math.round(progressPct * 100)}%
              </Text>
            </View>
            <View style={styles.progressBg}>
              <LinearGradient
                colors={[progressColor, progressColor + '80']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${Math.round(progressPct * 100)}%` as any }]}
              />
            </View>
            <Text style={styles.progressSub}>
              {hasBudget
                ? `NT$${monthExpense.toLocaleString()} / ${budgetSettings.monthlyBudget.toLocaleString()}`
                : `NT$${monthExpense.toLocaleString()} / ${monthIncome.toLocaleString()}`
              }
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { flex: 1 }]}
            onPress={() => setShowBudgetModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionBtnIcon}>🎯</Text>
            <Text style={styles.actionBtnTxt}>
              {hasBudget ? `預算 $${budgetSettings.monthlyBudget.toLocaleString()}` : '設定預算'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              Alert.alert(
                '重置所有資料',
                '確定要刪除所有記帳記錄和預算設定嗎？此操作無法復原。',
                [
                  { text: '取消', style: 'cancel' },
                  {
                    text: '確認重置', style: 'destructive',
                    onPress: async () => {
                      await clearAllData();
                      await load();
                    },
                  },
                ]
              );
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.actionBtnIcon}>🔄</Text>
            <Text style={[styles.actionBtnTxt, { color: COLORS.expense }]}>重置</Text>
          </TouchableOpacity>
        </View>

        {/* Recent */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>最近記錄</Text>
          {recent.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>✨</Text>
              <Text style={styles.emptyTxt}>還沒有記帳記錄</Text>
              <Text style={styles.emptySub}>點下方「新增」開始記帳</Text>
            </View>
          ) : (
            recent.map(tx => (
              <TransactionItem key={tx.id} item={tx} onEdit={setEditingTx} />
            ))
          )}
        </View>
      </ScrollView>

      <EditModal
        visible={editingTx !== null}
        transaction={editingTx}
        onClose={() => setEditingTx(null)}
        onSaved={load}
      />

      <BudgetModal
        visible={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        onSaved={load}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },

  header: { marginBottom: 24, marginTop: 8 },
  greeting: { fontSize: 28, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  dateLabel: { fontSize: 13, color: COLORS.muted, marginTop: 4 },

  // Balance
  balanceCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  balanceLabel: { fontSize: 12, color: COLORS.muted, marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' },
  balanceAmount: { fontSize: 38, fontWeight: '800', color: COLORS.text, letterSpacing: -1, marginBottom: 20 },

  inlineRow: { flexDirection: 'row', alignItems: 'center' },
  inlineItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  inlineDivider: { width: 1, height: 24, backgroundColor: COLORS.border, marginHorizontal: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  inlineLabel: { fontSize: 12, color: COLORS.muted, marginRight: 8 },
  inlineAmt: { fontSize: 15, fontWeight: '700' },

  // Progress
  progressCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  progressPct: { fontSize: 13, fontWeight: '700' },
  progressBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  progressSub: { fontSize: 11, color: COLORS.muted, marginTop: 8 },

  // Action Buttons
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtnIcon: { fontSize: 16, marginRight: 8 },
  actionBtnTxt: { fontSize: 13, fontWeight: '700', color: COLORS.text },

  // Section
  section: { marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12, letterSpacing: 0.3 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTxt: { fontSize: 15, fontWeight: '600', color: COLORS.muted },
  emptySub: { fontSize: 12, color: COLORS.muted, marginTop: 4, opacity: 0.7 },
});
