import { create } from 'zustand';
import { mockAccounts, mockGoals, mockInvestments, mockScheduledPayments } from '../utils/seedData';
import { demoExpenses } from './expenseStore';

interface DemoStore {
  isDemoMode: boolean;
  accounts: typeof mockAccounts;
  expenses: typeof demoExpenses;
  goals: typeof mockGoals;
  investments: typeof mockInvestments;
  scheduledPayments: typeof mockScheduledPayments;
  setDemoMode: (enabled: boolean) => void;
  addExpense: (expense: any) => void;
  addGoal: (goal: any) => void;
  updateGoal: (goalId: string, updates: any) => void;
  addAccount: (account: any) => void;
  updateAccount: (accountId: string, updates: any) => void;
}

export const useDemoStore = create<DemoStore>((set) => ({
  isDemoMode: false,
  accounts: mockAccounts,
  expenses: demoExpenses,
  goals: mockGoals,
  investments: mockInvestments,
  scheduledPayments: mockScheduledPayments,
  
  setDemoMode: (enabled) => set({ isDemoMode: enabled }),
  
  addExpense: (expense) => set((state) => ({
    expenses: [...state.expenses, { ...expense, id: Math.random().toString() }]
  })),
  
  addGoal: (goal) => set((state) => ({
    goals: [...state.goals, { ...goal, id: Math.random().toString() }]
  })),
  
  updateGoal: (goalId, updates) => set((state) => ({
    goals: state.goals.map(goal => 
      goal.id === goalId ? { ...goal, ...updates } : goal
    )
  })),
  
  addAccount: (account) => set((state) => ({
    accounts: [...state.accounts, { ...account, id: Math.random().toString() }]
  })),
  
  updateAccount: (accountId, updates) => set((state) => ({
    accounts: state.accounts.map(account => 
      account.id === accountId ? { ...account, ...updates } : account
    )
  }))
})); 