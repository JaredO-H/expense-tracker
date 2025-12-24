/**
 * useTheme Hook
 * Subscribe to theme changes and get current theme colors
 * Components using this hook will re-render when theme changes
 */

import { useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { getColors, colors } from '../styles/colors';

export const useTheme = () => {
  const { mode, setTheme, toggleTheme } = useThemeStore();

  // Update colors when theme mode changes
  useEffect(() => {
    getColors(mode);
  }, [mode]);

  return {
    mode,
    colors,
    setTheme,
    toggleTheme,
    isDark: mode === 'dark',
    isLight: mode === 'light',
  };
};
