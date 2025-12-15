/**
 * Processing Options Dialog
 * Present processing options when AI services fail
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, textStyles, commonStyles } from '../../styles';

export interface ProcessingOptionsDialogProps {
  visible: boolean;
  onClose: () => void;
  onSelectOfflineOCR: () => void;
  onSelectManual: () => void;
  onSelectRetryLater: () => void;
}

export const ProcessingOptionsDialog: React.FC<ProcessingOptionsDialogProps> = ({
  visible,
  onClose,
  onSelectOfflineOCR,
  onSelectManual,
  onSelectRetryLater,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>AI Processing Failed</Text>
            <Text style={styles.message}>
              How would you like to proceed with this receipt?
            </Text>
          </View>

          {/* Option 1: Try Offline OCR */}
          <TouchableOpacity
            style={styles.option}
            onPress={onSelectOfflineOCR}
            activeOpacity={0.7}>
            <View style={styles.optionContent}>
              <View style={styles.optionIconContainer}>
                <Icon name="document-text-outline" size={28} color={colors.primary} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Try Offline OCR</Text>
                <Text style={styles.optionDesc}>
                  Use device text recognition (60-80% accuracy)
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={24} color={colors.textTertiary} />
          </TouchableOpacity>

          {/* Option 2: Enter Manually */}
          <TouchableOpacity
            style={styles.option}
            onPress={onSelectManual}
            activeOpacity={0.7}>
            <View style={styles.optionContent}>
              <View style={styles.optionIconContainer}>
                <Icon name="create-outline" size={28} color={colors.primary} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Enter Manually</Text>
                <Text style={styles.optionDesc}>
                  Enter details yourself (100% accuracy)
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={24} color={colors.textTertiary} />
          </TouchableOpacity>

          {/* Option 3: Retry Later */}
          <TouchableOpacity
            style={styles.option}
            onPress={onSelectRetryLater}
            activeOpacity={0.7}>
            <View style={styles.optionContent}>
              <View style={styles.optionIconContainer}>
                <Icon name="refresh-outline" size={28} color={colors.primary} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Retry Later</Text>
                <Text style={styles.optionDesc}>
                  Try again when back online
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={24} color={colors.textTertiary} />
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.7}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
