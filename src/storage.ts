import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from './types';

const KEY = 'budget_v1';

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const data = await AsyncStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveTransaction(tx: Transaction): Promise<void> {
  const list = await getTransactions();
  await AsyncStorage.setItem(KEY, JSON.stringify([tx, ...list]));
}

export async function deleteTransaction(id: string): Promise<void> {
  const list = await getTransactions();
  await AsyncStorage.setItem(KEY, JSON.stringify(list.filter(t => t.id !== id)));
}

export function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDateShort(dateStr: string): string {
  const [, m, d] = dateStr.split('-');
  return `${parseInt(m)}/${parseInt(d)}`;
}
