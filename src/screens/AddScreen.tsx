import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { saveTransaction, toDateStr } from '../storage';
import { TxType, Transaction, EXPENSE_CATS, INCOME_CATS, COLORS } from '../types';
import DatePickerField from '../components/DatePickerField';

export default function AddScreen() {
  const [type, setType] = useState<TxType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());

  const cats = type === 'expense' ? EXPENSE_CATS : INCOME_CATS;

  const reset = () => {
    setAmount('');
    setCategory('');
    setNote('');
    setDate(new Date());
    setType('expense');
  };

  const handleSave = async () => {
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) {
      Alert.alert('提示', '請輸入有效金額');
      return;
    }
    if (!category) {
      Alert.alert('提示', '請選擇類別');
      return;
    }
    const tx: Transaction = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      amount: Math.round(num * 100) / 100,
      category,
      note: note.trim(),
      date: toDateStr(date),
      createdAt: new Date().toISOString(),
    };
    await saveTransaction(tx);
    Alert.alert('記帳完成', `${type === 'expense' ? '支出' : '收入'} NT$${num.toLocaleString()} 已儲存`, [
      { text: '繼續記帳', onPress: reset },
    ]);
  };

  const handleTypeChange = (t: TxType) => {
    setType(t);
    setCategory('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>新增記帳</Text>

        {/* Type Toggle — Pill Segmented Control */}
        <View style={styles.toggleWrap}>
          {(['expense', 'income'] as TxType[]).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.toggleBtn, type === t && styles.toggleBtnActive]}
              onPress={() => handleTypeChange(t)}
            >
              <Text style={[styles.toggleTxt, type === t && styles.toggleActiveTxt]}>
                {t === 'expense' ? '💸 支出' : '💰 收入'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount Input */}
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
              autoFocus
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

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveTxt}>確認記帳</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: 20 },

  toggleWrap: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleBtn: { flex: 1, paddingVertical: 11, borderRadius: 11, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: COLORS.accent },
  toggleTxt: { fontSize: 16, fontWeight: '600', color: COLORS.muted },
  toggleActiveTxt: { color: '#fff' },

  amountCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  amountHint: { fontSize: 12, color: COLORS.muted, marginBottom: 8 },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  currency: { fontSize: 32, fontWeight: '700', marginRight: 4 },
  amountInput: { fontSize: 48, fontWeight: '800', flex: 1, padding: 0 },

  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 10 },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catBtn: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  catIcon: { fontSize: 24, marginBottom: 4 },
  catLabel: { fontSize: 11, color: COLORS.text, fontWeight: '500' },

  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fieldIcon: { fontSize: 18, marginRight: 12 },
  noteInput: { flex: 1, fontSize: 15, color: COLORS.text, padding: 0 },

  saveBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  saveTxt: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
});
