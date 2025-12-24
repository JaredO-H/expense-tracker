/**
 * Neo-Memphis Color Palette
 * Bold, playful colors inspired by 1980s Memphis Design movement
 * Makes finance exciting, not boring!
 */

export const colors = {
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

  // Dark Mode Backgrounds
  backgroundDark: '#1A1B26', // Deep navy/charcoal
  backgroundDarkSecondary: '#24283B', // Slate
  backgroundDarkTertiary: '#2C3043', // Dark slate

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

  // Neutral Grays - Less used, but available
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

export type ColorName = keyof typeof colors;
