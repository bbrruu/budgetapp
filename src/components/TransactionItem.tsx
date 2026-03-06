import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    <View style={styles.container}>
      {/* Main content area — tappable for edit */}
      <TouchableOpacity
        style={styles.mainArea}
        onPress={() => onEdit?.(item)}
        activeOpacity={onEdit ? 0.7 : 1}
      >
        <View style={[styles.iconBg, { backgroundColor: cat.color + '25' }]}>
          <Ionicons name={cat.icon as any} size={20} color={cat.color} />
        </View>
        <View style={styles.info}>
          <Text style={styles.category}>{item.category}</Text>
          {item.note ? (
            <Text style={styles.note} numberOfLines={1}>{item.note}</Text>
          ) : null}
        </View>
        <View style={styles.right}>
          <Text style={[styles.amount, { color: isIncome ? COLORS.income : COLORS.expense }]}>
            {isIncome ? '+' : '-'}${item.amount.toLocaleString()}
          </Text>
          <Text style={styles.date}>{formatDateShort(item.date)}</Text>
        </View>
      </TouchableOpacity>

      {/* Delete button — separate touchable, not nested */}
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={(e) => {
            e.stopPropagation?.();
            onDelete(item.id);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
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
    marginVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mainArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, marginLeft: 12 },
  category: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  note: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  amount: { fontSize: 14, fontWeight: '700' },
  date: { fontSize: 11, color: COLORS.muted, marginTop: 3 },
  deleteBtn: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteTxt: { fontSize: 14, color: COLORS.muted, fontWeight: '600' },
});
