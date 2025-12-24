/**
 * Neo-Memphis Screen Styles
 * Centralized, reusable screen-level component patterns
 * Bold, playful, and geometric - making finance exciting!
 *
 * Usage: Import specific patterns and compose them in your screens
 * Example: <View style={[screenStyles.memphisCard, screenStyles.memphisCardRotateRight]}>
 */

import { StyleSheet, TextStyle } from 'react-native';
import { colors } from './colors';
import { spacing, borderRadius, shadows } from './spacing';
import { textStyles } from './typography';

export const screenStyles = StyleSheet.create({
  // ============================================================================
  // 1. SCREEN CONTAINER PATTERNS
  // ============================================================================

  /**
   * Base screen container - use as root view for all screens
   * Provides warm cream background and full flex
   */
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },

  /**
   * Screen container that allows overflow for floating decorations
   * Use when you have absolute-positioned animated elements
   */
  screenWithDecorations: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative',
  },

  /**
   * Standard ScrollView content padding
   * Consistent spacing around scrollable content
   */
  scrollViewContent: {
    padding: spacing.lg,
    paddingBottom: spacing.massive,
  },

  /**
   * ScrollView content with extra bottom padding for FAB
   * Use when you have a floating action button at the bottom
   */
  scrollViewContentWithFab: {
    padding: spacing.lg,
    paddingBottom: 100,
  },

  // ============================================================================
  // 2. BACKGROUND DECORATION PATTERNS
  // ============================================================================

  /**
   * Large floating circle decoration - top right
   * Typically used with yellow/accent colors
   */
  bgDecorCircleLarge: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.accent1,
    opacity: 0.25,
  },

  /**
   * Large floating circle - bottom left
   * Typically teal/secondary
   */
  bgDecorCircleLargeBottom: {
    position: 'absolute',
    bottom: 100,
    left: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.secondary,
    opacity: 0.2,
  },

  /**
   * Medium floating circle - top right
   * More subtle, good for secondary screens
   */
  bgDecorCircleMedium: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accent1,
    opacity: 0.3,
  },

  /**
   * Medium floating circle - bottom left variant
   */
  bgDecorCircleMediumBottom: {
    position: 'absolute',
    bottom: 150,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accent2,
    opacity: 0.25,
  },

  /**
   * Floating rotated square decoration
   * Adds geometric interest
   */
  bgDecorSquare: {
    position: 'absolute',
    top: 200,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: colors.accent3,
    opacity: 0.25,
    transform: [{ rotate: '25deg' }],
  },

  /**
   * Floating rotated square - left side
   */
  bgDecorSquareLeft: {
    position: 'absolute',
    bottom: 200,
    left: 30,
    width: 60,
    height: 60,
    backgroundColor: colors.accent4,
    opacity: 0.2,
    transform: [{ rotate: '20deg' }],
  },

  /**
   * Small floating decoration element
   * Good for subtle background interest
   */
  bgDecorSmall: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    opacity: 0.3,
  },

  // ============================================================================
  // 3. HEADER PATTERNS
  // ============================================================================

  /**
   * Main screen header container
   * Standard spacing and positioning
   */
  screenHeader: {
    marginBottom: spacing.xxl,
    paddingTop: spacing.base,
    position: 'relative',
  },

  /**
   * Header with vertical accent bar
   * Memphis-style colored bar on the left
   */
  headerWithAccent: {
    marginBottom: spacing.xxl,
    paddingTop: spacing.base,
    paddingLeft: spacing.base,
    position: 'relative',
  },

  /**
   * Decorative vertical accent bar
   * Position absolutely to the left of header
   */
  decorativeAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 6,
    height: 60,
    backgroundColor: colors.primary,
  },

  /**
   * Decorative accent bar - secondary color variant
   */
  decorativeAccentBarSecondary: {
    backgroundColor: colors.secondary,
  },

  /**
   * Decorative accent bar - accent color variant
   */
  decorativeAccentBarAccent: {
    backgroundColor: colors.accent1,
  },

  /**
   * Bold display header title
   * For main screen titles
   */
  headerTitle: {
    ...textStyles.display2,
    marginBottom: spacing.xs,
  } as TextStyle,

  /**
   * Section header container
   * For grouping content sections
   */
  sectionHeader: {
    marginBottom: spacing.base,
  },

  /**
   * Section title text - uppercase label style
   * Consistent across all screens
   */
  sectionTitle: {
    ...textStyles.labelMedium,
    color: colors.textSecondary,
  } as TextStyle,

  // ============================================================================
  // 4. CARD PATTERNS
  // ============================================================================

  /**
   * Base Memphis card style
   * Bold border, shadow, and rounded corners
   * Use as foundation for all card components
   */
  memphisCard: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 3,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.medium,
  },

  /**
   * Flat Memphis card (no shadow)
   * Use for less prominent cards or nested cards
   */
  memphisCardFlat: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 3,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
  },

  /**
   * Card with slight clockwise rotation
   * Adds playful Memphis asymmetry to lists
   */
  memphisCardRotateRight: {
    transform: [{ rotate: '0.5deg' }],
  },

  /**
   * Card with slight counter-clockwise rotation
   * Alternate with rotateRight for visual rhythm
   */
  memphisCardRotateLeft: {
    transform: [{ rotate: '-0.5deg' }],
  },

  /**
   * Elevated card with more shadow
   * Use for important or hero cards
   */
  memphisCardElevated: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 3,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.large,
  },

  /**
   * Circular geometric decoration for card corners
   * Position in bottom-right corner
   */
  cardDecorCircle: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 50,
    height: 50,
    borderRadius: 25,
    opacity: 0.3,
  },

  /**
   * Square geometric decoration for card corners
   * Rotated for Memphis style
   */
  cardDecorSquare: {
    position: 'absolute',
    bottom: -15,
    right: -15,
    width: 60,
    height: 60,
    opacity: 0.25,
    transform: [{ rotate: '45deg' }],
  },

  /**
   * Card header - horizontal layout
   * For title and actions at top of card
   */
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },

  /**
   * Card footer - horizontal layout
   * For metadata and secondary info at bottom of card
   */
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  /**
   * Card content area
   * Standard padding between header and footer
   */
  cardContent: {
    marginBottom: spacing.sm,
  },

  // ============================================================================
  // 5. ACTION BUTTON PATTERNS
  // ============================================================================

  /**
   * Large hero action button
   * Bold Memphis style with geometric elements
   * Use for primary CTAs
   */
  actionButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.base,
    borderWidth: 3,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.medium,
  },

  /**
   * Primary action button - coral red
   */
  primaryActionButton: {
    backgroundColor: colors.primary,
  },

  /**
   * Secondary action button - teal
   */
  secondaryActionButton: {
    backgroundColor: colors.secondary,
  },

  /**
   * Accent action button - yellow
   */
  accentActionButton: {
    backgroundColor: colors.accent1,
  },

  /**
   * Icon container within action button
   * Geometric shape with border
   */
  actionButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.whiteOverlay30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: colors.whiteOverlay60,
  },

  /**
   * Icon container variant - for secondary buttons
   */
  actionButtonIconSecondary: {
    backgroundColor: colors.accent1,
    borderColor: colors.border,
  },

  /**
   * Text content area in action button
   * Takes remaining space between icon and arrow
   */
  actionButtonContent: {
    flex: 1,
  },

  /**
   * Action button title text
   */
  actionButtonTitle: {
    ...textStyles.h6,
    color: colors.textInverse,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  } as TextStyle,

  /**
   * Action button subtitle text
   */
  actionButtonSubtitle: {
    ...textStyles.bodySmall,
    color: colors.whiteOverlay80,
    fontWeight: '500',
  } as TextStyle,

  /**
   * Geometric decoration for action buttons
   * Circle in bottom-right corner
   */
  buttonGeometricDecor: {
    position: 'absolute',
    bottom: -15,
    right: -15,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.whiteOverlay20,
  },

  /**
   * Geometric decoration variant - for secondary buttons
   */
  buttonGeometricDecorSecondary: {
    backgroundColor: colors.accent3,
    opacity: 0.4,
  },

  // ============================================================================
  // 6. FAB (FLOATING ACTION BUTTON) PATTERNS
  // ============================================================================

  /**
   * FAB container - positioning and size
   * Bold coral circle with shadow
   */
  fabContainer: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    zIndex: 1000,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.xl,
  },

  /**
   * FAB button inner wrapper
   * For TouchableOpacity
   */
  fabButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /**
   * FAB icon text style
   * Large + symbol
   */
  fabIconText: {
    fontSize: spacing.xxl + spacing.sm,
    color: colors.textInverse,
    fontWeight: '400',
  } as TextStyle,

  /**
   * FAB menu overlay (dimming)
   * Covers screen when menu is open
   */
  fabOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 998,
  },

  /**
   * FAB menu options container
   * Positioned above FAB
   */
  fabMenuContainer: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg + 80,
    alignItems: 'flex-end',
    zIndex: 999,
    gap: spacing.md,
  },

  /**
   * Individual FAB menu option
   * Label + button horizontal layout
   */
  fabMenuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  /**
   * FAB menu text label
   * Bold bordered label
   */
  fabMenuLabel: {
    ...textStyles.bodyBold,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.medium,
  } as TextStyle,

  /**
   * FAB menu button (circular)
   * Smaller than main FAB
   */
  fabMenuButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.border,
    ...shadows.large,
  },

  // ============================================================================
  // 7. SEARCH BAR PATTERNS
  // ============================================================================

  /**
   * Memphis-style search bar
   * Bold border and geometric styling
   */
  memphisSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: colors.border,
    ...shadows.small,
  },

  /**
   * Search icon container
   * Space for leading icon
   */
  searchIconContainer: {
    marginRight: spacing.sm,
  },

  /**
   * Search input field
   * Fills remaining space
   */
  searchInputField: {
    flex: 1,
    ...textStyles.body,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
  } as TextStyle,

  // ============================================================================
  // 8. STATS DISPLAY PATTERNS
  // ============================================================================

  /**
   * Horizontal row of stat boxes
   * Typically 2-4 stats side by side
   */
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  /**
   * Individual stat box
   * Bold bordered container
   */
  statBox: {
    flex: 1,
    backgroundColor: colors.backgroundElevated,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 3,
    borderColor: colors.border,
    alignItems: 'center',
  },

  /**
   * Stat value - large bold number
   * Primary color for emphasis
   */
  statValue: {
    ...textStyles.h3,
    color: colors.primary,
    marginBottom: spacing.xs,
  } as TextStyle,

  /**
   * Stat label - uppercase descriptor
   * Small secondary text
   */
  statLabel: {
    ...textStyles.labelSmall,
    fontSize: 10,
    color: colors.textSecondary,
  } as TextStyle,

  // ============================================================================
  // 9. INFO BANNER PATTERNS
  // ============================================================================

  /**
   * Info/warning banner
   * Yellow background with geometric decor
   */
  infoBanner: {
    backgroundColor: colors.accent1Light,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    borderColor: colors.warning,
    position: 'relative',
    overflow: 'hidden',
  },

  /**
   * Info banner with primary color
   */
  infoBannerPrimary: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },

  /**
   * Info banner with secondary color
   */
  infoBannerSecondary: {
    backgroundColor: colors.secondaryLight,
    borderColor: colors.secondary,
  },

  /**
   * Info banner content row
   * Icon + text layout
   */
  infoBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  /**
   * Info banner icon container
   * Circular container with border
   */
  infoBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: colors.warning,
  },

  /**
   * Info banner text
   */
  infoBannerText: {
    ...textStyles.body,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  } as TextStyle,

  /**
   * Geometric decoration for info banner
   * Rotated square in corner
   */
  infoBannerDecor: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    backgroundColor: colors.accent1,
    opacity: 0.3,
    transform: [{ rotate: '45deg' }],
  },

  // ============================================================================
  // 10. EMPTY STATE PATTERNS
  // ============================================================================

  /**
   * Empty state container
   * Centered with padding
   */
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.massive,
    paddingHorizontal: spacing.xl,
    position: 'relative',
  },

  /**
   * Empty state icon circle
   * Large bold circle with border
   */
  emptyStateIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 3,
    borderColor: colors.border,
  },

  /**
   * Empty state decorative circle
   */
  emptyStateDecorCircle: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent2,
    opacity: 0.2,
  },

  /**
   * Empty state decorative square
   */
  emptyStateDecorSquare: {
    position: 'absolute',
    bottom: 100,
    left: 30,
    width: 60,
    height: 60,
    backgroundColor: colors.accent4,
    opacity: 0.2,
    transform: [{ rotate: '20deg' }],
  },

  /**
   * Empty state title
   */
  emptyStateTitle: {
    ...textStyles.h2,
    marginBottom: spacing.sm,
    textAlign: 'center',
  } as TextStyle,

  /**
   * Empty state body text
   */
  emptyStateText: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  } as TextStyle,

  /**
   * Empty state CTA button
   */
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
    borderRadius: borderRadius.md,
    borderWidth: 3,
    borderColor: colors.border,
    ...shadows.medium,
  },

  /**
   * Empty state button text
   */
  emptyStateButtonText: {
    ...textStyles.button,
    fontSize: 15,
  } as TextStyle,

  // ============================================================================
  // 11. LIST PATTERNS
  // ============================================================================

  /**
   * List container wrapper
   * For FlatList contentContainerStyle
   */
  listContainer: {
    padding: spacing.lg,
  },

  /**
   * List content with FAB padding
   * Extra bottom space for floating action button
   */
  listContentPadding: {
    padding: spacing.lg,
    paddingBottom: 100,
  },

  /**
   * Standard list item card
   * Memphis card for list items
   */
  listItemCard: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 3,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.medium,
  },

  // ============================================================================
  // 12. STATUS INDICATOR PATTERNS
  // ============================================================================

  /**
   * Status indicator container
   * Positioned in top-right corner of cards
   */
  statusIndicator: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },

  /**
   * Base status dot
   * Small circle with border
   */
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.border,
  },

  /**
   * Pending status dot - yellow
   */
  statusDotPending: {
    backgroundColor: colors.warning,
  },

  /**
   * Verified status dot - green
   */
  statusDotVerified: {
    backgroundColor: colors.success,
  },

  /**
   * Flagged status dot - red
   */
  statusDotFlagged: {
    backgroundColor: colors.error,
  },

  // ============================================================================
  // 13. PROCESSING QUEUE BUTTON
  // ============================================================================

  /**
   * Processing queue button
   * Special button for queue navigation
   */
  queueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    borderWidth: 3,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.medium,
  },

  /**
   * Queue button icon badge
   * Circular icon container
   */
  queueIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.whiteOverlay30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },

  /**
   * Queue button text
   */
  queueButtonText: {
    ...textStyles.labelMedium,
    fontSize: 12,
    color: colors.textInverse,
    flex: 1,
  } as TextStyle,

  // ============================================================================
  // BONUS: HEADER SECTION PATTERNS
  // ============================================================================

  /**
   * Header section container
   * For grouped header content (search, stats, etc.)
   */
  headerSection: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.base,
    paddingBottom: spacing.md,
    borderBottomWidth: 3,
    borderBottomColor: colors.border,
  },

  /**
   * Category badge
   * For displaying category labels
   */
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
  },

  /**
   * Category badge text
   */
  categoryBadgeText: {
    ...textStyles.badge,
    fontSize: 9,
    color: colors.textOnSecondary,
  } as TextStyle,

  // ============================================================================
  // UTILITY: SPACING & POSITIONING
  // ============================================================================

  /**
   * Section spacing
   * Standard margin between sections
   */
  section: {
    marginBottom: spacing.xl,
  },

  /**
   * Loading container
   * Centered spinner state
   */
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  /**
   * Loading text
   */
  loadingText: {
    ...textStyles.bodyBold,
    color: colors.textSecondary,
    marginTop: spacing.md,
  } as TextStyle,
});

// Export individual style groups for easier imports
export const containerStyles = {
  screenContainer: screenStyles.screenContainer,
  screenWithDecorations: screenStyles.screenWithDecorations,
  scrollViewContent: screenStyles.scrollViewContent,
  scrollViewContentWithFab: screenStyles.scrollViewContentWithFab,
};

export const decorationStyles = {
  bgDecorCircleLarge: screenStyles.bgDecorCircleLarge,
  bgDecorCircleLargeBottom: screenStyles.bgDecorCircleLargeBottom,
  bgDecorCircleMedium: screenStyles.bgDecorCircleMedium,
  bgDecorCircleMediumBottom: screenStyles.bgDecorCircleMediumBottom,
  bgDecorSquare: screenStyles.bgDecorSquare,
  bgDecorSquareLeft: screenStyles.bgDecorSquareLeft,
  bgDecorSmall: screenStyles.bgDecorSmall,
};

export const headerStyles = {
  screenHeader: screenStyles.screenHeader,
  headerWithAccent: screenStyles.headerWithAccent,
  decorativeAccentBar: screenStyles.decorativeAccentBar,
  decorativeAccentBarSecondary: screenStyles.decorativeAccentBarSecondary,
  decorativeAccentBarAccent: screenStyles.decorativeAccentBarAccent,
  headerTitle: screenStyles.headerTitle,
  sectionHeader: screenStyles.sectionHeader,
  sectionTitle: screenStyles.sectionTitle,
  headerSection: screenStyles.headerSection,
};

export const cardStyles = {
  memphisCard: screenStyles.memphisCard,
  memphisCardFlat: screenStyles.memphisCardFlat,
  memphisCardRotateRight: screenStyles.memphisCardRotateRight,
  memphisCardRotateLeft: screenStyles.memphisCardRotateLeft,
  memphisCardElevated: screenStyles.memphisCardElevated,
  cardDecorCircle: screenStyles.cardDecorCircle,
  cardDecorSquare: screenStyles.cardDecorSquare,
  cardHeader: screenStyles.cardHeader,
  cardFooter: screenStyles.cardFooter,
  cardContent: screenStyles.cardContent,
};

export const buttonStyles = {
  actionButtonLarge: screenStyles.actionButtonLarge,
  primaryActionButton: screenStyles.primaryActionButton,
  secondaryActionButton: screenStyles.secondaryActionButton,
  accentActionButton: screenStyles.accentActionButton,
  actionButtonIcon: screenStyles.actionButtonIcon,
  actionButtonIconSecondary: screenStyles.actionButtonIconSecondary,
  actionButtonContent: screenStyles.actionButtonContent,
  actionButtonTitle: screenStyles.actionButtonTitle,
  actionButtonSubtitle: screenStyles.actionButtonSubtitle,
  buttonGeometricDecor: screenStyles.buttonGeometricDecor,
  buttonGeometricDecorSecondary: screenStyles.buttonGeometricDecorSecondary,
};

export const fabStyles = {
  fabContainer: screenStyles.fabContainer,
  fabButton: screenStyles.fabButton,
  fabIconText: screenStyles.fabIconText,
  fabOverlay: screenStyles.fabOverlay,
  fabMenuContainer: screenStyles.fabMenuContainer,
  fabMenuOption: screenStyles.fabMenuOption,
  fabMenuLabel: screenStyles.fabMenuLabel,
  fabMenuButton: screenStyles.fabMenuButton,
};

export const searchStyles = {
  memphisSearchBar: screenStyles.memphisSearchBar,
  searchIconContainer: screenStyles.searchIconContainer,
  searchInputField: screenStyles.searchInputField,
};

export const statsStyles = {
  statsRow: screenStyles.statsRow,
  statBox: screenStyles.statBox,
  statValue: screenStyles.statValue,
  statLabel: screenStyles.statLabel,
};

export const bannerStyles = {
  infoBanner: screenStyles.infoBanner,
  infoBannerPrimary: screenStyles.infoBannerPrimary,
  infoBannerSecondary: screenStyles.infoBannerSecondary,
  infoBannerContent: screenStyles.infoBannerContent,
  infoBannerIcon: screenStyles.infoBannerIcon,
  infoBannerText: screenStyles.infoBannerText,
  infoBannerDecor: screenStyles.infoBannerDecor,
};

export const emptyStateStyles = {
  emptyStateContainer: screenStyles.emptyStateContainer,
  emptyStateIcon: screenStyles.emptyStateIcon,
  emptyStateDecorCircle: screenStyles.emptyStateDecorCircle,
  emptyStateDecorSquare: screenStyles.emptyStateDecorSquare,
  emptyStateTitle: screenStyles.emptyStateTitle,
  emptyStateText: screenStyles.emptyStateText,
  emptyStateButton: screenStyles.emptyStateButton,
  emptyStateButtonText: screenStyles.emptyStateButtonText,
};

export const listStyles = {
  listContainer: screenStyles.listContainer,
  listContentPadding: screenStyles.listContentPadding,
  listItemCard: screenStyles.listItemCard,
};

export const statusStyles = {
  statusIndicator: screenStyles.statusIndicator,
  statusDot: screenStyles.statusDot,
  statusDotPending: screenStyles.statusDotPending,
  statusDotVerified: screenStyles.statusDotVerified,
  statusDotFlagged: screenStyles.statusDotFlagged,
};

export const queueStyles = {
  queueButton: screenStyles.queueButton,
  queueIconBadge: screenStyles.queueIconBadge,
  queueButtonText: screenStyles.queueButtonText,
};

/**
 * USAGE EXAMPLES:
 *
 * 1. Basic Screen Setup:
 * ```typescript
 * import { screenStyles } from '../styles/screenStyles';
 *
 * <View style={screenStyles.screenContainer}>
 *   <ScrollView contentContainerStyle={screenStyles.scrollViewContent}>
 *     // Your content
 *   </ScrollView>
 * </View>
 * ```
 *
 * 2. Screen with Floating Decorations:
 * ```typescript
 * <View style={screenStyles.screenWithDecorations}>
 *   <Animated.View style={[screenStyles.bgDecorCircleLarge, { transform: [{ translateY: floatAnim }] }]} />
 *   // Your content
 * </View>
 * ```
 *
 * 3. Memphis Card with Rotation:
 * ```typescript
 * <View style={[
 *   screenStyles.memphisCard,
 *   index % 2 === 0 ? screenStyles.memphisCardRotateRight : screenStyles.memphisCardRotateLeft
 * ]}>
 *   <View style={[screenStyles.cardDecorCircle, { backgroundColor: categoryColor }]} />
 *   // Card content
 * </View>
 * ```
 *
 * 4. Action Button:
 * ```typescript
 * <TouchableOpacity style={[screenStyles.actionButtonLarge, screenStyles.primaryActionButton]}>
 *   <View style={screenStyles.actionButtonIcon}>
 *     <Icon name="camera" size={28} color={colors.textInverse} />
 *   </View>
 *   <View style={screenStyles.actionButtonContent}>
 *     <Text style={screenStyles.actionButtonTitle}>CAPTURE</Text>
 *     <Text style={screenStyles.actionButtonSubtitle}>Take a photo</Text>
 *   </View>
 *   <View style={screenStyles.buttonGeometricDecor} />
 * </TouchableOpacity>
 * ```
 *
 * 5. Empty State:
 * ```typescript
 * <View style={screenStyles.emptyStateContainer}>
 *   <View style={screenStyles.emptyStateDecorCircle} />
 *   <View style={screenStyles.emptyStateIcon}>
 *     <Icon name="receipt-outline" size={64} color={colors.primary} />
 *   </View>
 *   <Text style={screenStyles.emptyStateTitle}>No Items Yet</Text>
 *   <Text style={screenStyles.emptyStateText}>Get started by adding your first item</Text>
 * </View>
 * ```
 */
