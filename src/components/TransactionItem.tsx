import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Transaction, EXPENSE_CATS, INCOME_CATS, COLORS } from '../types';
import { formatDateShort } from '../storage';

interface Props {
  item: Transaction;
  onDelete?: (id: string) => void;
}

export default function TransactionItem({ item, onDelete }: Props) {
  const cats = item.type === 'expense' ? EXPENSE_CATS : INCOME_CATS;
  const cat = cats.find(c => c.key === item.category) ?? { icon: '💸', color: '#999' };
  const isIncome = item.type === 'income';

  return (
    <View style={styles.container}>
      <View style={[styles.iconBg, { backgroundColor: cat.color + '28' }]}>
        <Text style={styles.icon}>{cat.icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.category}>{item.category}</Text>
        {item.note ? (
          <Text style={styles.note} numberOfLines={1}>{item.note}</Text>
        ) : null}
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: isIncome ? COLORS.income : COLORS.expense }]}>
          {isIncome ? '+' : '-'}NT${item.amount.toLocaleString()}
        </Text>
        <Text style={styles.date}>{formatDateShort(item.date)}</Text>
      </View>
      {onDelete && (
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item.id)} hitSlop={8}>
          <Text style={styles.deleteTxt}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBg: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 22 },
  info: { flex: 1, marginLeft: 12 },
  category: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  note: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  amount: { fontSize: 16, fontWeight: '700' },
  date: { fontSize: 12, color: COLORS.muted, marginTop: 3 },
  deleteBtn: { marginLeft: 12, padding: 4 },
  deleteTxt: { fontSize: 13, color: COLORS.muted },
});
