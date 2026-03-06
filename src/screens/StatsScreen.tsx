import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart, LineChart, BarChart } from 'react-native-chart-kit';
import { getTransactions, generateCSV } from '../storage';
import { Transaction, EXPENSE_CATS, INCOME_CATS, COLORS } from '../types';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const W = Dimensions.get('window').width;
const CHART_W = Math.min(W - 48, 345);

type TimePeriod = 'week' | 'month' | 'halfYear' | 'year';

const TIME_TABS: { key: TimePeriod; label: string }[] = [
  { key: 'week', label: '週' },
  { key: 'month', label: '月' },
  { key: 'halfYear', label: '半年' },
  { key: 'year', label: '年' },
];

const chartConfigLine = {
  backgroundColor: 'transparent',
  backgroundGradientFrom: COLORS.cardSolid,
  backgroundGradientTo: COLORS.cardSolid,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(129, 140, 248, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
  propsForDots: { r: '4', strokeWidth: '2', stroke: COLORS.accent },
  propsForBackgroundLines: { strokeDasharray: '4', stroke: 'rgba(148, 163, 184, 0.1)' },
};

const chartConfigBar = {
  backgroundColor: 'transparent',
  backgroundGradientFrom: COLORS.cardSolid,
  backgroundGradientTo: COLORS.cardSolid,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(52, 211, 153, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
  propsForBackgroundLines: { strokeDasharray: '4', stroke: 'rgba(148, 163, 184, 0.1)' },
};

// Helper: get date range for each period
function getDateRange(period: TimePeriod): { start: Date; end: Date; label: string } {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let start: Date;
  let label: string;

  switch (period) {
    case 'week':
      start = new Date(end);
      start.setDate(start.getDate() - 6);
      label = `${start.getMonth() + 1}/${start.getDate()} — ${end.getMonth() + 1}/${end.getDate()}`;
      break;
    case 'month':
      start = new Date(end.getFullYear(), end.getMonth(), 1);
      label = `${end.getFullYear()}年${end.getMonth() + 1}月`;
      break;
    case 'halfYear':
      start = new Date(end);
      start.setMonth(start.getMonth() - 5);
      start.setDate(1);
      label = `近6個月`;
      break;
    case 'year':
      start = new Date(end.getFullYear(), 0, 1);
      label = `${end.getFullYear()}年`;
      break;
  }
  return { start, end, label };
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function filterByRange(txs: Transaction[], start: Date, end: Date): Transaction[] {
  const s = toDateStr(start);
  const e = toDateStr(end);
  return txs.filter(t => t.date >= s && t.date <= e);
}

// Get trend data points based on period
function getTrendData(txs: Transaction[], period: TimePeriod) {
  const now = new Date();
  const labels: string[] = [];
  const expenseValues: number[] = [];
  const incomeValues: number[] = [];

  switch (period) {
    case 'week': {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const ds = toDateStr(d);
        const weekday = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
        labels.push(weekday);
        expenseValues.push(txs.filter(t => t.type === 'expense' && t.date === ds).reduce((s, t) => s + t.amount, 0));
        incomeValues.push(txs.filter(t => t.type === 'income' && t.date === ds).reduce((s, t) => s + t.amount, 0));
      }
      break;
    }
    case 'month': {
      // Split current month into ~4 week blocks
      const y = now.getFullYear();
      const m = now.getMonth();
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const ranges = [
        { start: 1, end: 7, label: '第1週' },
        { start: 8, end: 14, label: '第2週' },
        { start: 15, end: 21, label: '第3週' },
        { start: 22, end: daysInMonth, label: '第4週' },
      ];
      for (const r of ranges) {
        labels.push(r.label);
        const prefix = `${y}-${String(m + 1).padStart(2, '0')}`;
        const inRange = txs.filter(t => {
          if (!t.date.startsWith(prefix)) return false;
          const day = parseInt(t.date.split('-')[2]);
          return day >= r.start && day <= r.end;
        });
        expenseValues.push(inRange.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0));
        incomeValues.push(inRange.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0));
      }
      break;
    }
    case 'halfYear': {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        labels.push(`${d.getMonth() + 1}月`);
        expenseValues.push(txs.filter(t => t.type === 'expense' && t.date.startsWith(prefix)).reduce((s, t) => s + t.amount, 0));
        incomeValues.push(txs.filter(t => t.type === 'income' && t.date.startsWith(prefix)).reduce((s, t) => s + t.amount, 0));
      }
      break;
    }
    case 'year': {
      for (let m = 0; m < 12; m++) {
        const prefix = `${now.getFullYear()}-${String(m + 1).padStart(2, '0')}`;
        labels.push(`${m + 1}月`);
        expenseValues.push(txs.filter(t => t.type === 'expense' && t.date.startsWith(prefix)).reduce((s, t) => s + t.amount, 0));
        incomeValues.push(txs.filter(t => t.type === 'income' && t.date.startsWith(prefix)).reduce((s, t) => s + t.amount, 0));
      }
      break;
    }
  }

  return { labels, expenseValues, incomeValues };
}

export default function StatsScreen() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [period, setPeriod] = useState<TimePeriod>('month');
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setTxs(await getTransactions());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const { start, end, label: periodLabel } = useMemo(() => getDateRange(period), [period]);
  const filtered = useMemo(() => filterByRange(txs, start, end), [txs, start, end]);

  const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const net = income - expense;

  // Pie: expense by category
  const catTotals: Record<string, number> = {};
  filtered.filter(t => t.type === 'expense').forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
  });
  const pieData = EXPENSE_CATS
    .filter(c => catTotals[c.key])
    .map(c => ({
      name: c.key,
      population: catTotals[c.key],
      color: c.color,
      legendFontColor: COLORS.muted,
      legendFontSize: 12,
    }));

  // Trend data
  const trend = useMemo(() => getTrendData(txs, period), [txs, period]);
  const hasExpenseTrend = trend.expenseValues.some(v => v > 0);
  const hasIncomeTrend = trend.incomeValues.some(v => v > 0);

  // Income categories
  const incomeCatTotals: Record<string, number> = {};
  filtered.filter(t => t.type === 'income').forEach(t => {
    incomeCatTotals[t.category] = (incomeCatTotals[t.category] || 0) + t.amount;
  });

  // CSV Export
  const handleExport = async () => {
    if (filtered.length === 0) {
      Alert.alert('提示', '此期間沒有記錄可以匯出');
      return;
    }
    setExporting(true);
    try {
      const csv = generateCSV(filtered);
      const filename = `記帳報表_${periodLabel}.csv`;
      if (Platform.OS === 'web') {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        Alert.alert('匯出成功', `${filename} 已下載`);
      } else {
        const filePath = `${FileSystem.cacheDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(filePath, csv, { encoding: FileSystem.EncodingType.UTF8 });
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(filePath, { mimeType: 'text/csv', UTI: 'public.comma-separated-values-text' });
        }
      }
    } catch {
      Alert.alert('匯出失敗', '請稍後再試');
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>統計分析</Text>
          <TouchableOpacity
            style={[styles.exportBtn, exporting && { opacity: 0.5 }]}
            onPress={handleExport} activeOpacity={0.7} disabled={exporting}
          >
            <Text style={styles.exportTxt}>{exporting ? '匯出中...' : '📤 匯出'}</Text>
          </TouchableOpacity>
        </View>

        {/* Time Period Tabs */}
        <View style={styles.tabRow}>
          {TIME_TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, period === tab.key && styles.tabActive]}
              onPress={() => setPeriod(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabTxt, period === tab.key && styles.tabActiveTxt]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Period Label */}
        <Text style={styles.periodLabel}>{periodLabel}</Text>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderTopColor: COLORS.income }]}>
            <Text style={styles.summaryLabel}>收入</Text>
            <Text style={[styles.summaryAmt, { color: COLORS.income }]}>
              {income > 0 ? `$${income.toLocaleString()}` : '—'}
            </Text>
          </View>
          <View style={[styles.summaryCard, { borderTopColor: COLORS.expense }]}>
            <Text style={styles.summaryLabel}>支出</Text>
            <Text style={[styles.summaryAmt, { color: COLORS.expense }]}>
              {expense > 0 ? `$${expense.toLocaleString()}` : '—'}
            </Text>
          </View>
          <View style={[styles.summaryCard, { borderTopColor: COLORS.accent }]}>
            <Text style={styles.summaryLabel}>結餘</Text>
            <Text style={[styles.summaryAmt, { color: net >= 0 ? COLORS.income : COLORS.expense }]}>
              {income === 0 && expense === 0 ? '—' : `$${net.toLocaleString()}`}
            </Text>
          </View>
        </View>

        {/* Expense Pie */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>支出分類佔比</Text>
          {pieData.length > 0 ? (
            <>
              <PieChart
                data={pieData}
                width={CHART_W}
                height={180}
                chartConfig={chartConfigLine}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="10"
                absolute={false}
              />
              <View style={styles.legendList}>
                {pieData.map(d => (
                  <View key={d.name} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                    <Text style={styles.legendName}>{d.name}</Text>
                    <Text style={styles.legendAmt}>${d.population.toLocaleString()}</Text>
                    <Text style={styles.legendPct}>{Math.round((d.population / expense) * 100)}%</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.noData}>
              <Text style={styles.noDataEmoji}>📊</Text>
              <Text style={styles.noDataTxt}>此期間尚無支出記錄</Text>
            </View>
          )}
        </View>

        {/* Income Category */}
        {income > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>收入來源</Text>
            {INCOME_CATS.filter(c => incomeCatTotals[c.key]).map(c => {
              const pct = incomeCatTotals[c.key] / income;
              return (
                <View key={c.key} style={styles.incomeRow}>
                  <Text style={styles.incomeIcon}>{c.icon}</Text>
                  <View style={styles.incomeBarWrap}>
                    <View style={styles.incomeBarHeader}>
                      <Text style={styles.incomeCatName}>{c.key}</Text>
                      <Text style={styles.incomeCatAmt}>${incomeCatTotals[c.key].toLocaleString()}</Text>
                    </View>
                    <View style={styles.incomeBarBg}>
                      <View style={[styles.incomeBarFill, { width: `${Math.round(pct * 100)}%` as any, backgroundColor: COLORS.accent }]} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Expense Trend Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>支出趨勢</Text>
          {hasExpenseTrend ? (
            <LineChart
              data={{
                labels: trend.labels,
                datasets: [{ data: trend.expenseValues.map(v => Math.max(v, 0)), strokeWidth: 2.5 }],
              }}
              width={CHART_W}
              height={170}
              chartConfig={chartConfigLine}
              bezier
              style={styles.chart}
              withInnerLines
              withOuterLines={false}
            />
          ) : (
            <View style={styles.noData}>
              <Text style={styles.noDataEmoji}>📈</Text>
              <Text style={styles.noDataTxt}>尚無支出資料</Text>
            </View>
          )}
        </View>

        {/* Income Trend Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>收入趨勢</Text>
          {hasIncomeTrend ? (
            <BarChart
              data={{
                labels: trend.labels,
                datasets: [{ data: trend.incomeValues.map(v => Math.max(v, 0)) }],
              }}
              width={CHART_W}
              height={170}
              chartConfig={chartConfigBar}
              style={styles.chart}
              withInnerLines
              showValuesOnTopOfBars={false}
              yAxisLabel=""
              yAxisSuffix=""
              fromZero
            />
          ) : (
            <View style={styles.noData}>
              <Text style={styles.noDataEmoji}>💰</Text>
              <Text style={styles.noDataTxt}>尚無收入資料</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingBottom: 100 },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, letterSpacing: -0.3 },
  exportBtn: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  exportTxt: { fontSize: 13, fontWeight: '700', color: COLORS.accent },

  // Time Period Tabs
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.accent,
  },
  tabTxt: { fontSize: 14, fontWeight: '700', color: COLORS.muted },
  tabActiveTxt: { color: '#fff' },

  periodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 16,
  },

  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    borderTopWidth: 3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryLabel: { fontSize: 11, color: COLORS.muted, marginBottom: 6 },
  summaryAmt: { fontSize: 14, fontWeight: '700', textAlign: 'center' },

  chartCard: {
    backgroundColor: COLORS.cardSolid,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chartTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  chart: { borderRadius: 12, marginLeft: -10 },

  legendList: { marginTop: 4 },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  legendName: { flex: 1, fontSize: 13, color: COLORS.text },
  legendAmt: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginRight: 8 },
  legendPct: { fontSize: 12, color: COLORS.muted, minWidth: 36, textAlign: 'right' },

  incomeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  incomeIcon: { fontSize: 22, marginRight: 12 },
  incomeBarWrap: { flex: 1 },
  incomeBarHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  incomeCatName: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  incomeCatAmt: { fontSize: 13, color: COLORS.muted },
  incomeBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' },
  incomeBarFill: { height: 6, borderRadius: 3 },

  noData: { alignItems: 'center', paddingVertical: 32 },
  noDataEmoji: { fontSize: 36, marginBottom: 10 },
  noDataTxt: { fontSize: 14, color: COLORS.muted },
});
