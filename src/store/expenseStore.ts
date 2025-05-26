import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { Expense, CategoryKey } from '../types';

interface ExpenseStore {
  expenses: Expense[];
  monthlyBudget: number;
  isLoading: boolean;
  error: string | null;
  addExpense: (expense: Omit<Expense, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setMonthlyBudget: (amount: number) => void;
  fetchExpenses: () => Promise<void>;
  getMonthlyBudget: () => Promise<void>;
  clearError: () => void;
  getExpensesByCategory: () => Record<CategoryKey, number>;
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      expenses: [],
      monthlyBudget: 2000, // Default monthly budget
      isLoading: false,
      error: null,

      addExpense: async (expense) => {
        try {
          set({ isLoading: true, error: null });
          const { data: user } = await supabase.auth.getUser();
          if (!user) throw new Error('No user found');

          const { data, error } = await supabase
            .from('expenses')
            .insert([{
            user_id: user.user.id,
            ...expense,
            }])
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            expenses: [...state.expenses, data],
          }));
        } catch (error) {
          console.error('Failed to add expense:', error);
          set({ error: 'Failed to add expense' });
        } finally {
          set({ isLoading: false });
        }
      },

      updateExpense: async (id, updatedExpense) => {
        try {
          set({ isLoading: true, error: null });
          
          // Store the original expense for rollback
          const originalExpense = get().expenses.find((e) => e.id === id);
          if (!originalExpense) throw new Error('Expense not found');
          
          // Update local state first
          set((state) => ({
            expenses: state.expenses.map((expense) =>
              expense.id === id ? { ...expense, ...updatedExpense } : expense
            ),
          }));

          // Then sync with backend
          const { error } = await supabase
            .from('expenses')
            .update(updatedExpense)
            .eq('id', id);

          if (error) {
            // Rollback local state if backend sync fails
            set((state) => ({
              expenses: state.expenses.map((expense) =>
                expense.id === id ? originalExpense : expense
              ),
            }));
            throw error;
          }
        } catch (error) {
          console.error('Failed to update expense:', error);
          set({ error: 'Failed to update expense' });
        } finally {
          set({ isLoading: false });
        }
      },

      deleteExpense: async (id) => {
        try {
          set({ isLoading: true, error: null });
          
          // Store the deleted expense for rollback
          const deletedExpense = get().expenses.find((e) => e.id === id);
          if (!deletedExpense) throw new Error('Expense not found');
          
          // Delete from local state first
          set((state) => ({
            expenses: state.expenses.filter((expense) => expense.id !== id),
          }));

          // Then sync with backend
          const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', id);

          if (error) {
            // Rollback local state if backend sync fails
            set((state) => ({
              expenses: [...state.expenses, deletedExpense],
            }));
            throw error;
          }
        } catch (error) {
          console.error('Failed to delete expense:', error);
          set({ error: 'Failed to delete expense' });
        } finally {
          set({ isLoading: false });
        }
      },

      setMonthlyBudget: async (amount) => {
        try {
          set({ isLoading: true, error: null });
          const { data: user } = await supabase.auth.getUser();
          if (!user) throw new Error('No user found');

          const { error } = await supabase
            .from('profiles')
            .update({ monthly_budget: amount })
            .eq('id', user.user.id);

          if (error) throw error;
        set({ monthlyBudget: amount });
        } catch (error) {
          console.error('Failed to update monthly budget:', error);
          set({ error: 'Failed to update monthly budget' });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchExpenses: async () => {
        try {
          set({ isLoading: true, error: null });
          const { data: user } = await supabase.auth.getUser();
          if (!user) throw new Error('No user found');

          const { data: expenses, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('user_id', user.user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          set({ expenses: expenses || [] });
        } catch (error) {
          console.error('Failed to fetch expenses:', error);
          set({ error: 'Failed to fetch expenses' });
        } finally {
          set({ isLoading: false });
        }
      },

      getMonthlyBudget: async () => {
        try {
          set({ isLoading: true, error: null });
          const { data: user } = await supabase.auth.getUser();
          if (!user) throw new Error('No user found');

          const { data: profile, error } = await supabase
            .from('profiles')
            .select('monthly_budget')
            .eq('id', user.user.id)
            .single();

          if (error) throw error;
          if (profile?.monthly_budget) {
            set({ monthlyBudget: profile.monthly_budget });
          }
        } catch (error) {
          console.error('Failed to fetch monthly budget:', error);
          set({ error: 'Failed to fetch monthly budget' });
        } finally {
          set({ isLoading: false });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      getExpensesByCategory: () => {
        const expenses = get().expenses;
        return expenses.reduce((acc, expense) => {
          acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
          return acc;
        }, {} as Record<CategoryKey, number>);
      },
    }),
    {
      name: 'luna-expenses',
    }
  )
); 