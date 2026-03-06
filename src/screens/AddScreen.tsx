import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Animated,
} from 'react-native';
import { saveTransaction, toDateStr } from '../storage';
import { TxType, Transaction, EXPENSE_CATS, INCOME_CATS, COLORS } from '../types';
import DatePickerField from '../components/DatePickerField';
import SuccessToast from '../components/SuccessToast';

function AnimatedCatButton({
  cat,
  selected,
  onPress,
}: {
  cat: { key: string; icon: string; color: string };
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 0.88,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ width: '22%', transform: [{ scale }] }}>
      <TouchableOpacity
        style={[
          styles.catBtn,
          selected && {
            backgroundColor: COLORS.accent + '25',
            borderColor: COLORS.accent,
            borderWidth: 1.5,
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={styles.catIcon}>{cat.icon}</Text>
        <Text style={[styles.catLabel, selected && { color: COLORS.accent, fontWeight: '700' }]}>
          {cat.key}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function AddScreen() {
  const [type, setType] = useState<TxType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

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
    const typeLabel = type === 'expense' ? '支出' : '收入';
    setToastMsg(`${typeLabel} NT$${num.toLocaleString()} — ${category}`);
    setToastVisible(true);
  };

  const handleToastHide = () => {
    setToastVisible(false);
    reset();
  };

  const handleTypeChange = (t: TxType) => {
    setType(t);
    setCategory('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>新增記帳</Text>

        {/* Type Toggle */}
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
              style={[styles.amountInput, { color: COLORS.text }]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={COLORS.muted + '40'}
              maxLength={12}
              autoFocus
            />
          </View>
        </View>

        {/* Category Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>類別</Text>
          <View style={styles.catGrid}>
            {cats.map(cat => (
              <AnimatedCatButton
                key={cat.key}
                cat={cat}
                selected={category === cat.key}
                onPress={() => setCategory(cat.key)}
              />
            ))}
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
              placeholderTextColor={COLORS.muted + '80'}
              maxLength={60}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveTxt}>確認記帳</Text>
        </TouchableOpacity>
      </ScrollView>

      <SuccessToast visible={toastVisible} message={toastMsg} onHide={handleToastHide} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  content: { flexGrow: 1, padding: 20, paddingBottom: 100 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: 20, letterSpacing: -0.3 },

  toggleWrap: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  },
  amountHint: { fontSize: 12, color: COLORS.muted, marginBottom: 8 },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  currency: { fontSize: 32, fontWeight: '700', marginRight: 4 },
  amountInput: { fontSize: 44, fontWeight: '800', flex: 1, padding: 0 },

  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 10 },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catBtn: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
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
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  saveTxt: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
});
