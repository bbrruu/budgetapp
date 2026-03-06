import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions, getBudgetSettings, clearTransactions, generateCSV } from '../storage';
import { BudgetSettings, COLORS } from '../types';
import BudgetModal from '../components/BudgetModal';
import AppModal from '../components/AppModal';

type ModalState = 'none' | 'resetConfirm' | 'resetDone' | 'exportDone' | 'exportEmpty' | 'exportError';

export default function SettingsScreen() {
  const [budgetSettings, setBudgetSettings] = useState<BudgetSettings>({ monthlyBudget: 0 });
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [modal, setModal] = useState<ModalState>('none');

  const load = useCallback(async () => {
    setBudgetSettings(await getBudgetSettings());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const hasBudget = budgetSettings.monthlyBudget > 0;

  const handleExport = async () => {
    try {
      const txs = await getTransactions();
      if (txs.length === 0) {
        setModal('exportEmpty');
        return;
      }
      const csv = generateCSV(txs);
      if (Platform.OS === 'web') {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = '記帳記錄.csv';
        link.click();
        URL.revokeObjectURL(url);
      } else {
        const FileSystem = require('expo-file-system');
        const Sharing = require('expo-sharing');
        const filePath = `${FileSystem.cacheDirectory}記帳記錄.csv`;
        await FileSystem.writeAsStringAsync(filePath, csv, { encoding: FileSystem.EncodingType.UTF8 });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(filePath, { mimeType: 'text/csv' });
        }
      }
      setModal('exportDone');
    } catch {
      setModal('exportError');
    }
  };

  const handleResetConfirm = async () => {
    setModal('none');
    await clearTransactions();
    setModal('resetDone');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>設定</Text>

        <Text style={styles.sectionLabel}>記帳管理</Text>
        <View style={styles.group}>
          <TouchableOpacity style={styles.row} onPress={() => setShowBudgetModal(true)} activeOpacity={0.7}>
            <View style={[styles.iconWrap, { backgroundColor: COLORS.accent + '18' }]}>
              <Ionicons name="flag-outline" size={18} color={COLORS.accent} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>每月預算</Text>
              <Text style={styles.rowValue}>
                {hasBudget ? `NT$ ${budgetSettings.monthlyBudget.toLocaleString()}` : '尚未設定'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={handleExport} activeOpacity={0.7}>
            <View style={[styles.iconWrap, { backgroundColor: '#0D9488' + '18' }]}>
              <Ionicons name="download-outline" size={18} color="#0D9488" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>匯出 CSV</Text>
              <Text style={styles.rowValue}>匯出全部記帳記錄</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={() => setModal('resetConfirm')} activeOpacity={0.7}>
            <View style={[styles.iconWrap, { backgroundColor: COLORS.expense + '15' }]}>
              <Ionicons name="trash-outline" size={18} color={COLORS.expense} />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: COLORS.expense }]}>重置所有記錄</Text>
              <Text style={styles.rowValue}>刪除全部記帳資料，不影響預算設定</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BudgetModal
        visible={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        onSaved={load}
      />

      <AppModal
        visible={modal === 'resetConfirm'}
        title="重置所有記錄"
        message="確定要刪除所有記帳記錄嗎？預算設定將保留，此操作無法復原。"
        confirmText="確認重置"
        danger
        onConfirm={handleResetConfirm}
        onCancel={() => setModal('none')}
      />
      <AppModal
        visible={modal === 'resetDone'}
        title="重置完成"
        message="所有記帳記錄已清除。"
        confirmText="好的"
        onConfirm={() => setModal('none')}
      />
      <AppModal
        visible={modal === 'exportDone'}
        title="匯出成功"
        message="CSV 檔案已準備完成。"
        confirmText="好的"
        onConfirm={() => setModal('none')}
      />
      <AppModal
        visible={modal === 'exportEmpty'}
        title="沒有記錄"
        message="目前沒有任何記帳記錄可以匯出。"
        confirmText="好的"
        onConfirm={() => setModal('none')}
      />
      <AppModal
        visible={modal === 'exportError'}
        title="匯出失敗"
        message="發生錯誤，請稍後再試。"
        confirmText="好的"
        onConfirm={() => setModal('none')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingBottom: 100 },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 28,
    letterSpacing: -0.3,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 4,
  },
  group: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  rowValue: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.border, marginLeft: 66 },
});
