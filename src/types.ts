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
  { key: '餐飲', icon: 'restaurant-outline', color: '#FB923C' },
  { key: '交通', icon: 'car-outline', color: '#60A5FA' },
  { key: '購物', icon: 'bag-outline', color: '#A78BFA' },
  { key: '娛樂', icon: 'game-controller-outline', color: '#F472B6' },
  { key: '住宿', icon: 'home-outline', color: '#FBBF24' },
  { key: '醫療', icon: 'medkit-outline', color: '#34D399' },
  { key: '教育', icon: 'book-outline', color: '#6366F1' },
  { key: '其他', icon: 'grid-outline', color: '#9CA3AF' },
];

export const INCOME_CATS: Category[] = [
  { key: '薪資', icon: 'briefcase-outline', color: '#10B981' },
  { key: '兼職', icon: 'laptop-outline', color: '#6366F1' },
  { key: '投資', icon: 'trending-up-outline', color: '#F59E0B' },
  { key: '禮金', icon: 'gift-outline', color: '#EC4899' },
  { key: '其他', icon: 'wallet-outline', color: '#94A3B8' },
];

export const COLORS = {
  bg:        '#FAF7F2',      // 暖羊皮紙
  card:      '#FFFFFF',      // 純白
  cardSolid: '#F5F0E8',      // 暖奶油
  income:    '#15803D',      // 森林綠
  expense:   '#B91C1C',      // 磚紅
  text:      '#292524',      // 暖墨黑
  muted:     '#78716C',      // 暖石灰
  border:    '#E8E0D6',      // 暖米邊框
  accent:    '#B45309',      // 琥珀棕
  accentCyan:'#0D9488',      // 暖青（進度條用）
  dark:      '#1C1917',      // 暖近黑
  glass:     'rgba(255,255,255,0.85)',
};
