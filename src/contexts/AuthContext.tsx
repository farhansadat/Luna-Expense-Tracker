import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useUserSettingsStore } from '../store/userSettingsStore';

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  isOnboardingCompleted: boolean;
  checkOnboardingStatus: () => Promise<boolean>;
  userProfile: any | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { updateSettings } = useUserSettingsStore();

  const loadUserProfile = async (userId: string, retries = 3) => {
    try {
      // Add a small delay before making the request
      await delay(500);

      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) throw new Error('No active session');

      // First, check if profile exists
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // If profile doesn't exist, create it
      if (!profile) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: userId,
            name: session.user?.user_metadata?.name || '',
            onboarding_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (createError) throw createError;
        
        setUserProfile(newProfile);
        updateSettings({
          monthlyIncome: newProfile?.monthly_income || 0,
          name: newProfile?.name || '',
          currency: newProfile?.currency || 'USD'
        });

        return newProfile;
      }

      setUserProfile(profile);
      updateSettings({
        monthlyIncome: profile?.monthly_income || 0,
        name: profile?.name || '',
        currency: profile?.currency || 'USD'
      });

      return profile;
    } catch (error) {
      console.error('Error loading user profile:', error);
      if (retries > 0) {
        await delay(1000);
        return loadUserProfile(userId, retries - 1);
      }
      return null;
    }
  };

  const checkOnboardingStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return false;

      const profile = await loadUserProfile(session.user.id);
      if (!profile) return false;

      setIsOnboardingCompleted(!!profile.onboarding_completed);
      return !!profile.onboarding_completed;
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
    isLoading: loading
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