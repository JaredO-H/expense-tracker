/**
 * Color Palette
 * Centralized color definitions for the app
 */

export const colors = {
  // Primary Colors
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  primaryLight: '#60a5fa',

  // Text Colors
  textPrimary: '#111827',
  textSecondary: '#374151',
  textTertiary: '#6b7280',
  textDisabled: '#9ca3af',
  textInverse: '#ffffff',

  // Background Colors
  background: '#ffffff',
  backgroundSecondary: '#f9fafb',
  backgroundTertiary: '#f3f4f6',
  backgroundDisabled: '#e5e7eb',

  // Status Colors
  success: '#059669',
  successLight: '#dcfce7',
  successDark: '#047857',

  error: '#e53e3e',
  errorLight: '#fee2e2',
  errorDark: '#dc2626',

  warning: '#f59e0b',
  warningLight: '#fef3c7',
  warningDark: '#d97706',

  info: '#1e40af',
  infoLight: '#dbeafe',
  infoBg: '#eff6ff',

  // Neutral Colors
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',

  // Border Colors
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  borderDark: '#d1d5db',

  // Shadow Colors
  shadow: '#000000',

  // Transparent
  transparent: 'transparent',

  // White overlays
  whiteOverlay10: 'rgba(255, 255, 255, 0.1)',
  whiteOverlay20: 'rgba(255, 255, 255, 0.2)',
  whiteOverlay30: 'rgba(255, 255, 255, 0.3)',
  whiteOverlay60: 'rgba(255, 255, 255, 0.6)',
  whiteOverlay80: 'rgba(255, 255, 255, 0.8)',

  // Black overlays
  blackOverlay10: 'rgba(0, 0, 0, 0.1)',
  blackOverlay20: 'rgba(0, 0, 0, 0.2)',
  blackOverlay30: 'rgba(0, 0, 0, 0.3)',
  blackOverlay50: 'rgba(0, 0, 0, 0.5)',
  blackOverlay80: 'rgba(0, 0, 0, 0.8)',
} as const;

export type ColorName = keyof typeof colors;
