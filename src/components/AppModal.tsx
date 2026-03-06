import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../types';

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function AppModal({
  visible,
  title,
  message,
  confirmText = '確認',
  cancelText = '取消',
  danger,
  onConfirm,
  onCancel,
}: Props) {
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 7, tension: 120, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(0.92);
      opacity.setValue(0);
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onCancel ?? onConfirm}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={[styles.btnRow, !message && styles.btnRowCompact]}>
            {onCancel && (
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={onCancel} activeOpacity={0.7}>
                <Text style={styles.btnCancelTxt}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.btn, styles.btnConfirm, danger && styles.btnDanger, !onCancel && { flex: 1 }]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.btnConfirmTxt}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  message: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 21,
    marginBottom: 22,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },
  btnRowCompact: {
    marginTop: 16,
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 13,
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: COLORS.border,
  },
  btnCancelTxt: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.muted,
  },
  btnConfirm: {
    backgroundColor: COLORS.accent,
  },
  btnDanger: {
    backgroundColor: COLORS.expense,
  },
  btnConfirmTxt: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
