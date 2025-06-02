import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useUserSettingsStore } from '../store/userSettingsStore';
import { useAuthStore } from '../store/authStore';

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  isOnboardingCompleted: boolean;
  checkOnboardingStatus: () => Promise<boolean>;
  userProfile: any | null;
  isLoading: boolean;
  isDemo: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { updateSettings } = useUserSettingsStore();
  const { isDemo, setDemoMode } = useAuthStore();

  const setupDemoUser = () => {
    const demoUser = {
      id: 'demo-user',
      email: 'demo@finwise.com',
      user_metadata: { name: 'Demo User' }
    } as User;

    setUser(demoUser);
    setIsOnboardingCompleted(true);
    setUserProfile({
      id: demoUser.id,
      name: 'Demo User',
      onboarding_completed: true,
      currency: 'USD',
      monthly_income: 5000,
      monthly_budget: 3500,
      total_balance: 27000,
    });

    updateSettings({
      name: 'Demo User',
      currency: 'USD',
      monthlyIncome: 5000,
      monthlyBudget: 3500,
      totalBalance: 27000,
      onboardingCompleted: true
    });
  };

  const fetchProfile = async (userId: string, retryCount = 0) => {
    if (isDemo) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile not found - this is expected for new users
          setIsOnboardingCompleted(false);
          return;
        }
        throw error;
      }

      if (profile) {
        setIsOnboardingCompleted(profile.onboarding_completed || false);
        setUserProfile(profile);
        updateSettings({
          name: profile.name,
          currency: profile.currency || 'USD',
          monthlyIncome: profile.monthly_income || 0,
          monthlyBudget: profile.monthly_budget || 0,
          totalBalance: profile.total_balance || 0,
          onboardingCompleted: profile.onboarding_completed || false
        });

        // Only redirect to onboarding if we're not already there and not in the login process
        if (!profile.onboarding_completed && 
            !location.pathname.includes('onboarding') && 
            !location.pathname.includes('login') &&
            !location.pathname.includes('register')) {
          window.location.href = '/app/onboarding';
        }
      }
    } catch (error: any) {
      console.error('Profile fetch error:', error);
      if (retryCount < 3) {
        // Exponential backoff for retries
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => fetchProfile(userId, retryCount + 1), delay);
      } else {
        // After 3 retries, just log the error
        console.error('Failed to fetch profile after 3 retries:', error);
      }
    }
  };

  const checkOnboardingStatus = async () => {
    if (isDemo) return true;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return false;

      await fetchProfile(session.user.id);
      return !!session.user.user_metadata.onboarding_completed;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await checkOnboardingStatus();
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await checkOnboardingStatus();
      } else {
        setUser(null);
        setIsOnboardingCompleted(false);
        setUserProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    // Check for demo account
    if (email === 'demo@finwise.com' && password === 'demo123') {
      setDemoMode(true);
      setupDemoUser();
      return;
    }
    
    setDemoMode(false);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (data?.user) {
      setUser(data.user);
      await checkOnboardingStatus();
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setDemoMode(false);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (signUpError) throw signUpError;

    if (data.user) {
      // Create profile immediately after signup
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          name: name,
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // If profile creation fails, try to delete the user
        await supabase.auth.admin.deleteUser(data.user.id);
        throw new Error('Failed to create user profile');
      }

      setUser(data.user);
      setIsOnboardingCompleted(false);
    }
  };

  const signOut = async () => {
    if (isDemo) {
      setDemoMode(false);
      setUser(null);
      setIsOnboardingCompleted(false);
      setUserProfile(null);
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setIsOnboardingCompleted(false);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    signIn,
    signUp,
    signOut,
    isOnboardingCompleted,
    checkOnboardingStatus,
    userProfile,
    isLoading: loading,
    isDemo
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 