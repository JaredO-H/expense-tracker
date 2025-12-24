/**
 * Neo-Memphis Color Palette - with Light & Dark Mode Support
 * Bold, playful colors inspired by 1980s Memphis Design movement
 * Makes finance exciting, not boring!
 */

import { ThemeMode } from '../stores/themeStore';

// Light Mode Colors - Original Neo-Memphis Palette
const lightColors = {
  // Primary Colors - Bold and Energetic
  primary: '#FF6B6B', // Coral Red - main brand color
  primaryDark: '#E63946', // Deep Coral
  primaryLight: '#FF8E8E', // Light Coral

  secondary: '#4ECDC4', // Electric Teal - secondary actions
  secondaryDark: '#2EC4B6', // Deep Teal
  secondaryLight: '#7FDBDE', // Light Teal

  // Accent Colors - Memphis-inspired vibrant palette
  accent1: '#FFE66D', // Mustard Yellow - highlights
  accent1Dark: '#FCC419', // Golden Yellow
  accent1Light: '#FFF3BF', // Pale Yellow

  accent2: '#95E1D3', // Mint Green - success/positive
  accent2Dark: '#51CF66', // Bright Green
  accent2Light: '#C3FAE8', // Pale Mint

  accent3: '#C8B6FF', // Soft Lavender - info/special
  accent3Dark: '#9775FA', // Purple
  accent3Light: '#E5DBFF', // Pale Lavender

  accent4: '#FF8E3C', // Tangerine - warnings
  accent4Dark: '#FD7E14', // Bright Orange
  accent4Light: '#FFB85C', // Peach

  // Background Colors - Warm neutrals
  background: '#FFF8F0', // Warm cream - main background
  backgroundSecondary: '#FFF0DB', // Soft peach background
  backgroundTertiary: '#FFE4C4', // Bisque
  backgroundElevated: '#FFFFFF', // Pure white for cards

  // Text Colors - Strong contrast
  textPrimary: '#2D3436', // Dark charcoal
  textSecondary: '#636E72', // Medium gray
  textTertiary: '#95A5A6', // Light gray
  textDisabled: '#BDC3C7', // Very light gray
  textInverse: '#FFFFFF', // White
  textOnPrimary: '#FFFFFF', // White on coral
  textOnSecondary: '#1A1B26', // Dark on teal

  // Status Colors - Memphis style
  success: '#51CF66', // Bright green
  successLight: '#C3FAE8', // Pale mint
  successDark: '#37B24D', // Deep green

  error: '#FF6B6B', // Coral (matches primary for cohesion)
  errorLight: '#FFE3E3', // Pale coral
  errorDark: '#E63946', // Deep coral

  warning: '#FCC419', // Golden yellow
  warningLight: '#FFF3BF', // Pale yellow
  warningDark: '#F59F00', // Amber

  info: '#4ECDC4', // Teal (matches secondary)
  infoLight: '#C3FAE8', // Pale teal
  infoDark: '#2EC4B6', // Deep teal

  // Geometric Pattern Colors (for category badges)
  pattern1: '#FF6B6B', // Coral
  pattern2: '#4ECDC4', // Teal
  pattern3: '#FFE66D', // Yellow
  pattern4: '#95E1D3', // Mint
  pattern5: '#C8B6FF', // Lavender
  pattern6: '#FF8E3C', // Orange
  pattern7: '#FA8BFF', // Pink
  pattern8: '#2EC4B6', // Deep teal

  // Neutral Grays
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',

  // Border Colors - Visible and bold
  border: '#2D3436', // Dark borders for Memphis look
  borderLight: '#95A5A6', // Medium borders
  borderSubtle: '#E0E0E0', // Subtle borders
  borderAccent: '#FF6B6B', // Accent borders

  // Shadow Colors
  shadow: '#000000',
  shadowColored: 'rgba(255, 107, 107, 0.3)', // Colored shadow for depth

  // Overlays
  overlay: 'rgba(45, 52, 54, 0.8)', // Dark overlay
  overlayLight: 'rgba(45, 52, 54, 0.4)', // Light overlay

  // Transparent
  transparent: 'transparent',

  // Semi-transparent overlays
  whiteOverlay10: 'rgba(255, 255, 255, 0.1)',
  whiteOverlay20: 'rgba(255, 255, 255, 0.2)',
  whiteOverlay30: 'rgba(255, 255, 255, 0.3)',
  whiteOverlay60: 'rgba(255, 255, 255, 0.6)',
  whiteOverlay80: 'rgba(255, 255, 255, 0.8)',

  blackOverlay10: 'rgba(0, 0, 0, 0.1)',
  blackOverlay20: 'rgba(0, 0, 0, 0.2)',
  blackOverlay30: 'rgba(0, 0, 0, 0.3)',
  blackOverlay50: 'rgba(0, 0, 0, 0.5)',
  blackOverlay80: 'rgba(0, 0, 0, 0.8)',
} as const;

// Dark Mode Colors - Neo-Memphis adapted for dark backgrounds
const darkColors = {
  // Primary Colors - Slightly brighter for dark mode
  primary: '#FF8585', // Brighter Coral for visibility
  primaryDark: '#FF6B6B', // Original Coral
  primaryLight: '#FFB3B3', // Very Light Coral

  secondary: '#5EDDD4', // Brighter Teal
  secondaryDark: '#4ECDC4', // Original Teal
  secondaryLight: '#8EE7E0', // Pale Teal

  // Accent Colors - Vibrant on dark
  accent1: '#FFF087', // Brighter Mustard Yellow
  accent1Dark: '#FFE66D', // Original Yellow
  accent1Light: '#FFFADB', // Very Pale Yellow

  accent2: '#A8F5E9', // Brighter Mint
  accent2Dark: '#95E1D3', // Original Mint
  accent2Light: '#D0FCF4', // Very Pale Mint

  accent3: '#D5C4FF', // Brighter Lavender
  accent3Dark: '#C8B6FF', // Original Lavender
  accent3Light: '#EDE5FF', // Very Pale Lavender

  accent4: '#FFA15C', // Brighter Tangerine
  accent4Dark: '#FF8E3C', // Original Tangerine
  accent4Light: '#FFC490', // Pale Orange

  // Background Colors - Dark Memphis
  background: '#1A1B26', // Deep navy/charcoal - main background
  backgroundSecondary: '#24283B', // Slate - elevated background
  backgroundTertiary: '#2C3043', // Dark slate - more elevated
  backgroundElevated: '#33354A', // Lighter slate for cards

  // Text Colors - Light on dark
  textPrimary: '#E8E8E8', // Light gray - main text
  textSecondary: '#A0A0B0', // Medium gray
  textTertiary: '#6B6B80', // Darker gray
  textDisabled: '#4A4A5A', // Very dark gray
  textInverse: '#1A1B26', // Dark (for light backgrounds)
  textOnPrimary: '#FFFFFF', // White on coral
  textOnSecondary: '#1A1B26', // Dark on teal

  // Status Colors - Bright for dark mode
  success: '#5FD97A', // Bright green
  successLight: 'rgba(95, 217, 122, 0.2)', // Transparent mint
  successDark: '#51CF66', // Original green

  error: '#FF8585', // Bright coral
  errorLight: 'rgba(255, 133, 133, 0.2)', // Transparent coral
  errorDark: '#FF6B6B', // Original coral

  warning: '#FFD93D', // Bright yellow
  warningLight: 'rgba(255, 217, 61, 0.2)', // Transparent yellow
  warningDark: '#FCC419', // Original yellow

  info: '#5EDDD4', // Bright teal
  infoLight: 'rgba(94, 221, 212, 0.2)', // Transparent teal
  infoDark: '#4ECDC4', // Original teal

  // Geometric Pattern Colors - Same vibrant colors work on dark
  pattern1: '#FF8585', // Bright Coral
  pattern2: '#5EDDD4', // Bright Teal
  pattern3: '#FFF087', // Bright Yellow
  pattern4: '#A8F5E9', // Bright Mint
  pattern5: '#D5C4FF', // Bright Lavender
  pattern6: '#FFA15C', // Bright Orange
  pattern7: '#FF9FFF', // Bright Pink
  pattern8: '#4ECDC4', // Teal

  // Neutral Grays - Inverted for dark
  gray50: '#212121',
  gray100: '#2A2A2A',
  gray200: '#363636',
  gray300: '#424242',
  gray400: '#616161',
  gray500: '#757575',
  gray600: '#9E9E9E',
  gray700: '#BDBDBD',
  gray800: '#E0E0E0',
  gray900: '#F5F5F5',

  // Border Colors - Lighter for dark mode
  border: '#E8E8E8', // Light borders for dark mode
  borderLight: '#6B6B80', // Medium borders
  borderSubtle: '#33354A', // Subtle borders
  borderAccent: '#FF8585', // Accent borders

  // Shadow Colors - Deeper shadows on dark
  shadow: '#000000',
  shadowColored: 'rgba(255, 133, 133, 0.4)', // Colored shadow

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.85)', // Darker overlay
  overlayLight: 'rgba(0, 0, 0, 0.5)', // Medium overlay

  // Transparent
  transparent: 'transparent',

  // Semi-transparent overlays - adjusted for dark
  whiteOverlay10: 'rgba(255, 255, 255, 0.08)',
  whiteOverlay20: 'rgba(255, 255, 255, 0.15)',
  whiteOverlay30: 'rgba(255, 255, 255, 0.25)',
  whiteOverlay60: 'rgba(255, 255, 255, 0.5)',
  whiteOverlay80: 'rgba(255, 255, 255, 0.7)',

  blackOverlay10: 'rgba(0, 0, 0, 0.15)',
  blackOverlay20: 'rgba(0, 0, 0, 0.3)',
  blackOverlay30: 'rgba(0, 0, 0, 0.45)',
  blackOverlay50: 'rgba(0, 0, 0, 0.6)',
  blackOverlay80: 'rgba(0, 0, 0, 0.85)',
} as const;

// Current theme colors - will be updated by getColors function
let currentColors: typeof lightColors | typeof darkColors = lightColors;
let currentTheme: ThemeMode = 'light';

// Listeners for theme changes
const themeChangeListeners: Set<() => void> = new Set();

/**
 * Subscribe to theme changes
 */
export const subscribeToThemeChanges = (listener: () => void) => {
  themeChangeListeners.add(listener);
  return () => themeChangeListeners.delete(listener);
};

/**
 * Get colors for the specified theme
 * Call this when theme changes to update the color palette
 */
export const getColors = (theme: ThemeMode) => {
  const previousTheme = currentTheme;
  currentTheme = theme;
  currentColors = theme === 'dark' ? darkColors : lightColors;

  // Notify all listeners if theme actually changed
  if (previousTheme !== theme) {
    themeChangeListeners.forEach(listener => listener());
  }

  return currentColors;
};

/**
 * Get current theme mode
 */
export const getCurrentTheme = () => currentTheme;

/**
 * Get current colors - always returns the active color palette
 * This function should be called fresh each render to get updated colors
 */
export const getActiveColors = () => currentColors;

/**
 * Export colors proxy that always returns current theme colors
 * This allows existing code to continue using `colors.primary` etc.
 * Note: Components won't auto-update unless they use useTheme hook
 */
export const colors = new Proxy(currentColors, {
  get(_target, prop) {
    return currentColors[prop as keyof typeof currentColors];
  },
}) as typeof lightColors;

// Export the color palettes for direct access if needed
export const lightPalette = lightColors;
export const darkPalette = darkColors;

export type ColorName = keyof typeof lightColors;
