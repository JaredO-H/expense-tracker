/**
 * Neo-Memphis Spacing & Sizing
 * Bold spacing and geometric border radii
 */

export const spacing = {
  // Base spacing scale (multiples of 4, generous for breathing room)
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
  massive: 64,
  ultra: 80,
} as const;

export const borderRadius = {
  none: 0, // Sharp corners for geometric look
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16, // Slightly more rounded
  xl: 20,
  xxl: 28,
  xxxl: 36,
  round: 999, // Full circles
  blob: 50, // Organic shapes
} as const;

export const iconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  xxl: 48,
} as const;

export const buttonHeights = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56,
} as const;

export const inputHeights = {
  sm: 36,
  md: 44,
  lg: 52,
} as const;

export const containerPadding = {
  horizontal: 16,
  vertical: 16,
  screen: 20,
} as const;

export const tabBarHeight = 60;
export const headerHeight = 56;

// Memphis-inspired bold shadows
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  // Colored shadows for extra flair
  colored: {
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  // Offset shadow (Memphis-style)
  offset: {
    shadowColor: '#2D3436',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;
