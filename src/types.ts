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
  { key: '餐飲', icon: '🍜', color: '#FF6B6B' },
  { key: '交通', icon: '🚌', color: '#48CAE4' },
  { key: '購物', icon: '🛍️', color: '#9B5DE5' },
  { key: '娛樂', icon: '🎮', color: '#F15BB5' },
  { key: '住宿', icon: '🏠', color: '#F4A261' },
  { key: '醫療', icon: '💊', color: '#00BBF9' },
  { key: '教育', icon: '📚', color: '#06D6A0' },
  { key: '其他', icon: '📦', color: '#B0B0B0' },
];

export const INCOME_CATS: Category[] = [
  { key: '薪資', icon: '💼', color: '#2ECC71' },
  { key: '兼職', icon: '💻', color: '#3498DB' },
  { key: '投資', icon: '📈', color: '#F39C12' },
  { key: '禮金', icon: '🎁', color: '#E91E63' },
  { key: '其他', icon: '💰', color: '#95A5A6' },
];

export const COLORS = {
  bg: '#F5F3EE',
  card: '#FFFFFF',
  income: '#27AE60',
  expense: '#E74C3C',
  text: '#2C3E50',
  muted: '#7F8C8D',
  border: '#E8E4DC',
  accent: '#3498DB',
  dark: '#1A252F',
};
