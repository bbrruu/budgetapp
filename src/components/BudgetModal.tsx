import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../types';
import { getBudgetSettings, saveBudgetSettings } from '../storage';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function BudgetModal({ visible, onClose, onSaved }: Props) {
  const [budget, setBudget] = useState('');

  useEffect(() => {
    if (visible) {
      getBudgetSettings().then(settings => {
        setBudget(settings.monthlyBudget > 0 ? String(settings.monthlyBudget) : '');
      });
    }
  }, [visible]);

  const handleSave = async () => {
    const num = parseFloat(budget);
    if (budget && !isNaN(num) && num > 0) {
      await saveBudgetSettings({ monthlyBudget: Math.round(num) });
    } else {
      await saveBudgetSettings({ monthlyBudget: 0 });
    }
    onSaved();
    onClose();
  };

  const handleClear = async () => {
    setBudget('');
    await saveBudgetSettings({ monthlyBudget: 0 });
    onSaved();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kvWrap}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={styles.title}>每月預算設定</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeTxt}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.desc}>設定每月預算上限，概覽頁的花費進度條將以此為基準顯示。</Text>
            <View style={styles.inputCard}>
              <Text style={styles.inputHint}>每月預算（NT$）</Text>
              <View style={styles.inputRow}>
                <Text style={styles.currency}>$</Text>
                <TextInput
                  style={styles.input}
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="number-pad"
                  placeholder="例如：30000"
                  placeholderTextColor={COLORS.muted + '40'}
                  maxLength={10}
                  autoFocus
                />
              </View>
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={styles.saveTxt}>儲存預算</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear} activeOpacity={0.7}>
              <Text style={styles.clearTxt}>清除預算</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  kvWrap: { justifyContent: 'flex-end' },
  sheet: { backgroundColor: COLORS.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingBottom: 36 },
  handle: { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  closeBtn: { padding: 4 },
  closeTxt: { fontSize: 16, color: COLORS.muted },
  desc: { fontSize: 13, color: COLORS.muted, lineHeight: 20, marginBottom: 20 },
  inputCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: COLORS.border },
  inputHint: { fontSize: 12, color: COLORS.muted, marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  currency: { fontSize: 32, fontWeight: '700', color: COLORS.accent, marginRight: 4 },
  input: { fontSize: 40, fontWeight: '800', color: COLORS.text, flex: 1, padding: 0 },
  saveBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 17, alignItems: 'center', marginBottom: 12, shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 5 },
  saveTxt: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  clearBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  clearTxt: { fontSize: 15, fontWeight: '600', color: COLORS.muted },
});
