import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  category: string;
  notes?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface UpcomingPayment {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  type: 'incoming' | 'outgoing';
  notes?: string;
  user_id: string;
}

interface SubscriptionStore {
  subscriptions: Subscription[];
  upcomingPayments: UpcomingPayment[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchSubscriptions: () => Promise<void>;
  addSubscription: (subscription: Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSubscription: (id: string, subscription: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  fetchUpcomingPayments: () => Promise<void>;
  addCustomPayment: (payment: Omit<UpcomingPayment, 'id' | 'user_id'>) => Promise<void>;
  updatePayment: (id: string, payment: Partial<UpcomingPayment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Demo data
const demoSubscriptions = [
  {
    id: 'demo-sub-1',
    name: 'Netflix',
    amount: 15.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'entertainment',
    notes: 'Premium plan',
    user_id: 'demo-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-sub-2',
    name: 'Spotify',
    amount: 9.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'entertainment',
    notes: 'Family plan',
    user_id: 'demo-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-sub-3',
    name: 'Gym Membership',
    amount: 50,
    billingCycle: 'monthly',
    nextBillingDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'health',
    notes: 'Annual contract',
    user_id: 'demo-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const demoUpcomingPayments = [
  {
    id: 'demo-payment-1',
    description: 'Rent Payment',
    amount: 1200,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'outgoing',
    user_id: 'demo-user'
  },
  {
    id: 'demo-payment-2',
    description: 'Client Invoice',
    amount: 2500,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'incoming',
    user_id: 'demo-user'
  }
];

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      subscriptions: [],
      upcomingPayments: [],
      isLoading: false,
      error: null,
      lastFetched: null,

      fetchSubscriptions: async () => {
        const isDemo = useAuthStore.getState().isDemo;
        if (isDemo) {
          set({ 
            subscriptions: demoSubscriptions,
            upcomingPayments: demoUpcomingPayments,
            lastFetched: Date.now(),
            isLoading: false,
            error: null
          });
          return;
        }

        const now = Date.now();
        const lastFetched = get().lastFetched;
        const subscriptions = get().subscriptions;

        // Return cached data if it's still fresh and we have data
        if (lastFetched && now - lastFetched < CACHE_DURATION && subscriptions.length > 0) {
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) throw new Error('No active session');

          // Fetch subscriptions with pagination and ordering
          const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', session.user.id)
            .order('next_billing_date', { ascending: true })
            .limit(20); // Limit to 20 most recent subscriptions

          if (error) throw error;

          // Map database columns to frontend properties with error handling
          const mappedSubscriptions = (data || []).map(item => {
            try {
              return {
                id: item.id,
                name: item.name,
                amount: parseFloat(item.amount) || 0,
                billingCycle: item.billing_cycle,
                nextBillingDate: item.next_billing_date,
                category: item.category,
                notes: item.notes,
                user_id: item.user_id,
                created_at: item.created_at,
                updated_at: item.updated_at
              };
            } catch (err) {
              console.error('Error mapping subscription:', err);
              return null;
            }
          }).filter(Boolean);

          set({ 
            subscriptions: mappedSubscriptions, 
            isLoading: false,
            lastFetched: now,
            error: null
          });
          
          // Fetch upcoming payments in the background
          get().fetchUpcomingPayments().catch(console.error);
        } catch (error) {
          console.error('Error fetching subscriptions:', error);
          set({ 
            error: 'Failed to fetch subscriptions', 
            isLoading: false,
            lastFetched: null // Reset lastFetched on error
          });
        }
      },

      addSubscription: async (subscription) => {
        const isDemo = useAuthStore.getState().isDemo;
        if (isDemo) {
          const newSubscription = {
            id: `demo-sub-${Date.now()}`,
            user_id: 'demo-user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...subscription
          };
          set(state => ({
            subscriptions: [...state.subscriptions, newSubscription],
            isLoading: false,
            error: null,
            lastFetched: Date.now()
          }));
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) throw new Error('No active session');

          const { data, error } = await supabase
            .from('subscriptions')
            .insert([{
              ...subscription,
              user_id: session.user.id
            }])
            .select()
            .single();

          if (error) throw error;

          set(state => ({
            subscriptions: [...state.subscriptions, data],
            isLoading: false,
            error: null,
            lastFetched: Date.now()
          }));
        } catch (error) {
          console.error('Error adding subscription:', error);
          set({ error: 'Failed to add subscription', isLoading: false });
          throw error;
        }
      },

      updateSubscription: async (id, subscription) => {
        const isDemo = useAuthStore.getState().isDemo;
        if (isDemo) {
          set(state => ({
            subscriptions: state.subscriptions.map(sub =>
              sub.id === id ? { ...sub, ...subscription, updated_at: new Date().toISOString() } : sub
            ),
            isLoading: false,
            error: null,
            lastFetched: Date.now()
          }));
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('subscriptions')
            .update({
              ...subscription,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          set(state => ({
            subscriptions: state.subscriptions.map(sub => sub.id === id ? data : sub),
            isLoading: false,
            lastFetched: Date.now()
          }));
        } catch (error) {
          console.error('Error updating subscription:', error);
          set({ error: 'Failed to update subscription', isLoading: false });
        }
      },

      deleteSubscription: async (id) => {
        const isDemo = useAuthStore.getState().isDemo;
        if (isDemo) {
          set(state => ({
            subscriptions: state.subscriptions.filter(sub => sub.id !== id),
            isLoading: false,
            error: null,
            lastFetched: Date.now()
          }));
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('subscriptions')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set(state => ({
            subscriptions: state.subscriptions.filter(sub => sub.id !== id),
            isLoading: false,
            lastFetched: Date.now()
          }));
        } catch (error) {
          console.error('Error deleting subscription:', error);
          set({ error: 'Failed to delete subscription', isLoading: false });
        }
      },

      fetchUpcomingPayments: async () => {
        const isDemo = useAuthStore.getState().isDemo;
        if (isDemo) {
          set({ upcomingPayments: demoUpcomingPayments });
          return;
        }

        try {
          const { data: session } = await supabase.auth.getSession();
          if (!session?.user) throw new Error('No user session found');

          const { data: payments, error } = await supabase
            .from('upcoming_payments')
            .select('*')
            .eq('user_id', session.user.id)
            .order('dueDate', { ascending: true });

          if (error) throw error;

          set({ upcomingPayments: payments || [] });
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      addCustomPayment: async (payment) => {
        const isDemo = useAuthStore.getState().isDemo;
        if (isDemo) {
          const newPayment = {
            id: `demo-payment-${Date.now()}`,
            user_id: 'demo-user',
            ...payment
          };
          set(state => ({
            upcomingPayments: [...state.upcomingPayments, newPayment],
            isLoading: false,
            error: null
          }));
          return;
        }

        try {
          set({ isLoading: true, error: null });
          
          const { data: session } = await supabase.auth.getSession();
          if (!session?.user) throw new Error('No user session found');

          const { data, error } = await supabase
            .from('upcoming_payments')
            .insert([{ ...payment, user_id: session.user.id }])
            .select()
            .single();

          if (error) throw error;

          set(state => ({
            upcomingPayments: [...state.upcomingPayments, data],
            isLoading: false,
            error: null
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      updatePayment: async (id, payment) => {
        const isDemo = useAuthStore.getState().isDemo;
        if (isDemo) {
          set(state => ({
            upcomingPayments: state.upcomingPayments.map(p =>
              p.id === id ? { ...p, ...payment } : p
            ),
            isLoading: false,
            error: null
          }));
          return;
        }

        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase
            .from('upcoming_payments')
            .update(payment)
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          set(state => ({
            upcomingPayments: state.upcomingPayments.map(p =>
              p.id === id ? { ...p, ...data } : p
            ),
            isLoading: false,
            error: null
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      deletePayment: async (id) => {
        const isDemo = useAuthStore.getState().isDemo;
        if (isDemo) {
          set(state => ({
            upcomingPayments: state.upcomingPayments.filter(p => p.id !== id),
            isLoading: false,
            error: null
          }));
          return;
        }

        try {
          set({ isLoading: true, error: null });

          const { error } = await supabase
            .from('upcoming_payments')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set(state => ({
            upcomingPayments: state.upcomingPayments.filter(p => p.id !== id),
            isLoading: false,
            error: null
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      }
    }),
    {
      name: 'luna-subscriptions',
      partialize: (state) => ({
        subscriptions: state.subscriptions,
        upcomingPayments: state.upcomingPayments,
        lastFetched: state.lastFetched
      })
    }
  )
); 