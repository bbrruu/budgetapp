import React from 'react';
import { View, StyleSheet, Platform, StatusBar as RNStatusBar } from 'react-native';
import { COLORS } from '../types';

interface Props {
  children: React.ReactNode;
}

export default function MobileFrame({ children }: Props) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={styles.desktop}>
      <View style={styles.phone}>
        {/* Notch */}
        <View style={styles.notch}>
          <View style={styles.notchPill} />
        </View>
        {/* Content */}
        <View style={styles.screen}>
          {children}
        </View>
        {/* Home indicator */}
        <View style={styles.homeBar}>
          <View style={styles.homeIndicator} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  desktop: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%' as any,
  },
  phone: {
    width: 393,
    height: 852,
    maxHeight: '98vh' as any,
    backgroundColor: COLORS.bg,
    borderRadius: 44,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    shadowColor: '#818CF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 20,
    position: 'relative',
  },
  notch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 54,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 12,
    backgroundColor: 'transparent',
  },
  notchPill: {
    width: 126,
    height: 34,
    borderRadius: 20,
    backgroundColor: '#020617',
  },
  screen: {
    flex: 1,
  },
  homeBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(241, 245, 249, 0.3)',
  },
});
