import { StyleSheet, Platform, Dimensions, TextStyle } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// DESIGN TOKENS
// ============================================================================

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

export const spacing = {
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
} as const;

export const borderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
  round: 999,
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

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

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
  semiBold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
} as const;

export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
} as const;

// ============================================================================
// TEXT STYLES
// ============================================================================

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

// ============================================================================
// COMMON STYLES
// ============================================================================

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

// ============================================================================
// COMPONENT STYLES
// ============================================================================

// Export Screen Styles
export const exportScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tripInfo: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tripName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tripDetail: {
    fontSize: 14,
    color: '#666',
  },
  formatOptions: {
    gap: 12,
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  formatOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  formatIcon: {
    marginRight: 12,
  },
  formatText: {
    flex: 1,
  },
  formatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  formatTitleSelected: {
    color: '#007AFF',
  },
  formatDescription: {
    fontSize: 13,
    color: '#666',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  note: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  previewCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 14,
    color: '#666',
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  exportButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  exportButtonDisabled: {
    backgroundColor: '#999',
  },
  exportButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

// Camera Screen Styles
export const cameraScreenStyles = StyleSheet.create({
  container: {
    ...commonStyles.flex1,
    backgroundColor: colors.shadow,
  },
  camera: {
    flex: 1,
  },
  loadingContainer: {
    ...commonStyles.flex1,
    backgroundColor: colors.shadow,
    ...commonStyles.flexCenter,
    padding: spacing.lg,
  },
  loadingText: {
    ...textStyles.body,
    color: colors.textInverse,
    marginTop: spacing.base,
  },
  permissionText: {
    ...textStyles.h4,
    color: colors.textInverse,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  permissionSubtext: {
    ...textStyles.body,
    color: colors.gray400,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  permissionButtonText: {
    ...textStyles.button,
    color: colors.textInverse,
  },
  cancelButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  cancelButtonText: {
    ...textStyles.body,
    color: colors.primary,
  },
  overlay: {
    ...commonStyles.absoluteFill,
    ...commonStyles.flexCenter,
    pointerEvents: 'none',
  },
  framingGuide: {
    width: '80%',
    aspectRatio: 3 / 4,
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.primary,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.primary,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.primary,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.primary,
  },
  controls: {
    ...commonStyles.absoluteFill,
    justifyContent: 'space-between',
  },
  topControls: {
    ...commonStyles.flexRow,
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingTop: 60,
  },
  galleryButton: {
    ...commonStyles.flexRow,
    ...commonStyles.alignCenter,
    backgroundColor: colors.blackOverlay50,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
  },
  flashButton: {
    ...commonStyles.flexRow,
    ...commonStyles.alignCenter,
    backgroundColor: colors.blackOverlay50,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
  },
  buttonIcon: {
    marginRight: spacing.xs,
  },
  galleryButtonText: {
    ...textStyles.body,
    color: colors.textInverse,
    fontWeight: '600',
  },
  flashButtonText: {
    ...textStyles.body,
    color: colors.textInverse,
    fontWeight: '600',
  },
  bottomControls: {
    ...commonStyles.flexRow,
    ...commonStyles.flexBetween,
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  closeButton: {
    backgroundColor: colors.blackOverlay50,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
    minWidth: 80,
  },
  closeButtonText: {
    ...textStyles.body,
    color: colors.textInverse,
    fontWeight: '600',
    textAlign: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.whiteOverlay30,
    ...commonStyles.flexCenter,
    borderWidth: 4,
    borderColor: colors.background,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background,
  },
  placeholder: {
    width: 80,
  },
  guidanceContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  guidanceText: {
    ...textStyles.body,
    color: colors.textInverse,
    backgroundColor: colors.blackOverlay50,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
  },
});

// Photo Preview Screen Styles
export const photoPreviewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '300',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    backgroundColor: '#000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  metadataContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  metadataText: {
    color: '#fff',
    fontSize: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  retakeButton: {
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#3b82f6',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

// Trip Card Styles
export const tripCardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginVertical: spacing.sm,
    ...shadows.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  label: {
    ...textStyles.labelSmall,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  tripName: {
    ...textStyles.h4,
    color: colors.textPrimary,
  },
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  badgeActive: {
    backgroundColor: colors.successLight,
  },
  badgeUpcoming: {
    backgroundColor: colors.infoLight,
  },
  badgePast: {
    backgroundColor: colors.backgroundTertiary,
  },
  badgeText: {
    ...textStyles.badge,
    color: colors.success,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    marginRight: spacing.xs + 2,
  },
  destination: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    ...textStyles.labelSmall,
    marginBottom: spacing.xs,
  },
  dateValue: {
    ...textStyles.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dateSeparator: {
    marginHorizontal: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  daysInfo: {
    ...textStyles.bodySmall,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    ...textStyles.h6,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...textStyles.body,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});

// Form Styles
export const formStyles = StyleSheet.create({
  container: {
    ...commonStyles.flex1,
    backgroundColor: colors.background,
  },
  formContent: {
    padding: spacing.base,
  },
  fieldContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    ...textStyles.label,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  input: {
    ...commonStyles.input,
  },
  inputError: {
    ...commonStyles.inputError,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
  },
  picker: {
    fontSize: textStyles.body.fontSize,
  },
  textArea: {
    minHeight: 80,
    paddingTop: spacing.md,
  },
  hint: {
    ...textStyles.helper,
    marginTop: spacing.xs,
  },
  errorText: {
    ...textStyles.error,
    marginTop: spacing.xs,
  },
  buttonContainer: {
    ...commonStyles.flexRow,
    ...commonStyles.flexBetween,
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  button: {
    ...commonStyles.button,
    flex: 1,
  },
  cancelButton: {
    ...commonStyles.buttonSecondary,
  },
  cancelButtonText: {
    ...textStyles.button,
    color: colors.textSecondary,
  },
  submitButton: {
    ...commonStyles.buttonPrimary,
  },
  submitButtonText: {
    ...textStyles.button,
  },
});

// Dialog Styles
export const dialogStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dialog: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    width: '100%',
    maxWidth: 400,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...textStyles.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIconContainer: {
    marginRight: spacing.md,
    width: 32,
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  optionDesc: {
    ...textStyles.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  cancelButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  cancelText: {
    ...textStyles.button,
    color: colors.textPrimary,
  },
});

// Image Display Styles
export const imageDisplayStyles = StyleSheet.create({
  container: {
    ...commonStyles.flex1,
    backgroundColor: colors.shadow,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    ...commonStyles.flexCenter,
    backgroundColor: colors.shadow,
  },
  loadingText: {
    ...textStyles.body,
    color: colors.textInverse,
    marginTop: spacing.md,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  errorContainer: {
    ...commonStyles.flex1,
    ...commonStyles.flexCenter,
    backgroundColor: colors.shadow,
    padding: spacing.xl,
  },
  errorIcon: {
    marginBottom: spacing.md,
  },
  errorText: {
    ...textStyles.h5,
    color: colors.textInverse,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  errorSubtext: {
    ...textStyles.body,
    color: colors.gray400,
    textAlign: 'center',
  },
});

// Bottom Drawer Styles
export const bottomDrawerStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.shadow,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: 'rgba(255, 255, 255, 0.70)',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    ...shadows.xl,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray300,
    borderRadius: borderRadius.round,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
});

// Expense Edit Form Styles
export const expenseEditFormStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  processingMethodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.lg,
    alignSelf: 'flex-start',
  },
  processingIcon: {
    marginRight: spacing.sm,
  },
  processingText: {
    ...textStyles.caption,
    fontWeight: '600',
  },
  fieldContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    ...textStyles.labelSmall,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.error,
  },
  input: {
    ...commonStyles.input,
    backgroundColor: colors.backgroundTertiary,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  textArea: {
    height: 80,
    paddingTop: spacing.md,
  },
  errorText: {
    ...textStyles.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  pickerContainer: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  picker: {
    ...textStyles.body,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.backgroundTertiary,
  },
  cancelButtonText: {
    ...textStyles.button,
    color: colors.textPrimary,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    ...textStyles.button,
    color: colors.textInverse,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

// Expense Detail Styles
export const expenseDetailStyles = StyleSheet.create({
  container: {
    ...commonStyles.containerGray,
  },
  loadingContainer: {
    ...commonStyles.loadingContainer,
  },
  content: {
    padding: spacing.base,
  },
  card: {
    ...commonStyles.card,
    marginBottom: spacing.base,
  },
  sectionTitle: {
    ...textStyles.h5,
    marginBottom: spacing.base,
  },
  infoRow: {
    marginBottom: spacing.md,
  },
  infoLabel: {
    ...textStyles.labelSmall,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    ...textStyles.bodyLarge,
  },
  summaryRow: {
    ...commonStyles.flexRow,
    ...commonStyles.flexBetween,
    ...commonStyles.alignCenter,
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...textStyles.bodyLarge,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...textStyles.bodyLarge,
    fontWeight: textStyles.label.fontWeight,
  },
  summaryNote: {
    ...textStyles.caption,
    color: colors.textDisabled,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  actionButtons: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionButton: {
    ...commonStyles.button,
  },
  editButton: {
    ...commonStyles.buttonPrimary,
  },
  editButtonText: {
    ...textStyles.button,
  },
  deleteButton: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.errorDark,
  },
  deleteButtonText: {
    ...textStyles.button,
    color: colors.errorDark,
  },
});

// Expense List Styles
export const expenseListStyles = StyleSheet.create({
  container: {
    ...commonStyles.containerGray,
  },
  topButtonContainer: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  queueButton: {
    ...commonStyles.flexRow,
    ...commonStyles.alignCenter,
    ...commonStyles.flexCenter,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  queueButtonIcon: {
    marginRight: spacing.xs,
  },
  queueButtonText: {
    ...textStyles.body,
    color: colors.textInverse,
    fontWeight: fontWeights.semibold,
  },
  searchContainer: {
    backgroundColor: colors.background,
    padding: spacing.base,
    paddingTop: spacing.sm,
    ...commonStyles.borderBottom,
  },
  searchInput: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...textStyles.body,
  },
  listContent: {
    padding: spacing.base,
    paddingBottom: 80,
  },
  expenseCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
    ...shadows.sm,
  },
  expenseCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  merchantName: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: fontWeights.medium,
    flex: 1,
    marginRight: spacing.md,
  },
  amountText: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: fontWeights.semibold,
  },
  dateText: {
    ...textStyles.caption,
    fontSize: 11,
    color: colors.textTertiary,
  },
  emptyState: {
    ...commonStyles.emptyContainer,
  },
  emptyStateTitle: {
    ...commonStyles.emptyTitle,
  },
  emptyStateText: {
    ...commonStyles.emptySubtitle,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xxxl,
  },
  emptyStateButton: {
    ...commonStyles.buttonPrimary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  emptyStateButtonText: {
    ...textStyles.button,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    ...commonStyles.flexCenter,
    ...shadows.xl,
    zIndex: 1000,
  },
  fabOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 998,
  },
  fabMenuContainer: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg + 70,
    alignItems: 'flex-end',
    zIndex: 999,
  },
  fabMenuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  fabMenuLabel: {
    ...textStyles.body,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    fontWeight: fontWeights.semibold,
    ...shadows.md,
  },
  fabMenuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    ...commonStyles.flexCenter,
    ...shadows.lg,
  },
});

// Integration Guide Styles
export const integrationGuideStyles = StyleSheet.create({
  container: {
    ...commonStyles.containerGray,
  },
  content: {
    padding: spacing.base,
  },
  header: {
    marginBottom: spacing.xl,
  },
  headerTitle: {
    ...textStyles.h3,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...textStyles.body,
    color: colors.textTertiary,
  },
  serviceSection: {
    marginBottom: spacing.xxl,
  },
  serviceName: {
    ...textStyles.h4,
    marginBottom: spacing.md,
    color: colors.primary,
  },
  guideCard: {
    ...commonStyles.card,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...textStyles.h6,
    marginBottom: spacing.md,
  },
  stepsList: {
    marginBottom: spacing.md,
  },
  step: {
    ...textStyles.body,
    marginBottom: spacing.sm,
    paddingLeft: spacing.sm,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  linkButtonText: {
    ...textStyles.link,
    color: colors.primary,
    textDecorationLine: 'none',
  },
  linkIcon: {
    marginLeft: spacing.xs,
  },
  infoText: {
    ...textStyles.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  boldText: {
    fontWeight: textStyles.label.fontWeight,
    color: colors.textPrimary,
  },
  troubleshootingSection: {
    ...commonStyles.card,
    backgroundColor: colors.warningLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  troubleshootingTitle: {
    ...textStyles.h5,
    marginBottom: spacing.lg,
    color: colors.warningDark,
  },
  troubleshootingItem: {
    marginBottom: spacing.lg,
  },
  troubleshootingQuestion: {
    ...textStyles.label,
    marginBottom: spacing.sm,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  answerIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  troubleshootingAnswer: {
    ...textStyles.body,
    color: colors.textSecondary,
    flex: 1,
  },
});

// Integration Settings Styles
export const integrationSettingsStyles = StyleSheet.create({
  container: {
    ...commonStyles.containerGray,
  },
  loadingContainer: {
    ...commonStyles.loadingContainer,
  },
  loadingText: {
    ...commonStyles.loadingText,
  },
  content: {
    padding: spacing.base,
  },
  header: {
    marginBottom: spacing.xl,
  },
  headerTitle: {
    ...textStyles.h3,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...textStyles.body,
    color: colors.textTertiary,
  },
  serviceCard: {
    ...commonStyles.card,
    marginBottom: spacing.base,
    padding: 0,
    overflow: 'hidden',
  },
  serviceHeader: {
    ...commonStyles.flexRow,
    ...commonStyles.alignCenter,
    padding: spacing.base,
    borderBottomWidth: 0,
  },
  serviceHeaderSelected: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  serviceHeaderLeft: {
    ...commonStyles.flexRow,
    ...commonStyles.alignCenter,
    flex: 1,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    ...commonStyles.flexCenter,
    marginRight: spacing.md,
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    ...textStyles.h6,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    ...commonStyles.flexRow,
    ...commonStyles.alignCenter,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusText: {
    ...textStyles.caption,
    fontWeight: textStyles.labelSmall.fontWeight,
  },
  serviceDetails: {
    padding: spacing.base,
    paddingTop: spacing.md,
  },
  serviceDescription: {
    ...textStyles.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  apiKeyLabel: {
    ...textStyles.label,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  apiKeyContainer: {
    ...commonStyles.flexRow,
    ...commonStyles.alignCenter,
  },
  apiKeyInput: {
    ...commonStyles.input,
    flex: 1,
    marginRight: spacing.sm,
  },
  showButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  showButtonText: {
    ...textStyles.button,
    color: colors.primary,
    fontSize: textStyles.bodySmall.fontSize,
  },
  setupInstructions: {
    ...textStyles.helper,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  actionButtons: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    ...commonStyles.button,
  },
  saveButton: {
    ...commonStyles.buttonPrimary,
  },
  saveButtonText: {
    ...textStyles.button,
  },
  testButton: {
    backgroundColor: colors.info,
  },
  testButtonText: {
    ...textStyles.button,
  },
  deleteButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteButtonText: {
    ...textStyles.button,
    color: colors.error,
  },
  helpSection: {
    ...commonStyles.card,
    marginTop: spacing.lg,
    backgroundColor: colors.infoBg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  helpTitle: {
    ...textStyles.h6,
    color: colors.info,
    marginBottom: spacing.sm,
  },
  helpText: {
    ...textStyles.body,
    color: colors.info,
  },
});

// Settings Screen Styles
export const settingsScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.base,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...textStyles.h5,
    marginBottom: spacing.md,
    color: colors.textPrimary,
  },
  settingCard: {
    ...commonStyles.card,
    marginBottom: spacing.md,
    padding: spacing.base,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    ...textStyles.bodyLarge,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    ...textStyles.bodySmall,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginTop: spacing.sm,
    backgroundColor: colors.background,
  },
  picker: {
    height: 50,
  },
  buttonContainer: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  saveButton: {
    ...commonStyles.button,
    ...commonStyles.buttonPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  saveButtonText: {
    ...textStyles.button,
  },
  resetButton: {
    ...commonStyles.button,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  resetButtonText: {
    ...textStyles.button,
    color: colors.primary,
  },
  infoCard: {
    flexDirection: 'row',
    ...commonStyles.card,
    backgroundColor: colors.backgroundTertiary,
    padding: spacing.base,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  infoText: {
    ...textStyles.bodySmall,
    color: colors.textTertiary,
    flex: 1,
  },
});

// Add Expense Method Styles
export const addExpenseMethodStyles = StyleSheet.create({
  container: {
    ...commonStyles.containerGray,
  },
  content: {
    padding: spacing.base,
  },
  header: {
    marginBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
  headerSubtitle: {
    ...textStyles.bodyLarge,
    color: colors.textTertiary,
  },
  optionCard: {
    ...commonStyles.card,
    ...commonStyles.flexRow,
    ...commonStyles.alignCenter,
    marginBottom: spacing.md,
    padding: spacing.base,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundTertiary,
    ...commonStyles.flexCenter,
    marginRight: spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    ...textStyles.h6,
    marginBottom: spacing.xs,
  },
  optionDescription: {
    ...textStyles.bodySmall,
    color: colors.textTertiary,
  },
  infoSection: {
    ...commonStyles.card,
    marginTop: spacing.xxl,
    backgroundColor: colors.backgroundTertiary,
  },
  infoTitle: {
    ...textStyles.h6,
    marginBottom: spacing.md,
  },
  infoText: {
    ...textStyles.bodySmall,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
});

// Trip Detail Styles
export const tripDetailStyles = StyleSheet.create({
  container: {
    ...commonStyles.containerGray,
  },
  loadingContainer: {
    ...commonStyles.loadingContainer,
  },
  content: {
    padding: spacing.base,
  },
  card: {
    ...commonStyles.card,
    marginBottom: spacing.base,
  },
  sectionTitle: {
    ...textStyles.h5,
    marginBottom: spacing.base,
  },
  infoRow: {
    marginBottom: spacing.md,
  },
  infoLabel: {
    ...textStyles.labelSmall,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    ...textStyles.bodyLarge,
  },
  summaryHeader: {
    ...commonStyles.flexRow,
    ...commonStyles.flexBetween,
    ...commonStyles.alignCenter,
    marginBottom: spacing.md,
  },
  viewExpensesButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  viewExpensesButtonText: {
    ...textStyles.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  statsContainer: {
    ...commonStyles.flexRow,
    ...commonStyles.flexBetween,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...textStyles.h3,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.textTertiary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  addExpensePrompt: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: spacing.sm,
    alignItems: 'center',
  },
  addExpenseText: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
  summaryRow: {
    ...commonStyles.flexRow,
    ...commonStyles.flexBetween,
    ...commonStyles.alignCenter,
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...textStyles.bodyLarge,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...textStyles.bodyLarge,
    fontWeight: textStyles.label.fontWeight,
  },
  summaryNote: {
    ...textStyles.caption,
    color: colors.textDisabled,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  actionButtons: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionButton: {
    ...commonStyles.button,
  },
  exportButton: {
    backgroundColor: '#4CAF50',
  },
  exportButtonText: {
    ...textStyles.button,
  },
  editButton: {
    ...commonStyles.buttonPrimary,
  },
  editButtonText: {
    ...textStyles.button,
  },
  deleteButton: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.errorDark,
  },
  deleteButtonText: {
    ...textStyles.button,
    color: colors.errorDark,
  },
});

// Trip List Styles
export const tripListStyles = StyleSheet.create({
  container: {
    ...commonStyles.containerGray,
  },
  searchContainer: {
    backgroundColor: colors.background,
    padding: spacing.base,
    ...commonStyles.borderBottom,
  },
  searchInput: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...textStyles.body,
  },
  listContent: {
    padding: spacing.base,
    paddingBottom: 80,
  },
  tripCard: {
    ...commonStyles.card,
    marginBottom: spacing.base,
  },
  tripCardHeader: {
    ...commonStyles.flexRow,
    ...commonStyles.flexBetween,
    ...commonStyles.alignCenter,
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
  },
  tripName: {
    ...textStyles.h5,
    flex: 1,
    marginRight: spacing.md,
  },
  statusBadge: {
    ...commonStyles.badge,
  },
  status_upcoming: {
    backgroundColor: colors.infoLight,
  },
  status_active: {
    backgroundColor: colors.successLight,
  },
  status_completed: {
    ...commonStyles.badgeGray,
  },
  statusText: {
    ...textStyles.badge,
    fontSize: textStyles.caption.fontSize,
    color: colors.textSecondary,
  },
  tripCardBody: {
    padding: spacing.base,
  },
  infoRow: {
    ...commonStyles.flexRow,
    marginBottom: spacing.sm,
  },
  infoLabel: {
    ...textStyles.labelSmall,
    color: colors.textTertiary,
    width: 90,
  },
  infoValue: {
    ...textStyles.body,
    flex: 1,
  },
  tripCardFooter: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundTertiary,
  },
  statsRow: {
    ...commonStyles.flexRow,
    ...commonStyles.flexBetween,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...textStyles.h4,
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.textTertiary,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.backgroundTertiary,
    marginHorizontal: spacing.md,
  },
  expenseCount: {
    ...textStyles.body,
    color: colors.textTertiary,
  },
  emptyState: {
    ...commonStyles.emptyContainer,
  },
  emptyStateTitle: {
    ...commonStyles.emptyTitle,
  },
  emptyStateText: {
    ...commonStyles.emptySubtitle,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xxxl,
  },
  emptyStateButton: {
    ...commonStyles.buttonPrimary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  emptyStateButtonText: {
    ...textStyles.button,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    ...commonStyles.flexCenter,
    ...shadows.xl,
  },
  fabIcon: {
    fontSize: spacing.xxl + spacing.sm,
    color: colors.textInverse,
    fontWeight: fontWeights.regular,
  },
});

// Home Screen Styles
export const homeScreenStyles = StyleSheet.create({
  container: {
    ...commonStyles.flex1,
    backgroundColor: colors.backgroundSecondary,
  },
  contentContainer: {
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    ...commonStyles.loadingContainer,
  },
  loadingText: {
    ...commonStyles.loadingText,
  },
  header: {
    marginBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
  headerTitle: {
    ...textStyles.h2,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...textStyles.bodyLarge,
    color: colors.textTertiary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...textStyles.h5,
    marginBottom: spacing.md,
  },
  actionButton: {
    ...commonStyles.flexRow,
    alignItems: 'center',
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.whiteOverlay20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  secondaryButtonIcon: {
    backgroundColor: colors.backgroundTertiary,
  },
  buttonContent: {
    flex: 1,
  },
  buttonTitle: {
    ...textStyles.h6,
    color: colors.textInverse,
    marginBottom: 2,
  },
  secondaryButtonTitle: {
    color: colors.textPrimary,
  },
  buttonSubtitle: {
    ...textStyles.bodySmall,
    color: colors.whiteOverlay80,
  },
  secondaryButtonSubtitle: {
    color: colors.textTertiary,
  },
  infoSection: {
    backgroundColor: colors.infoBg,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: spacing.sm,
  },
  infoText: {
    ...textStyles.body,
    color: colors.info,
    flex: 1,
  },
});

// Dashboard Styles
export const dashboardStyles = StyleSheet.create({
  container: {
    ...commonStyles.flex1,
    backgroundColor: colors.background,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...textStyles.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  clearButton: {
    margin: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  clearButtonText: {
    ...textStyles.button,
    color: colors.textInverse,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  itemCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
  },
  statusIcon: {
    marginRight: spacing.xs,
  },
  statusText: {
    ...textStyles.caption,
    fontWeight: '600',
  },
  removeButton: {
    padding: spacing.xs,
  },
  itemBody: {
    gap: spacing.xs,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  serviceText: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    marginLeft: spacing.sm,
  },
  methodIcon: {
    marginRight: spacing.xs / 2,
  },
  methodText: {
    ...textStyles.caption,
    fontWeight: '600',
    fontSize: 11,
  },
  dateText: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  processingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  processingText: {
    ...textStyles.body,
    color: colors.primary,
    fontStyle: 'italic',
  },
  resultContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  resultLabel: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  resultText: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  resultDate: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  confidenceText: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  processedAtText: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  errorContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  errorLabel: {
    ...textStyles.caption,
    color: colors.error,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  errorText: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  retryText: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  retryButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    ...textStyles.caption,
    color: colors.textInverse,
    fontWeight: '600',
  },
  pendingContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
  },
  pendingText: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...textStyles.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tapToVerifyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  tapIcon: {
    marginRight: spacing.xs,
  },
  tapToVerifyText: {
    ...textStyles.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  completedItemWrapper: {
    // No additional styles needed
  },
});

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  colors,
  spacing,
  borderRadius,
  iconSizes,
  buttonHeights,
  inputHeights,
  containerPadding,
  tabBarHeight,
  headerHeight,
  shadows,
  fontSizes,
  fontWeights,
  lineHeights,
  textStyles,
  commonStyles,
  
  // Component styles
  exportScreenStyles,
  cameraScreenStyles,
  photoPreviewStyles,
  tripCardStyles,
  formStyles,
  dialogStyles,
  imageDisplayStyles,
  bottomDrawerStyles,
  expenseEditFormStyles,
  expenseDetailStyles,
  expenseListStyles,
  integrationGuideStyles,
  integrationSettingsStyles,
  settingsScreenStyles,
  addExpenseMethodStyles,
  tripDetailStyles,
  tripListStyles,
  homeScreenStyles,
  dashboardStyles,
};
