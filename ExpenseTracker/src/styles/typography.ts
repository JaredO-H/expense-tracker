/**
 * Neo-Memphis Typography
 * Bold, geometric, and expressive type system
 * Numbers are heroes - money deserves attention!
 */

import { TextStyle } from 'react-native';
import { colors } from './colors';

export const fontSizes = {
  xs: 10,
  sm: 12,
  base: 15, // Slightly larger base
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 34,
  huge: 42, // Display sizes
  massive: 56, // Big impact
  ultra: 72, // For showing money amounts!
} as const;

export const fontWeights = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extrabold: '800' as TextStyle['fontWeight'], // For emphasis
  black: '900' as TextStyle['fontWeight'], // Maximum impact
} as const;

export const lineHeights = {
  tight: 1.1, // Tighter for display
  snug: 1.3,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
} as const;

// Letter spacing for visual impact
export const letterSpacing = {
  tighter: -1,
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 2,
} as const;

// Predefined text styles - Bold and expressive
export const textStyles = {
  // Display Styles - Big and bold for main headings
  display1: {
    fontSize: fontSizes.ultra,
    fontWeight: fontWeights.black,
    color: colors.textPrimary,
    lineHeight: fontSizes.ultra * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  display2: {
    fontSize: fontSizes.massive,
    fontWeight: fontWeights.black,
    color: colors.textPrimary,
    lineHeight: fontSizes.massive * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },

  // Headings - Strong hierarchy
  h1: {
    fontSize: fontSizes.huge,
    fontWeight: fontWeights.extrabold,
    color: colors.textPrimary,
    lineHeight: fontSizes.huge * lineHeights.snug,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    lineHeight: fontSizes.xxxl * lineHeights.snug,
  },
  h3: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    lineHeight: fontSizes.xxl * lineHeights.normal,
  },
  h4: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    lineHeight: fontSizes.xl * lineHeights.normal,
  },
  h5: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    lineHeight: fontSizes.lg * lineHeights.normal,
  },
  h6: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    lineHeight: fontSizes.md * lineHeights.normal,
  },

  // Money Amounts - Make numbers the star!
  amountLarge: {
    fontSize: fontSizes.massive,
    fontWeight: fontWeights.black,
    color: colors.primary,
    lineHeight: fontSizes.massive * lineHeights.tight,
    letterSpacing: letterSpacing.tighter,
  },
  amount: {
    fontSize: fontSizes.huge,
    fontWeight: fontWeights.extrabold,
    color: colors.primary,
    lineHeight: fontSizes.huge * lineHeights.tight,
  },
  amountMedium: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    lineHeight: fontSizes.xxxl * lineHeights.tight,
  },
  amountSmall: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    lineHeight: fontSizes.xl * lineHeights.tight,
  },

  // Body text - Readable but distinctive
  bodyLarge: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    color: colors.textPrimary,
    lineHeight: fontSizes.md * lineHeights.relaxed,
  },
  body: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.regular,
    color: colors.textPrimary,
    lineHeight: fontSizes.base * lineHeights.relaxed,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    color: colors.textSecondary,
    lineHeight: fontSizes.sm * lineHeights.normal,
  },
  bodyBold: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    lineHeight: fontSizes.base * lineHeights.normal,
  },

  // Labels - Strong and clear
  label: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    lineHeight: fontSizes.base * lineHeights.snug,
    textTransform: 'uppercase' as TextStyle['textTransform'],
    letterSpacing: letterSpacing.wide,
  },
  labelMedium: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    lineHeight: fontSizes.sm * lineHeights.snug,
    textTransform: 'uppercase' as TextStyle['textTransform'],
    letterSpacing: letterSpacing.wider,
  },
  labelSmall: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    color: colors.textSecondary,
    lineHeight: fontSizes.xs * lineHeights.snug,
    textTransform: 'uppercase' as TextStyle['textTransform'],
    letterSpacing: letterSpacing.widest,
  },

  // Captions - Subtle but present
  caption: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    color: colors.textTertiary,
    lineHeight: fontSizes.sm * lineHeights.normal,
  },
  captionBold: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
    lineHeight: fontSizes.sm * lineHeights.normal,
  },

  // Buttons - Bold and inviting
  button: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.extrabold,
    color: colors.textInverse,
    lineHeight: fontSizes.md * lineHeights.tight,
    textTransform: 'uppercase' as TextStyle['textTransform'],
    letterSpacing: letterSpacing.wide,
  },
  buttonLarge: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.extrabold,
    color: colors.textInverse,
    lineHeight: fontSizes.lg * lineHeights.tight,
    textTransform: 'uppercase' as TextStyle['textTransform'],
    letterSpacing: letterSpacing.wide,
  },
  buttonSmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.textInverse,
    lineHeight: fontSizes.sm * lineHeights.tight,
    textTransform: 'uppercase' as TextStyle['textTransform'],
    letterSpacing: letterSpacing.wider,
  },

  // Links - Clear and distinct
  link: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.secondary,
    lineHeight: fontSizes.base * lineHeights.normal,
    textDecorationLine: 'underline' as TextStyle['textDecorationLine'],
  },

  // Status text
  error: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.error,
    lineHeight: fontSizes.sm * lineHeights.normal,
  },
  success: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.success,
    lineHeight: fontSizes.sm * lineHeights.normal,
  },
  warning: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.warning,
    lineHeight: fontSizes.sm * lineHeights.normal,
  },

  // Helper text
  helper: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    color: colors.textTertiary,
    lineHeight: fontSizes.sm * lineHeights.relaxed,
  },

  // Badge text - Punchy
  badge: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.extrabold,
    lineHeight: fontSizes.xs * lineHeights.tight,
    textTransform: 'uppercase' as TextStyle['textTransform'],
    letterSpacing: letterSpacing.widest,
  },

  // Placeholder text
  placeholder: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.regular,
    color: colors.textDisabled,
    lineHeight: fontSizes.base * lineHeights.normal,
  },

  // Category labels - Distinctive
  category: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.black,
    lineHeight: fontSizes.base * lineHeights.tight,
    letterSpacing: letterSpacing.wide,
  },
} as const;

export type TextStyleName = keyof typeof textStyles;
