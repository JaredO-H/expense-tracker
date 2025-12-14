/**
 * Settings Screen
 * Main settings menu with links to various configuration options
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, textStyles, commonStyles } from '../../styles';

type NavigationProp = NativeStackNavigationProp<any>;

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const settingsOptions = [
    {
      title: 'AI Service Configuration',
      description: 'Configure your AI service provider and API keys',
      onPress: () => navigation.navigate('AIServiceSettings'),
      icon: '🤖',
    },
    {
      title: 'API Key Setup Guide',
      description: 'Learn how to obtain API keys for each service',
      onPress: () => navigation.navigate('AIServiceHelp'),
      icon: '📖',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>
            Configure your expense tracker preferences
          </Text>
        </View>

        {/* Settings Options */}
        {settingsOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionCard}
            onPress={option.onPress}
            activeOpacity={0.7}>
            <View style={styles.optionIcon}>
              <Text style={styles.optionIconText}>{option.icon}</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>
        ))}

        {/* App Information */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About</Text>
          <Text style={styles.infoText}>Expense Tracker v0.0.1</Text>
          <Text style={styles.infoText}>
            AI-powered receipt processing for business travelers
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
  headerTitle: {
    ...textStyles.h2,
    marginBottom: spacing.xs,
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
  optionIconText: {
    fontSize: 24,
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
  optionArrow: {
    fontSize: 24,
    color: colors.textDisabled,
    marginLeft: spacing.sm,
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
