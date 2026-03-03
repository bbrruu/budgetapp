import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Transaction, EXPENSE_CATS, INCOME_CATS, COLORS } from '../types';
import { formatDateShort } from '../storage';

interface Props {
  item: Transaction;
  onDelete?: (id: string) => void;
  onEdit?: (tx: Transaction) => void;
}

export default function TransactionItem({ item, onDelete, onEdit }: Props) {
  const cats = item.type === 'expense' ? EXPENSE_CATS : INCOME_CATS;
  const cat = cats.find(c => c.key === item.category) ?? { icon: '💸', color: '#9CA3AF' };
  const isIncome = item.type === 'income';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onEdit?.(item)}
      activeOpacity={onEdit ? 0.7 : 1}
    >
      <View style={[styles.iconBg, { backgroundColor: cat.color + '20' }]}>
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
    </TouchableOpacity>
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
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 21 },
  info: { flex: 1, marginLeft: 12 },
  category: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  note: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  amount: { fontSize: 15, fontWeight: '700' },
  date: { fontSize: 12, color: COLORS.muted, marginTop: 3 },
  deleteBtn: { marginLeft: 12, padding: 4 },
  deleteTxt: { fontSize: 13, color: COLORS.muted },
});
