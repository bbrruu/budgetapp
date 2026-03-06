import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, BudgetSettings } from './types';

const KEY = 'budget_v1';
const BUDGET_KEY = 'budget_settings_v1';

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const data = await AsyncStorage.getItem(KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveTransaction(tx: Transaction): Promise<void> {
  const list = await getTransactions();
  await AsyncStorage.setItem(KEY, JSON.stringify([tx, ...list]));
}

export async function updateTransaction(
  id: string,
  updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>
): Promise<void> {
  const all = await getTransactions();
  const updated = all.map(t => (t.id === id ? { ...t, ...updates } : t));
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}

export async function deleteTransaction(id: string): Promise<void> {
  const list = await getTransactions();
  await AsyncStorage.setItem(KEY, JSON.stringify(list.filter(t => t.id !== id)));
}

// Budget settings
export async function getBudgetSettings(): Promise<BudgetSettings> {
  try {
    const data = await AsyncStorage.getItem(BUDGET_KEY);
    if (!data) return { monthlyBudget: 0 };
    const parsed = JSON.parse(data);
    return { monthlyBudget: parsed?.monthlyBudget ?? 0 };
  } catch {
    return { monthlyBudget: 0 };
  }
}

export async function saveBudgetSettings(settings: BudgetSettings): Promise<void> {
  await AsyncStorage.setItem(BUDGET_KEY, JSON.stringify(settings));
}

// Clear all transaction records (keeps budget settings)
export async function clearTransactions(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

// Clear all data
export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([KEY, BUDGET_KEY]);
}

// CSV export helper
export function generateCSV(txs: Transaction[]): string {
  const header = '日期,類型,類別,金額,備註';
  const rows = txs.map(t =>
    `${t.date},${t.type === 'income' ? '收入' : '支出'},${t.category},${t.amount},"${t.note.replace(/"/g, '""')}"`
  );
  return '\uFEFF' + [header, ...rows].join('\n');
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
