import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { COLORS } from '../types';
import { toDateStr } from '../storage';

interface Props {
  value: Date;
  onChange: (date: Date) => void;
}

export default function DatePickerField({ value, onChange }: Props) {
  const [showIOS, setShowIOS] = useState(false);

  const open = () => {
    if (Platform.OS === 'android') {
      (DateTimePickerAndroid as any).open({
        value,
        onChange: (_: any, d?: Date) => { if (d) onChange(d); },
        mode: 'date',
        maximumDate: new Date(),
      });
    } else {
      setShowIOS(true);
    }
  };

  const formatted = `${value.getFullYear()}/${value.getMonth() + 1}/${value.getDate()}`;

  return (
    <>
      <TouchableOpacity style={styles.fieldRow} onPress={open}>
        <Text style={styles.icon}>📅</Text>
        <Text style={styles.txt}>{formatted}</Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <Modal visible={showIOS} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.title}>選擇日期</Text>
              <TouchableOpacity onPress={() => setShowIOS(false)}>
                <Text style={styles.done}>完成</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={value}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onChange={(_, d) => { if (d) onChange(d); }}
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fieldRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  icon: { fontSize: 18, marginRight: 12 },
  txt: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.text },
  arrow: { fontSize: 20, color: COLORS.muted },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 34 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  done: { fontSize: 16, fontWeight: '700', color: COLORS.accent },
});
