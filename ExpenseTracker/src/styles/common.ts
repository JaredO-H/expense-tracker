/**
 * Neo-Memphis Common Styles
 * Bold, playful, and geometric component styles
 */

import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing, borderRadius, shadows } from './spacing';
import { textStyles } from './typography';

export const commonStyles = StyleSheet.create({
  // Layout
  flex1: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
  },
  flexColumn: {
    flexDirection: 'column',
  },
  flexCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexBetween: {
    justifyContent: 'space-between',
  },
  flexAround: {
    justifyContent: 'space-around',
  },
  flexEnd: {
    justifyContent: 'flex-end',
  },
  alignCenter: {
    alignItems: 'center',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },

  // Containers - Warm and inviting
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerGray: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  containerPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  screenPadding: {
    padding: spacing.lg,
  },
  screenPaddingHorizontal: {
    paddingHorizontal: spacing.lg,
  },
  screenPaddingVertical: {
    paddingVertical: spacing.lg,
  },

  // Cards - Bold borders and shadows
  card: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 3,
    borderColor: colors.border,
    ...shadows.medium,
  },
  cardFlat: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    borderWidth: 3,
    borderColor: colors.border,
  },
  cardColored: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 3,
    borderColor: colors.border,
    ...shadows.colored,
  },
  cardElevated: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 3,
    borderColor: colors.border,
    ...shadows.large,
  },

  // Buttons - Bold and geometric
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.border,
    ...shadows.medium,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.border,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
    borderColor: colors.border,
  },
  buttonAccent: {
    backgroundColor: colors.accent1,
    borderColor: colors.border,
  },
  buttonOutline: {
    backgroundColor: colors.backgroundElevated,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  buttonSuccess: {
    backgroundColor: colors.success,
    borderColor: colors.border,
  },
  buttonError: {
    backgroundColor: colors.error,
    borderColor: colors.border,
  },
  buttonDisabled: {
    backgroundColor: colors.backgroundTertiary,
    borderColor: colors.borderSubtle,
    opacity: 0.6,
  },
  buttonSmall: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
  },
  buttonLarge: {
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
  },

  // Inputs - Clear borders
  input: {
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: textStyles.body.fontSize,
    color: colors.textPrimary,
    backgroundColor: colors.backgroundElevated,
    fontWeight: '500',
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 3,
  },
  inputFocused: {
    borderColor: colors.secondary,
    borderWidth: 4,
    ...shadows.medium,
  },
  inputDisabled: {
    backgroundColor: colors.backgroundTertiary,
    color: colors.textDisabled,
    borderColor: colors.borderSubtle,
  },

  // Text styles
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },
  textLeft: {
    textAlign: 'left',
  },
  textPrimary: {
    color: colors.textPrimary,
  },
  textSecondary: {
    color: colors.textSecondary,
  },
  textTertiary: {
    color: colors.textTertiary,
  },
  textWhite: {
    color: colors.textInverse,
  },
  textError: {
    color: colors.error,
  },
  textSuccess: {
    color: colors.success,
  },
  textBrand: {
    color: colors.primary,
  },

  // Dividers - Bold and visible
  divider: {
    height: 3,
    backgroundColor: colors.border,
    marginVertical: spacing.base,
  },
  dividerLight: {
    height: 2,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  dividerThick: {
    height: 4,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  dividerVertical: {
    width: 3,
    backgroundColor: colors.border,
    marginHorizontal: spacing.base,
  },

  // Spacing utilities
  mt4: { marginTop: spacing.xs },
  mt8: { marginTop: spacing.sm },
  mt12: { marginTop: spacing.md },
  mt16: { marginTop: spacing.base },
  mt20: { marginTop: spacing.lg },
  mt24: { marginTop: spacing.xl },
  mt32: { marginTop: spacing.xxl },

  mb4: { marginBottom: spacing.xs },
  mb8: { marginBottom: spacing.sm },
  mb12: { marginBottom: spacing.md },
  mb16: { marginBottom: spacing.base },
  mb20: { marginBottom: spacing.lg },
  mb24: { marginBottom: spacing.xl },
  mb32: { marginBottom: spacing.xxl },

  ml4: { marginLeft: spacing.xs },
  ml8: { marginLeft: spacing.sm },
  ml12: { marginLeft: spacing.md },
  ml16: { marginLeft: spacing.base },
  ml20: { marginLeft: spacing.lg },

  mr4: { marginRight: spacing.xs },
  mr8: { marginRight: spacing.sm },
  mr12: { marginRight: spacing.md },
  mr16: { marginRight: spacing.base },
  mr20: { marginRight: spacing.lg },

  p4: { padding: spacing.xs },
  p8: { padding: spacing.sm },
  p12: { padding: spacing.md },
  p16: { padding: spacing.base },
  p20: { padding: spacing.lg },
  p24: { padding: spacing.xl },

  // Badges - Geometric and bold
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: colors.border,
  },
  badgeRound: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: colors.border,
  },
  badgeSuccess: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  badgeError: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
  },
  badgeWarning: {
    backgroundColor: colors.warningLight,
    borderColor: colors.warning,
  },
  badgeInfo: {
    backgroundColor: colors.infoLight,
    borderColor: colors.info,
  },
  badgePrimary: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  badgeSecondary: {
    backgroundColor: colors.secondaryLight,
    borderColor: colors.secondary,
  },

  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: textStyles.body.fontSize,
    fontWeight: textStyles.bodyBold.fontWeight,
    color: colors.textSecondary,
  },

  // Empty states
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyTitle: {
    fontSize: textStyles.h3.fontSize,
    fontWeight: textStyles.h3.fontWeight,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: textStyles.body.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: textStyles.body.lineHeight,
  },

  // Shadows
  shadowNone: shadows.none,
  shadowSmall: shadows.small,
  shadowMedium: shadows.medium,
  shadowLarge: shadows.large,
  shadowXl: shadows.xl,
  shadowColored: shadows.colored,
  shadowOffset: shadows.offset,

  // Borders - Memphis style
  borderTop: {
    borderTopWidth: 3,
    borderTopColor: colors.border,
  },
  borderBottom: {
    borderBottomWidth: 3,
    borderBottomColor: colors.border,
  },
  borderLeft: {
    borderLeftWidth: 3,
    borderLeftColor: colors.border,
  },
  borderRight: {
    borderRightWidth: 3,
    borderRightColor: colors.border,
  },
  borderAll: {
    borderWidth: 3,
    borderColor: colors.border,
  },
  borderPrimary: {
    borderWidth: 3,
    borderColor: colors.primary,
  },
  borderSecondary: {
    borderWidth: 3,
    borderColor: colors.secondary,
  },

  // Absolute positioning
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  absoluteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  absoluteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  // Geometric decorative elements
  decorativeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent1,
    borderWidth: 3,
    borderColor: colors.border,
  },
  decorativeSquare: {
    width: 40,
    height: 40,
    backgroundColor: colors.accent2,
    borderWidth: 3,
    borderColor: colors.border,
    transform: [{ rotate: '15deg' }],
  },
});
