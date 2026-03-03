import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart, LineChart, BarChart } from 'react-native-chart-kit';
import { getTransactions } from '../storage';
import { Transaction, EXPENSE_CATS, INCOME_CATS, COLORS } from '../types';

const W = Dimensions.get('window').width;
const CHART_W = W - 48;

const chartConfigLine = {
  backgroundColor: '#fff',
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(127, 140, 141, ${opacity})`,
  propsForDots: { r: '4', strokeWidth: '2', stroke: COLORS.expense },
  propsForBackgroundLines: { strokeDasharray: '4', stroke: '#ECE9E0' },
};

const chartConfigBar = {
  backgroundColor: '#fff',
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(39, 174, 96, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(127, 140, 141, ${opacity})`,
  propsForBackgroundLines: { strokeDasharray: '4', stroke: '#ECE9E0' },
};

export default function StatsScreen() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const load = useCallback(async () => {
    setTxs(await getTransactions());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const monthlyTxs = txs.filter(t => t.date.startsWith(monthStr));

  const income = monthlyTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = monthlyTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const net = income - expense;

  // Pie chart: expense by category
  const catTotals: Record<string, number> = {};
  monthlyTxs.filter(t => t.type === 'expense').forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
  });
  const pieData = EXPENSE_CATS
    .filter(c => catTotals[c.key])
    .map(c => ({
      name: c.key,
      population: catTotals[c.key],
      color: c.color,
      legendFontColor: COLORS.text,
      legendFontSize: 12,
    }));

  // Line chart: last 6 months expense
  const now = new Date();
  const months6: string[] = [];
  const labels6: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months6.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    labels6.push(`${d.getMonth() + 1}月`);
  }
  const lineValues = months6.map(m =>
    txs.filter(t => t.type === 'expense' && t.date.startsWith(m)).reduce((s, t) => s + t.amount, 0)
  );
  const barValues = months6.map(m =>
    txs.filter(t => t.type === 'income' && t.date.startsWith(m)).reduce((s, t) => s + t.amount, 0)
  );
  const hasAnyExpense = lineValues.some(v => v > 0);
  const hasAnyIncome = barValues.some(v => v > 0);

  // Income cat totals
  const incomeCatTotals: Record<string, number> = {};
  monthlyTxs.filter(t => t.type === 'income').forEach(t => {
    incomeCatTotals[t.category] = (incomeCatTotals[t.category] || 0) + t.amount;
  });

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    const n = new Date();
    if (year === n.getFullYear() && month === n.getMonth() + 1) return;
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>統計分析</Text>

        {/* Month Selector */}
        <View style={styles.monthRow}>
          <TouchableOpacity style={styles.arrow} onPress={prevMonth}>
            <Text style={styles.arrowTxt}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{year}年{month}月</Text>
          <TouchableOpacity style={styles.arrow} onPress={nextMonth}>
            <Text style={styles.arrowTxt}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderTopColor: COLORS.income }]}>
            <Text style={styles.summaryIcon}>↑</Text>
            <Text style={styles.summaryLabel}>收入</Text>
            <Text style={[styles.summaryAmt, { color: COLORS.income }]}>
              {income > 0 ? `NT$${income.toLocaleString()}` : '—'}
            </Text>
          </View>
          <View style={[styles.summaryCard, { borderTopColor: COLORS.expense }]}>
            <Text style={[styles.summaryIcon, { color: COLORS.expense }]}>↓</Text>
            <Text style={styles.summaryLabel}>支出</Text>
            <Text style={[styles.summaryAmt, { color: COLORS.expense }]}>
              {expense > 0 ? `NT$${expense.toLocaleString()}` : '—'}
            </Text>
          </View>
          <View style={[styles.summaryCard, { borderTopColor: COLORS.accent }]}>
            <Text style={[styles.summaryIcon, { color: COLORS.accent }]}>≈</Text>
            <Text style={styles.summaryLabel}>結餘</Text>
            <Text style={[styles.summaryAmt, { color: net >= 0 ? COLORS.income : COLORS.expense }]}>
              {income === 0 && expense === 0 ? '—' : `NT$${net.toLocaleString()}`}
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
                height={190}
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
                    <Text style={styles.legendAmt}>NT${d.population.toLocaleString()}</Text>
                    <Text style={styles.legendPct}>
                      {Math.round((d.population / expense) * 100)}%
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.noData}>
              <Text style={styles.noDataEmoji}>📊</Text>
              <Text style={styles.noDataTxt}>本月尚無支出記錄</Text>
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
                      <Text style={styles.incomeCatAmt}>NT${incomeCatTotals[c.key].toLocaleString()}</Text>
                    </View>
                    <View style={styles.incomeBarBg}>
                      <View style={[styles.incomeBarFill, { width: `${Math.round(pct * 100)}%` as any, backgroundColor: c.color }]} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* 6-Month Expense Trend */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>近6個月支出趨勢</Text>
          {hasAnyExpense ? (
            <LineChart
              data={{
                labels: labels6,
                datasets: [{ data: lineValues.map(v => Math.max(v, 0)), strokeWidth: 2.5 }],
              }}
              width={CHART_W}
              height={180}
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

        {/* 6-Month Income Bar */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>近6個月收入</Text>
          {hasAnyIncome ? (
            <BarChart
              data={{
                labels: labels6,
                datasets: [{ data: barValues.map(v => Math.max(v, 0)) }],
              }}
              width={CHART_W}
              height={180}
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
  content: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 20 },

  monthRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.card, borderRadius: 14, paddingVertical: 6,
    marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  arrow: { paddingHorizontal: 20, paddingVertical: 6 },
  arrowTxt: { fontSize: 30, color: COLORS.accent, lineHeight: 34 },
  monthLabel: { fontSize: 18, fontWeight: '700', color: COLORS.text, minWidth: 120, textAlign: 'center' },

  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryCard: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: 14, padding: 14,
    borderTopWidth: 3, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  summaryIcon: { fontSize: 18, color: COLORS.income, marginBottom: 4 },
  summaryLabel: { fontSize: 11, color: COLORS.muted, marginBottom: 6 },
  summaryAmt: { fontSize: 14, fontWeight: '700', textAlign: 'center' },

  chartCard: {
    backgroundColor: COLORS.card, borderRadius: 18, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  chartTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  chart: { borderRadius: 12, marginLeft: -10 },

  legendList: { marginTop: 4 },
  legendRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderTopWidth: 1, borderTopColor: COLORS.border },
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
  incomeBarBg: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  incomeBarFill: { height: 6, borderRadius: 3 },

  noData: { alignItems: 'center', paddingVertical: 32 },
  noDataEmoji: { fontSize: 36, marginBottom: 10 },
  noDataTxt: { fontSize: 14, color: COLORS.muted },
});
