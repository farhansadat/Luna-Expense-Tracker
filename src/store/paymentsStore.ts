import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { useAuthStore } from './authStore';

// Demo data
const demoPayments = [
  {
    id: 'demo-payment-1',
    user_id: 'demo-user',
    name: 'Monthly Rent',
    amount: 1200,
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'housing',
    recurring: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-payment-2',
    user_id: 'demo-user',
    name: 'Car Insurance',
    amount: 150,
    due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'insurance',
    recurring: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

interface Payment {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  due_date: string;
  category: string;
  recurring: boolean;
  created_at: string;
  updated_at: string;
}

interface PaymentsStore {
  payments: Payment[];
  isLoading: boolean;
  error: string | null;
  fetchPayments: () => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePayment: (id: string, payment: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
}

export const usePaymentsStore = create<PaymentsStore>((set, get) => ({
  payments: [],
  isLoading: false,
  error: null,

  fetchPayments: async () => {
    const isDemo = useAuthStore.getState().isDemo;
    if (isDemo) {
      set({ payments: demoPayments, isLoading: false, error: null });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', session.user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;

      set({ payments: data || [] });
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addPayment: async (payment) => {
    const isDemo = useAuthStore.getState().isDemo;
    if (isDemo) {
      const newPayment = {
        id: `demo-payment-${Date.now()}`,
        user_id: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...payment
      };
      set(state => ({
        payments: [...state.payments, newPayment],
        isLoading: false,
        error: null
      }));
      toast.success('Payment added successfully');
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await supabase
        .from('payments')
        .insert({
          ...payment,
          user_id: session.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        payments: [...state.payments, data]
      }));
      toast.success('Payment added successfully');
    } catch (error: any) {
      console.error('Error adding payment:', error);
      set({ error: error.message });
      toast.error('Failed to add payment');
    } finally {
      set({ isLoading: false });
    }
  },

  updatePayment: async (id, payment) => {
    const isDemo = useAuthStore.getState().isDemo;
    if (isDemo) {
      set(state => ({
        payments: state.payments.map(p => 
          p.id === id ? { ...p, ...payment, updated_at: new Date().toISOString() } : p
        ),
        isLoading: false,
        error: null
      }));
      toast.success('Payment updated successfully');
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('payments')
        .update({
          ...payment,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        payments: state.payments.map(p => p.id === id ? data : p)
      }));
      toast.success('Payment updated successfully');
    } catch (error: any) {
      console.error('Error updating payment:', error);
      set({ error: error.message });
      toast.error('Failed to update payment');
    } finally {
      set({ isLoading: false });
    }
  },

  deletePayment: async (id) => {
    const isDemo = useAuthStore.getState().isDemo;
    if (isDemo) {
      set(state => ({
        payments: state.payments.filter(p => p.id !== id),
        isLoading: false,
        error: null
      }));
      toast.success('Payment deleted successfully');
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        payments: state.payments.filter(p => p.id !== id)
      }));
      toast.success('Payment deleted successfully');
    } catch (error: any) {
      console.error('Error deleting payment:', error);
      set({ error: error.message });
      toast.error('Failed to delete payment');
    } finally {
      set({ isLoading: false });
    }
  }
})); 