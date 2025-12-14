/**
 * Typography Styles
 * Consistent text styles and font definitions
 */

import { TextStyle } from 'react-native';
import { colors } from './colors';

export const fontSizes = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  huge: 32,
  massive: 40,
} as const;

export const fontWeights = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
} as const;

export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
} as const;

// Predefined text styles
export const textStyles = {
  // Headings
  h1: {
    fontSize: fontSizes.huge,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    lineHeight: fontSizes.huge * lineHeights.tight,
  },
  h2: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    lineHeight: fontSizes.xxxl * lineHeights.tight,
  },
  h3: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    lineHeight: fontSizes.xxl * lineHeights.tight,
  },
  h4: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
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

  // Body text
  bodyLarge: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    color: colors.textPrimary,
    lineHeight: fontSizes.md * lineHeights.normal,
  },
  body: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.regular,
    color: colors.textPrimary,
    lineHeight: fontSizes.base * lineHeights.normal,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    color: colors.textSecondary,
    lineHeight: fontSizes.sm * lineHeights.normal,
  },

  // Labels
  label: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    lineHeight: fontSizes.base * lineHeights.normal,
  },
  labelSmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
    lineHeight: fontSizes.sm * lineHeights.normal,
  },

  // Captions
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

  // Buttons
  button: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.textInverse,
    lineHeight: fontSizes.md * lineHeights.tight,
  },
  buttonLarge: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.textInverse,
    lineHeight: fontSizes.lg * lineHeights.tight,
  },
  buttonSmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textInverse,
    lineHeight: fontSizes.sm * lineHeights.tight,
  },

  // Links
  link: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.primary,
    lineHeight: fontSizes.base * lineHeights.normal,
    textDecorationLine: 'underline' as TextStyle['textDecorationLine'],
  },

  // Error text
  error: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    color: colors.error,
    lineHeight: fontSizes.sm * lineHeights.normal,
  },

  // Helper text
  helper: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    color: colors.textTertiary,
    lineHeight: fontSizes.sm * lineHeights.normal,
  },

  // Badge text
  badge: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.sm * lineHeights.tight,
  },

  // Placeholder text
  placeholder: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.regular,
    color: colors.textDisabled,
    lineHeight: fontSizes.base * lineHeights.normal,
  },
} as const;

export type TextStyleName = keyof typeof textStyles;
