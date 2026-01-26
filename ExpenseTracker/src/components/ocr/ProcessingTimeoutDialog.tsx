/**
 * Processing Timeout Dialog
 * Shown when AI processing is taking longer than expected
 * Gives user choice to continue waiting or switch to offline OCR
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { spacing, borderRadius, textStyles } from '../../styles';
import { useTheme } from '../../contexts/ThemeContext';

export interface ProcessingTimeoutDialogProps {
  visible: boolean;
  onContinueWaiting: () => void;
  onSwitchToOffline: () => void;
  waitingTime: number; // seconds waited so far
}

export const ProcessingTimeoutDialog: React.FC<ProcessingTimeoutDialogProps> = ({
  visible,
  onContinueWaiting,
  onSwitchToOffline,
  waitingTime,
}) => {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onContinueWaiting}>
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: colors.background }]}>
          {/* Header with spinner */}
          <View style={styles.header}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              AI Processing Taking Longer
            </Text>
            <Text style={[styles.message, { color: colors.textSecondary }]}>
              The AI service has been processing for {waitingTime} seconds.
              {'\n\n'}
              Would you like to continue waiting or switch to offline OCR?
            </Text>
          </View>

          {/* Option 1: Continue Waiting */}
          <TouchableOpacity
            style={[
              styles.option,
              styles.primaryOption,
              { backgroundColor: colors.primaryLight, borderColor: colors.primary },
            ]}
            onPress={onContinueWaiting}
            activeOpacity={0.7}>
            <View style={styles.optionContent}>
              <View style={styles.optionIconContainer}>
                <Icon name="time-outline" size={28} color={colors.primary} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>
                  Continue Waiting
                </Text>
                <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                  Wait another {waitingTime} seconds for AI results
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={24} color={colors.primary} />
          </TouchableOpacity>

          {/* Option 2: Switch to Offline OCR */}
          <TouchableOpacity
            style={[
              styles.option,
              { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
            ]}
            onPress={onSwitchToOffline}
            activeOpacity={0.7}>
            <View style={styles.optionContent}>
              <View style={styles.optionIconContainer}>
                <Icon name="document-text-outline" size={28} color={colors.textSecondary} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>
                  Switch to Offline OCR
                </Text>
                <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                  Use device text recognition instead
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={24} color={colors.textTertiary} />
          </TouchableOpacity>

          {/* Info */}
          <View
            style={[
              styles.infoBox,
              { backgroundColor: colors.infoLight, borderColor: colors.info },
            ]}>
            <Icon name="information-circle-outline" size={20} color={colors.info} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              AI processing typically takes 10-30 seconds depending on image quality and server
              load.
            </Text>
          </View>
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
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...textStyles.h2,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    ...textStyles.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 2,
  },
  primaryOption: {
    // backgroundColor and borderColor are now dynamic
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
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  optionDesc: {
    ...textStyles.caption,
    lineHeight: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  infoText: {
    ...textStyles.caption,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
});
