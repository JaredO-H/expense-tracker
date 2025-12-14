/**
 * Common Component Styles
 * Reusable styles for common UI patterns
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

  // Containers
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerGray: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  screenPadding: {
    padding: spacing.base,
  },
  screenPaddingHorizontal: {
    paddingHorizontal: spacing.base,
  },
  screenPaddingVertical: {
    paddingVertical: spacing.base,
  },

  // Cards
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    ...shadows.medium,
  },
  cardFlat: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Buttons
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonSuccess: {
    backgroundColor: colors.success,
  },
  buttonError: {
    backgroundColor: colors.error,
  },
  buttonDisabled: {
    backgroundColor: colors.backgroundDisabled,
    opacity: 0.6,
  },
  buttonSmall: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.sm,
  },
  buttonLarge: {
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.lg,
  },

  // Inputs
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: textStyles.body.fontSize,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputDisabled: {
    backgroundColor: colors.backgroundDisabled,
    color: colors.textDisabled,
  },

  // Text
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

  // Dividers
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  dividerThick: {
    height: 2,
    backgroundColor: colors.border,
  },
  dividerVertical: {
    width: 1,
    backgroundColor: colors.border,
  },

  // Spacing utilities
  mt4: { marginTop: spacing.xs },
  mt8: { marginTop: spacing.sm },
  mt12: { marginTop: spacing.md },
  mt16: { marginTop: spacing.base },
  mt20: { marginTop: spacing.lg },
  mt24: { marginTop: spacing.xl },

  mb4: { marginBottom: spacing.xs },
  mb8: { marginBottom: spacing.sm },
  mb12: { marginBottom: spacing.md },
  mb16: { marginBottom: spacing.base },
  mb20: { marginBottom: spacing.lg },
  mb24: { marginBottom: spacing.xl },

  ml4: { marginLeft: spacing.xs },
  ml8: { marginLeft: spacing.sm },
  ml12: { marginLeft: spacing.md },
  ml16: { marginLeft: spacing.base },

  mr4: { marginRight: spacing.xs },
  mr8: { marginRight: spacing.sm },
  mr12: { marginRight: spacing.md },
  mr16: { marginRight: spacing.base },

  p4: { padding: spacing.xs },
  p8: { padding: spacing.sm },
  p12: { padding: spacing.md },
  p16: { padding: spacing.base },
  p20: { padding: spacing.lg },
  p24: { padding: spacing.xl },

  // Badges
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xl,
    alignSelf: 'flex-start',
  },
  badgeSuccess: {
    backgroundColor: colors.successLight,
  },
  badgeError: {
    backgroundColor: colors.errorLight,
  },
  badgeWarning: {
    backgroundColor: colors.warningLight,
  },
  badgeInfo: {
    backgroundColor: colors.infoLight,
  },
  badgeGray: {
    backgroundColor: colors.gray100,
  },

  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: textStyles.body.fontSize,
    color: colors.textTertiary,
  },

  // Empty states
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyTitle: {
    fontSize: textStyles.h4.fontSize,
    fontWeight: textStyles.h4.fontWeight,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: textStyles.body.fontSize,
    color: colors.textTertiary,
    textAlign: 'center',
  },

  // Shadows
  shadowSmall: shadows.small,
  shadowMedium: shadows.medium,
  shadowLarge: shadows.large,
  shadowXl: shadows.xl,

  // Borders
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  borderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  borderAll: {
    borderWidth: 1,
    borderColor: colors.border,
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
});
