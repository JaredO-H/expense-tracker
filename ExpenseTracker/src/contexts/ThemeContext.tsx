/**
 * Theme Context
 * Manages dark mode state throughout the app
 * Integrates with color system for theme-aware styling
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getColors, getActiveColors } from '../styles/colors';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  refreshTheme: () => Promise<void>;
  colors: ReturnType<typeof getActiveColors>;
  themeVersion: number; // Force re-renders when theme changes
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
  const [themeVersion, setThemeVersion] = useState(0);
  const [colors, setColors] = useState(() => getActiveColors());

  useEffect(() => {
    loadThemeSettings();
  }, []);

  useEffect(() => {
    if (useSystemTheme && systemColorScheme) {
      setIsDarkMode(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, useSystemTheme]);

  // Update colors when theme changes
  useEffect(() => {
    console.log('Theme changing to:', isDarkMode ? 'dark' : 'light');
    const newColors = getColors(isDarkMode ? 'dark' : 'light');
    setColors(newColors);
    // Increment version to force all consumers to re-render
    setThemeVersion(prev => prev + 1);
  }, [isDarkMode]);

  const loadThemeSettings = async () => {
    try {
      const storedUseSystemTheme = await AsyncStorage.getItem('@theme_use_system');
      const storedDarkMode = await AsyncStorage.getItem('@theme_dark_mode');

      const useSystem = storedUseSystemTheme !== null ? JSON.parse(storedUseSystemTheme) : true;
      setUseSystemTheme(useSystem);

      if (useSystem) {
        // Use system preference
        const colorScheme = Appearance.getColorScheme();
        setIsDarkMode(colorScheme === 'dark');
      } else {
        // Use user preference
        const darkMode = storedDarkMode !== null ? JSON.parse(storedDarkMode) : false;
        setIsDarkMode(darkMode);
      }
    } catch (error) {
      console.error('Failed to load theme settings:', error);
    }
  };

  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    console.log('Toggling dark mode to:', newMode);
    setIsDarkMode(newMode);
    setUseSystemTheme(false);

    // Save to persistent storage
    try {
      await AsyncStorage.setItem('@theme_dark_mode', JSON.stringify(newMode));
      await AsyncStorage.setItem('@theme_use_system', JSON.stringify(false));
    } catch (error) {
      console.error('Failed to save dark mode preference:', error);
    }
  };

  const refreshTheme = async () => {
    await loadThemeSettings();
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        refreshTheme,
        colors, // Use state that updates with theme changes
        themeVersion, // Force re-renders when this changes
      }}>
      {children}
    </ThemeContext.Provider>
  );
};
