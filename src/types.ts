export type TxType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  category: string;
  note: string;
  date: string; // 'YYYY-MM-DD'
  createdAt: string;
}

export interface Category {
  key: string;
  icon: string;
  color: string;
}

export const EXPENSE_CATS: Category[] = [
  { key: '餐飲', icon: '🍜', color: '#FB923C' },
  { key: '交通', icon: '🚌', color: '#60A5FA' },
  { key: '購物', icon: '🛍️', color: '#A78BFA' },
  { key: '娛樂', icon: '🎮', color: '#F472B6' },
  { key: '住宿', icon: '🏠', color: '#FBBF24' },
  { key: '醫療', icon: '💊', color: '#34D399' },
  { key: '教育', icon: '📚', color: '#6366F1' },
  { key: '其他', icon: '📦', color: '#9CA3AF' },
];

export const INCOME_CATS: Category[] = [
  { key: '薪資', icon: '💼', color: '#10B981' },
  { key: '兼職', icon: '💻', color: '#6366F1' },
  { key: '投資', icon: '📈', color: '#F59E0B' },
  { key: '禮金', icon: '🎁', color: '#EC4899' },
  { key: '其他', icon: '💰', color: '#94A3B8' },
];

export const COLORS = {
  bg:      '#FAFAF9',
  card:    '#FFFFFF',
  income:  '#10B981',
  expense: '#EF4444',
  text:    '#111827',
  muted:   '#6B7280',
  border:  '#F3F4F6',
  accent:  '#6366F1',
  dark:    '#111827',
};
