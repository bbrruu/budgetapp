import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Transaction, TxType, EXPENSE_CATS, INCOME_CATS, COLORS } from '../types';
import { updateTransaction, toDateStr } from '../storage';
import DatePickerField from './DatePickerField';

interface Props {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditModal({ visible, transaction, onClose, onSaved }: Props) {
  const [type, setType] = useState<TxType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(String(transaction.amount));
      setCategory(transaction.category);
      setNote(transaction.note);
      const [y, m, d] = transaction.date.split('-').map(Number);
      setDate(new Date(y, m - 1, d));
    }
  }, [transaction]);

  const cats = type === 'expense' ? EXPENSE_CATS : INCOME_CATS;

  const handleTypeChange = (t: TxType) => {
    setType(t);
    setCategory('');
  };

  const handleSave = async () => {
    if (!transaction) return;
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) {
      Alert.alert('提示', '請輸入有效金額');
      return;
    }
    if (!category) {
      Alert.alert('提示', '請選擇類別');
      return;
    }
    await updateTransaction(transaction.id, {
      type,
      amount: Math.round(num * 100) / 100,
      category,
      note: note.trim(),
      date: toDateStr(date),
    });
    onSaved();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kvWrap}
        >
          <View style={styles.sheet}>
            {/* Handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>編輯記帳</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeTxt}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Type Toggle */}
              <View style={styles.toggleWrap}>
                {(['expense', 'income'] as TxType[]).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.toggleBtn,
                      type === t && { backgroundColor: COLORS.accent },
                    ]}
                    onPress={() => handleTypeChange(t)}
                  >
                    <Text style={[styles.toggleTxt, type === t && styles.toggleActiveTxt]}>
                      {t === 'expense' ? '💸 支出' : '💰 收入'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Amount */}
              <View style={styles.amountCard}>
                <Text style={styles.amountHint}>金額（NT$）</Text>
                <View style={styles.amountRow}>
                  <Text style={[styles.currency, { color: COLORS.accent }]}>$</Text>
                  <TextInput
                    style={[styles.amountInput, { color: COLORS.accent }]}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={COLORS.border}
                    maxLength={12}
                  />
                </View>
              </View>

              {/* Category Grid */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>類別</Text>
                <View style={styles.catGrid}>
                  {cats.map(cat => {
                    const selected = category === cat.key;
                    return (
                      <TouchableOpacity
                        key={cat.key}
                        style={[
                          styles.catBtn,
                          selected && {
                            backgroundColor: COLORS.accent + '18',
                            borderColor: COLORS.accent,
                            borderWidth: 2,
                          },
                        ]}
                        onPress={() => setCategory(cat.key)}
                      >
                        <Text style={styles.catIcon}>{cat.icon}</Text>
                        <Text style={[styles.catLabel, selected && { color: COLORS.accent, fontWeight: '700' }]}>
                          {cat.key}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Date */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>日期</Text>
                <DatePickerField value={date} onChange={setDate} />
              </View>

              {/* Note */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>備註（選填）</Text>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldIcon}>✏️</Text>
                  <TextInput
                    style={styles.noteInput}
                    value={note}
                    onChangeText={setNote}
                    placeholder="輸入備註..."
                    placeholderTextColor={COLORS.muted}
                    maxLength={60}
                  />
                </View>
              </View>

              {/* Save */}
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
                <Text style={styles.saveTxt}>儲存修改</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  kvWrap: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 36,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  closeBtn: { padding: 4 },
  closeTxt: { fontSize: 16, color: COLORS.muted },

  toggleWrap: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center' },
  toggleTxt: { fontSize: 15, fontWeight: '600', color: COLORS.muted },
  toggleActiveTxt: { color: '#fff' },

  amountCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  amountHint: { fontSize: 12, color: COLORS.muted, marginBottom: 6 },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  currency: { fontSize: 28, fontWeight: '700', marginRight: 4 },
  amountInput: { fontSize: 40, fontWeight: '800', flex: 1, padding: 0 },

  section: { marginBottom: 18 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 10 },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catBtn: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  catIcon: { fontSize: 22, marginBottom: 4 },
  catLabel: { fontSize: 11, color: COLORS.text, fontWeight: '500' },

  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fieldIcon: { fontSize: 16, marginRight: 10 },
  noteInput: { flex: 1, fontSize: 15, color: COLORS.text, padding: 0 },

  saveBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  saveTxt: { fontSize: 17, fontWeight: '800', color: '#fff' },
});
