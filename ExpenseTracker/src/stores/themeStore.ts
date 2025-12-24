/**
 * Theme Store - Manages light/dark mode state
 * Uses Zustand for state management with persistence
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  isLoading: boolean;
  setTheme: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  loadTheme: () => Promise<void>;
}

const THEME_STORAGE_KEY = '@expense_tracker_theme';

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  isLoading: true,

  // Load theme from storage on app start
  loadTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        set({ mode: savedTheme, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
      set({ isLoading: false });
    }
  },

  // Set theme and persist to storage
  setTheme: async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      set({ mode });
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  },

  // Toggle between light and dark
  toggleTheme: async () => {
    const currentMode = get().mode;
    const newMode: ThemeMode = currentMode === 'light' ? 'dark' : 'light';
    await get().setTheme(newMode);
  },
}));
