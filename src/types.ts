import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { categories, CategoryKey } from './data/categories';

export type { CategoryKey };

export interface Category {
  name: string;
  icon: IconDefinition;
  color: string;
  isIncome?: boolean;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: CategoryKey;
  type: 'income' | 'expense';
  date: string;
  created_at: string;
  tags?: string[];
  is_recurring?: boolean;
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  receipt_url?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  payment_method?: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer';
  location?: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  monthly_income?: number;
  monthly_budget?: number;
  savings_goal?: number;
  currency?: string;
  created_at: string;
  updated_at: string;
  total_balance?: number;
  total_savings?: number;
  total_investments?: number;
  spending_limits?: Record<CategoryKey, number>;
  notification_preferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export interface UserSettings {
  currency: string;
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  language: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  defaultView: 'daily' | 'weekly' | 'monthly' | 'yearly';
  budgetWarningThreshold: number;
  autoSync: boolean;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: 'personal' | 'business' | 'family';
  balance: number;
  currency: string;
  institution?: string;
  account_number?: string;
  is_default?: boolean;
  color?: string;
  icon?: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: CategoryKey;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  current_spending: number;
  alerts?: {
    warning_threshold: number;
    critical_threshold: number;
  };
}

export interface ScheduledPayment {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: CategoryKey;
  frequency: 'one_time' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_date: string;
  end_date?: string;
  last_processed?: string;
  status: 'active' | 'paused' | 'completed';
  payment_method?: string;
  recipient?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
  category?: CategoryKey;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string | string[];
    tension?: number;
    fill?: boolean;
  }[];
} 