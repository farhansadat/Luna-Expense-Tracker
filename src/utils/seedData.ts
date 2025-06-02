import { supabase } from '../lib/supabase';

export const mockAccounts = [
  {
    name: 'Main Checking',
    type: 'personal',
    balance: 27000.00,
    currency: 'USD',
    color: '#6366F1',
    icon: 'wallet',
    is_default: true
  },
  {
    name: 'Family Savings',
    type: 'family',
    balance: 15750.89,
    currency: 'USD',
    color: '#10B981',
    icon: 'piggy-bank',
    is_default: false
  },
  {
    name: 'Business Account',
    type: 'business',
    balance: 8420.50,
    currency: 'USD',
    color: '#8B5CF6',
    icon: 'building',
    is_default: false
  }
];

export const mockScheduledPayments = [
  {
    description: 'Netflix Subscription',
    amount: 15.99,
    next_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    type: 'subscription',
    category: 'entertainment'
  },
  {
    description: 'Rent Payment',
    amount: 2000.00,
    next_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    type: 'recurring',
    category: 'housing'
  },
  {
    description: 'Gym Membership',
    amount: 49.99,
    next_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    type: 'subscription',
    category: 'health'
  }
];

export const mockGoals = [
  {
    name: 'Emergency Fund',
    target_amount: 10000.00,
    current_amount: 5000.00,
    deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'savings',
    priority: 'high'
  },
  {
    name: 'New Car',
    target_amount: 25000.00,
    current_amount: 8000.00,
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'purchase',
    priority: 'medium'
  }
];

export const mockInvestments = [
  {
    name: 'Stock Portfolio',
    amount: 15000.00,
    current_value: 16500.00,
    type: 'stocks',
    platform: 'Vanguard'
  },
  {
    name: 'Crypto Holdings',
    amount: 5000.00,
    current_value: 5750.00,
    type: 'crypto',
    platform: 'Coinbase'
  }
];

export async function seedDashboardData(userId: string) {
  try {
    // Add accounts
    for (const account of mockAccounts) {
      console.log('Attempting to insert account:', account);
      const { data, error: accountError } = await supabase
        .from('accounts')
        .insert([{
          ...account,
          user_id: userId,
          created_at: new Date().toISOString()
        }])
        .select();

      if (accountError) {
        console.error('Error inserting account:', account.name, accountError);
        throw accountError;
      }
      console.log('Successfully inserted account:', account.name);
    }

    // Add scheduled payments
    for (const payment of mockScheduledPayments) {
      const { error: paymentError } = await supabase
        .from('scheduled_payments')
        .insert([{
          ...payment,
          user_id: userId,
          created_at: new Date().toISOString()
        }]);

      if (paymentError) throw paymentError;
    }

    // Add goals
    for (const goal of mockGoals) {
      const { error: goalError } = await supabase
        .from('financial_goals')
        .insert([{
          ...goal,
          user_id: userId,
          created_at: new Date().toISOString()
        }]);

      if (goalError) throw goalError;
    }

    // Add investments
    for (const investment of mockInvestments) {
      const { error: investmentError } = await supabase
        .from('investments')
        .insert([{
          ...investment,
          user_id: userId,
          created_at: new Date().toISOString()
        }]);

      if (investmentError) throw investmentError;
    }

    return true;
  } catch (error) {
    console.error('Error seeding dashboard data:', error);
    throw error;
  }
}

// Make seeding function available globally
declare global {
  interface Window {
    FinWise: {
      seedData: () => Promise<void>;
    };
  }
}

// Initialize the global object
if (typeof window !== 'undefined') {
  window.FinWise = {
    seedData: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No user found. Please log in first.');
          return;
        }
        
        console.log('Starting to seed data...');
        const success = await seedDashboardData(user.id);
        if (success) {
          console.log('Successfully seeded data! Please refresh the page.');
        } else {
          console.error('Failed to seed data. Check console for errors.');
        }
      } catch (error) {
        console.error('Error in seedData:', error);
      }
    }
  };
} 