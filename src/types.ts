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

export interface BudgetSettings {
  monthlyBudget: number;
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
  bg:      '#0F172A',       // 深夜藍
  card:    'rgba(30, 41, 59, 0.8)',  // 毛玻璃卡片
  cardSolid: '#1E293B',     // 實色卡片
  income:  '#34D399',       // 翡翠綠
  expense: '#F87171',       // 珊瑚紅
  text:    '#F1F5F9',       // 柔白
  muted:   '#94A3B8',       // 銀灰
  border:  'rgba(148, 163, 184, 0.15)', // 半透明邊
  accent:  '#818CF8',       // 薰衣草紫
  accentCyan: '#22D3EE',    // 科技青
  dark:    '#020617',       // 極深
  glass:   'rgba(255,255,255,0.05)',  // 玻璃光澤
};
