import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../types';
import { toDateStr } from '../storage';

interface Props {
  value: Date;
  onChange: (date: Date) => void;
}

export default function DatePickerField({ value, onChange }: Props) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.icon}>📅</Text>
      <input
        type="date"
        value={toDateStr(value)}
        max={toDateStr(new Date())}
        onChange={(e) => {
          if (e.target.value) onChange(new Date(e.target.value + 'T12:00:00'));
        }}
        style={{
          flex: 1,
          fontSize: 15,
          fontWeight: '600',
          color: COLORS.text,
          border: 'none',
          background: 'transparent',
          outline: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
        } as React.CSSProperties}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fieldRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  icon: { fontSize: 18, marginRight: 12 },
});
