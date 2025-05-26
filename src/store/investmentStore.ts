import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Investment {
  id: string;
  name: string;
  type: 'stocks' | 'bonds' | 'crypto' | 'real_estate' | 'cash' | 'other';
  amount: number;
  current_value: number;
  purchase_date: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface InvestmentStore {
  investments: Investment[];
  isLoading: boolean;
  error: string | null;
  fetchInvestments: () => Promise<void>;
  addInvestment: (investment: Omit<Investment, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateInvestment: (id: string, investment: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  updateInvestmentValue: (id: string, newValue: number) => Promise<void>;
}

export const useInvestmentStore = create<InvestmentStore>((set, get) => ({
  investments: [],
  isLoading: false,
  error: null,

  fetchInvestments: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ investments: data || [] });
    } catch (error) {
      console.error('Error fetching investments:', error);
      set({ error: 'Failed to fetch investments' });
    } finally {
      set({ isLoading: false });
    }
  },

  addInvestment: async (investment) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('investments')
        .insert([investment])
        .select()
        .single();

      if (error) throw error;
      set(state => ({
        investments: [data, ...state.investments]
      }));
    } catch (error) {
      console.error('Error adding investment:', error);
      set({ error: 'Failed to add investment' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateInvestment: async (id, investment) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('investments')
        .update(investment)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set(state => ({
        investments: state.investments.map(i => i.id === id ? data : i)
      }));
    } catch (error) {
      console.error('Error updating investment:', error);
      set({ error: 'Failed to update investment' });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteInvestment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set(state => ({
        investments: state.investments.filter(i => i.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting investment:', error);
      set({ error: 'Failed to delete investment' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateInvestmentValue: async (id, newValue) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('investments')
        .update({ current_value: newValue })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set(state => ({
        investments: state.investments.map(i => i.id === id ? data : i)
      }));
    } catch (error) {
      console.error('Error updating investment value:', error);
      set({ error: 'Failed to update investment value' });
    } finally {
      set({ isLoading: false });
    }
  }
})); 