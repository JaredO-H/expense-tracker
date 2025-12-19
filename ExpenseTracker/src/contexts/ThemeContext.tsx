/**
 * Theme Context
 * Manages dark mode state throughout the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { getGeneralSettings } from '../utils/generalSettings';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [useSystemTheme, setUseSystemTheme] = useState(true);

  useEffect(() => {
    loadThemeSettings();
  }, []);

  useEffect(() => {
    if (useSystemTheme && systemColorScheme) {
      setIsDarkMode(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, useSystemTheme]);

  const loadThemeSettings = async () => {
    try {
      const settings = await getGeneralSettings();
      setUseSystemTheme(settings.useSystemTheme);

      if (settings.useSystemTheme) {
        // Use system preference
        const colorScheme = Appearance.getColorScheme();
        setIsDarkMode(colorScheme === 'dark');
      } else {
        // Use user preference
        setIsDarkMode(settings.darkMode);
      }
    } catch (error) {
      console.error('Failed to load theme settings:', error);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const refreshTheme = async () => {
    await loadThemeSettings();
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, refreshTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
