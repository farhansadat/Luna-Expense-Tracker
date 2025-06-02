import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { useAuthStore } from './authStore';

interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  category: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Demo data
const demoGoals = [
  {
    id: 'demo-goal-1',
    user_id: 'demo-user',
    name: 'Emergency Fund',
    target_amount: 100000,
    current_amount: 65000,
    deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Savings',
    priority: 'High',
    created_at: new Date().toISOString(),
    title: 'Build Emergency Fund',
    description: 'Save 6 months of living expenses for emergencies'
  },
  {
    id: 'demo-goal-2',
    user_id: 'demo-user',
    name: 'House Down Payment',
    target_amount: 250000,
    current_amount: 125000,
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Purchase',
    priority: 'Medium',
    created_at: new Date().toISOString(),
    title: 'House Down Payment',
    description: 'Save for a down payment on a dream home'
  },
  {
    id: 'demo-goal-3',
    user_id: 'demo-user',
    name: 'World Travel Fund',
    target_amount: 75000,
    current_amount: 45000,
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Travel',
    priority: 'Low',
    created_at: new Date().toISOString(),
    title: 'World Travel Fund',
    description: 'Fund for traveling around the world'
  }
];

interface GoalsStore {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchGoals: () => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useGoalsStore = create<GoalsStore>()(
  persist(
    (set, get) => ({
      goals: [],
      isLoading: false,
      error: null,
      lastFetched: null,

      fetchGoals: async () => {
        const isDemo = useAuthStore.getState().isDemo;
        const now = Date.now();
        const lastFetched = get().lastFetched;

        // Return cached data if it's still fresh
        if (lastFetched && now - lastFetched < CACHE_DURATION) {
          return;
        }

        try {
          set({ isLoading: true, error: null });
          if (isDemo) {
            set({ goals: demoGoals, lastFetched: now });
            return;
          }

          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) {
            throw new Error('No authenticated user');
          }

          const { data, error } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', session.user.id)
            .order('deadline', { ascending: true });

          if (error) throw error;

          set({ 
            goals: data || [],
            lastFetched: now
          });
        } catch (error: any) {
          console.error('Error fetching goals:', error);
          set({ error: error.message });
          toast.error('Failed to fetch goals');
        } finally {
          set({ isLoading: false });
        }
      },

      addGoal: async (goal) => {
        const isDemo = useAuthStore.getState().isDemo;
        if (isDemo) {
          const newGoal = {
            id: `demo-goal-${Date.now()}`,
            user_id: 'demo-user',
            created_at: new Date().toISOString(),
            ...goal
          };
          set((state) => ({
            goals: [newGoal, ...state.goals]
          }));
          return;
        }

        try {
          set({ isLoading: true, error: null });
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) {
            throw new Error('No authenticated user');
          }

          const { data, error } = await supabase
            .from('goals')
            .insert({
              ...goal,
              user_id: session.user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (error) throw error;

          set(state => ({
            goals: [...state.goals, data],
            lastFetched: Date.now()
          }));
          toast.success('Goal added successfully');
        } catch (error: any) {
          console.error('Error adding goal:', error);
          set({ error: error.message });
          toast.error('Failed to add goal');
        } finally {
          set({ isLoading: false });
        }
      },

      updateGoal: async (id, goal) => {
        const isDemo = useAuthStore.getState().isDemo;
        if (isDemo) {
          set((state) => ({
            goals: state.goals.map((g) =>
              g.id === id ? { ...g, ...goal } : g
            )
          }));
          return;
        }

        try {
          set({ isLoading: true, error: null });
          const { data, error } = await supabase
            .from('goals')
            .update({
              ...goal,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          set(state => ({
            goals: state.goals.map(g => g.id === id ? data : g),
            lastFetched: Date.now()
          }));
          toast.success('Goal updated successfully');
        } catch (error: any) {
          console.error('Error updating goal:', error);
          set({ error: error.message });
          toast.error('Failed to update goal');
        } finally {
          set({ isLoading: false });
        }
      },

      deleteGoal: async (id) => {
        const isDemo = useAuthStore.getState().isDemo;
        if (isDemo) {
          set((state) => ({
            goals: state.goals.filter((g) => g.id !== id)
          }));
          return;
        }

        try {
          set({ isLoading: true, error: null });
          const { error } = await supabase
            .from('goals')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set(state => ({
            goals: state.goals.filter(g => g.id !== id),
            lastFetched: Date.now()
          }));
          toast.success('Goal deleted successfully');
        } catch (error: any) {
          console.error('Error deleting goal:', error);
          set({ error: error.message });
          toast.error('Failed to delete goal');
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'luna-goals',
      partialize: (state) => ({
        goals: state.goals,
        lastFetched: state.lastFetched
      })
    }
  )
); 