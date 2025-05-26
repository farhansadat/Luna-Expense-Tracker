import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { Account, ScheduledPayment } from '../types';
import { toast } from 'react-hot-toast';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: 'personal' | 'business' | 'family';
  balance: number;
  currency: string;
  color: string;
  icon: string;
  created_at: string;
}

interface AccountStore {
  accounts: Account[];
  selectedAccount: Account | null;
  loading: boolean;
  error: string | null;
  scheduledPayments: ScheduledPayment[];
  isLoading: boolean;
  fetchAccounts: () => Promise<void>;
  createAccount: (account: Omit<Account, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  setSelectedAccount: (account: Account | null) => void;
  
  // Scheduled payment actions
  addScheduledPayment: (payment: Omit<ScheduledPayment, 'id' | 'user_id'>) => Promise<void>;
  updateScheduledPayment: (id: string, payment: Partial<ScheduledPayment>) => Promise<void>;
  deleteScheduledPayment: (id: string) => Promise<void>;
  fetchScheduledPayments: () => Promise<void>;
  
  // Utility actions
  clearError: () => void;
  getTotalBalance: () => number;
  getAccountsByType: (type: Account['type']) => Account[];
  setAccounts: (accounts: Account[]) => void;
  addAccount: (account: Account) => void;
}

export const useAccountStore = create<AccountStore>()(
  persist(
    (set, get) => ({
      accounts: [],
      selectedAccount: null,
      loading: false,
      error: null,
      scheduledPayments: [],
      isLoading: false,

      fetchAccounts: async () => {
        try {
          set({ loading: true, error: null });
          const { data: user } = await supabase.auth.getUser();
          if (!user) throw new Error('No user found');

          const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .eq('user_id', user.user.id)
            .order('created_at', { ascending: true });

          if (error) throw error;

          set({ 
            accounts: data || [],
            selectedAccount: get().selectedAccount || (data && data.length > 0 ? data[0] : null)
          });
        } catch (error) {
          console.error('Error fetching accounts:', error);
          set({ error: 'Failed to fetch accounts' });
          toast.error('Failed to fetch accounts');
        } finally {
          set({ loading: false });
        }
      },

      fetchScheduledPayments: async () => {
        try {
          set({ isLoading: true, error: null });
          const { data: user } = await supabase.auth.getUser();
          if (!user) throw new Error('No user found');

          const { data, error } = await supabase
            .from('scheduled_payments')
            .select('*')
            .eq('user_id', user.user.id)
            .order('next_date', { ascending: true });

          if (error) throw error;
          set({ scheduledPayments: data || [] });
        } catch (error) {
          console.error('Failed to fetch scheduled payments:', error);
          set({ error: 'Failed to fetch scheduled payments' });
          toast.error('Failed to fetch scheduled payments');
        } finally {
          set({ isLoading: false });
        }
      },

      addScheduledPayment: async (payment) => {
        try {
          set({ isLoading: true, error: null });
          const { data: user } = await supabase.auth.getUser();
          if (!user) throw new Error('No user found');

          const newPayment = {
            ...payment,
            user_id: user.user.id,
            created_at: new Date().toISOString(),
            status: 'active'
          };

          const { data, error } = await supabase
            .from('scheduled_payments')
            .insert([newPayment])
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            scheduledPayments: [...state.scheduledPayments, data]
          }));
          toast.success('Payment scheduled successfully');
        } catch (error) {
          console.error('Failed to add scheduled payment:', error);
          set({ error: 'Failed to add scheduled payment' });
          toast.error('Failed to add scheduled payment');
        } finally {
          set({ isLoading: false });
        }
      },

      updateScheduledPayment: async (id, updatedPayment) => {
        try {
          set({ isLoading: true, error: null });
          
          const { data, error } = await supabase
            .from('scheduled_payments')
            .update(updatedPayment)
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            scheduledPayments: state.scheduledPayments.map((payment) =>
              payment.id === id ? { ...payment, ...data } : payment
            )
          }));
          toast.success('Payment updated successfully');
        } catch (error) {
          console.error('Failed to update scheduled payment:', error);
          set({ error: 'Failed to update scheduled payment' });
          toast.error('Failed to update scheduled payment');
        } finally {
          set({ isLoading: false });
        }
      },

      deleteScheduledPayment: async (id) => {
        try {
          set({ isLoading: true, error: null });

          const { error } = await supabase
            .from('scheduled_payments')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set((state) => ({
            scheduledPayments: state.scheduledPayments.filter((payment) => payment.id !== id)
          }));
          toast.success('Payment deleted successfully');
        } catch (error) {
          console.error('Failed to delete scheduled payment:', error);
          set({ error: 'Failed to delete scheduled payment' });
          toast.error('Failed to delete scheduled payment');
        } finally {
          set({ isLoading: false });
        }
      },

      createAccount: async (account) => {
        try {
          set({ loading: true, error: null });
          const { data: user } = await supabase.auth.getUser();
          if (!user) throw new Error('No user found');

          const newAccount = {
            ...account,
            user_id: user.user.id,
            created_at: new Date().toISOString()
          };

          const { data, error } = await supabase
            .from('accounts')
            .insert([newAccount])
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            accounts: [...state.accounts, data],
            selectedAccount: state.accounts.length === 0 ? data : state.selectedAccount
          }));
          toast.success('Account created successfully');
        } catch (error) {
          console.error('Error creating account:', error);
          set({ error: 'Failed to create account' });
          toast.error('Failed to create account');
        } finally {
          set({ loading: false });
        }
      },

      updateAccount: async (id, updates) => {
        try {
          set({ loading: true, error: null });

          const { data, error } = await supabase
            .from('accounts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            accounts: state.accounts.map((account) =>
              account.id === id ? { ...account, ...data } : account
            ),
            selectedAccount: state.selectedAccount?.id === id ? { ...state.selectedAccount, ...data } : state.selectedAccount
          }));
          toast.success('Account updated successfully');
        } catch (error) {
          console.error('Error updating account:', error);
          set({ error: 'Failed to update account' });
          toast.error('Failed to update account');
        } finally {
          set({ loading: false });
        }
      },

      deleteAccount: async (id) => {
        try {
          set({ loading: true, error: null });

          const { error } = await supabase
            .from('accounts')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set((state) => {
            const newAccounts = state.accounts.filter((account) => account.id !== id);
            return {
              accounts: newAccounts,
              selectedAccount: state.selectedAccount?.id === id
                ? newAccounts.length > 0 ? newAccounts[0] : null
                : state.selectedAccount
            };
          });
          toast.success('Account deleted successfully');
        } catch (error) {
          console.error('Error deleting account:', error);
          set({ error: 'Failed to delete account' });
          toast.error('Failed to delete account');
        } finally {
          set({ loading: false });
        }
      },

      setSelectedAccount: (account) => set({ selectedAccount: account }),

      clearError: () => set({ error: null }),

      getTotalBalance: () => {
        return get().accounts.reduce((total, account) => total + account.balance, 0);
      },

      getAccountsByType: (type) => {
        return get().accounts.filter((account) => account.type === type);
      },

      setAccounts: (accounts) => set({ accounts }),

      addAccount: (account) => set((state) => ({ accounts: [...state.accounts, account] })),
    }),
    {
      name: 'luna-accounts',
      partialize: (state) => ({
        accounts: state.accounts,
        selectedAccount: state.selectedAccount,
      }),
    }
  )
); 