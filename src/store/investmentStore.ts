import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

// Demo data
const demoInvestments = [
  {
    id: 'demo-inv-1',
    user_id: 'demo-user',
    name: 'S&P 500 Index Fund',
    type: 'stocks',
    amount: 750000,
    current_value: 862500,
    purchase_date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Long-term investment',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-inv-2',
    user_id: 'demo-user',
    name: 'Bitcoin & Ethereum Portfolio',
    type: 'crypto',
    amount: 450000,
    current_value: 555000,
    purchase_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Cryptocurrency investment',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-inv-3',
    user_id: 'demo-user',
    name: 'Real Estate Investment Trust',
    type: 'real_estate',
    amount: 1500000,
    current_value: 1725000,
    purchase_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'REIT investment',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  type: string;
  amount: number;
  current_value: number;
  purchase_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface InvestmentStore {
  investments: Investment[];
  isLoading: boolean;
  error: string | null;
  fetchInvestments: () => Promise<void>;
  addInvestment: (investment: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateInvestment: (id: string, investment: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  updateInvestmentValue: (id: string, newValue: number) => Promise<void>;
  clearError: () => void;
}

export const useInvestmentStore = create<InvestmentStore>((set, get) => ({
  investments: [],
  isLoading: false,
  error: null,

  fetchInvestments: async () => {
    const isDemo = useAuthStore.getState().isDemo;
    if (isDemo) {
      set({ investments: demoInvestments, isLoading: false, error: null });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', session.user.id)
        .order('purchase_date', { ascending: false });

      if (error) throw error;
      set({ investments: data || [], isLoading: false });
    } catch (error: any) {
      console.error('Error fetching investments:', error);
      set({ error: error.message || 'Failed to fetch investments', isLoading: false });
    }
  },

  addInvestment: async (investment) => {
    const isDemo = useAuthStore.getState().isDemo;
    if (isDemo) {
      const newInvestment = {
        id: `demo-inv-${Date.now()}`,
        user_id: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...investment
      };
      set(state => ({
        investments: [...state.investments, newInvestment],
        isLoading: false,
        error: null
      }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('investments')
        .insert([{
          ...investment,
          user_id: session.user.id,
          created_at: now,
          updated_at: now
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23514') {
          throw new Error('Invalid investment type. Please select a valid type.');
        }
        throw error;
      }

      set(state => ({
        investments: [...state.investments, data],
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Error adding investment:', error);
      set({ 
        error: error.message || 'Failed to add investment', 
        isLoading: false 
      });
    }
  },

  updateInvestment: async (id, investment) => {
    const isDemo = useAuthStore.getState().isDemo;
    if (isDemo) {
      set(state => ({
        investments: state.investments.map(inv => 
          inv.id === id ? { ...inv, ...investment, updated_at: new Date().toISOString() } : inv
        ),
        isLoading: false,
        error: null
      }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('investments')
        .update({
          ...investment,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === '23514') {
          throw new Error('Invalid investment type. Please select a valid type.');
        }
        throw error;
      }

      set(state => ({
        investments: state.investments.map(i => i.id === id ? data : i),
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Error updating investment:', error);
      set({ 
        error: error.message || 'Failed to update investment', 
        isLoading: false 
      });
    }
  },

  deleteInvestment: async (id) => {
    const isDemo = useAuthStore.getState().isDemo;
    if (isDemo) {
      set(state => ({
        investments: state.investments.filter(inv => inv.id !== id),
        isLoading: false,
        error: null
      }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        investments: state.investments.filter(i => i.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Error deleting investment:', error);
      set({ 
        error: error.message || 'Failed to delete investment',
        isLoading: false 
      });
    }
  },

  updateInvestmentValue: async (id, newValue) => {
    const isDemo = useAuthStore.getState().isDemo;
    if (isDemo) {
      set(state => ({
        investments: state.investments.map(inv =>
          inv.id === id ? { ...inv, current_value: newValue, updated_at: new Date().toISOString() } : inv
        ),
        isLoading: false,
        error: null
      }));
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('investments')
        .update({ 
          current_value: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        investments: state.investments.map(i => i.id === id ? data : i),
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Error updating investment value:', error);
      set({ 
        error: error.message || 'Failed to update investment value',
        isLoading: false 
      });
    }
  },

  clearError: () => set({ error: null })
})); 