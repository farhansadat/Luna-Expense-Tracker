import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserSettings {
  name: string;
  currency: string;
  monthlyIncome: number;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    weekly_summary: boolean;
  };
  language: string;
  biometricEnabled: boolean;
  twoFactorEnabled: boolean;
  autoLogoutTime: number;
  dataLockdownEnabled: boolean;
  exportEncryptionEnabled: boolean;
}

interface UserSettingsStore extends UserSettings {
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: UserSettings = {
  name: '',
  currency: 'USD',
  monthlyIncome: 0,
  theme: 'dark',
  notifications: {
    email: true,
    push: true,
    weekly_summary: true
  },
  language: 'en',
  biometricEnabled: false,
  twoFactorEnabled: false,
  autoLogoutTime: 30,
  dataLockdownEnabled: false,
  exportEncryptionEnabled: false,
};

export const useUserSettingsStore = create<UserSettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      updateSettings: (settings) => set((state) => ({
        ...state,
        ...settings,
        notifications: {
          ...state.notifications,
          ...(settings.notifications || {})
        }
      })),
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'luna-user-settings',
    }
  )
); 