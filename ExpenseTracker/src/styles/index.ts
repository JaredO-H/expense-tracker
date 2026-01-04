/**
 * Centralized Styles
 * Export all styling constants and utilities
 */

export { colors } from './colors';
export type { ColorName } from './colors';

export {
  spacing,
  borderRadius,
  iconSizes,
  buttonHeights,
  inputHeights,
  containerPadding,
  tabBarHeight,
  headerHeight,
  shadows,
} from './spacing';

export { fontSizes, fontWeights, lineHeights, letterSpacing, textStyles } from './typography';
export type { TextStyleName } from './typography';

export { commonStyles } from './common';

export {
  geometricShapes,
  categoryPatterns,
  getPatternByIndex,
  getPatternByName,
  cornerDecorations,
  decorativeLines,
} from './geometrics';

export {
  screenStyles,
  containerStyles,
  decorationStyles,
  headerStyles,
  cardStyles,
  buttonStyles,
  fabStyles,
  searchStyles,
  statsStyles,
  bannerStyles,
  emptyStateStyles,
  listStyles,
  statusStyles,
  queueStyles,
} from './screenStyles';

// Re-export everything as a theme object for convenience
import { colors } from './colors';
import { spacing, borderRadius, shadows } from './spacing';
import { textStyles, fontSizes, fontWeights } from './typography';

export const theme = {
  colors,
  spacing,
  borderRadius,
  shadows,
  textStyles,
  fontSizes,
  fontWeights,
} as const;

export type Theme = typeof theme;
