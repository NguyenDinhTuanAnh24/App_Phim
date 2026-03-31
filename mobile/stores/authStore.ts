import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { User } from '@/constants/types';

interface AuthState {
  user?: User | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: { user: User; accessToken: string; refreshToken: string }) => Promise<void>;
  logout: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  updateUser: (user: User) => void;
  setLoading: (value: boolean) => void;
}

const persistTokens = async (accessToken: string, refreshToken: string) => {
  await SecureStore.setItemAsync('accessToken', accessToken);
  await SecureStore.setItemAsync('refreshToken', refreshToken);
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      login: async ({ user, accessToken, refreshToken }) => {
        set({ user, accessToken, refreshToken, isAuthenticated: true });
        await persistTokens(accessToken, refreshToken);
      },
      logout: async () => {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
      },
      setTokens: async (accessToken, refreshToken) => {
        set({ accessToken, refreshToken, isAuthenticated: true });
        await persistTokens(accessToken, refreshToken);
      },
      updateUser: (user) => set({ user }),
      setLoading: (value) => set({ isLoading: value }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);