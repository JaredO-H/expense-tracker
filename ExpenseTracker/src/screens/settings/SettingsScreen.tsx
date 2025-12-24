/**
 * Settings Screen - Neo-Memphis Edition
 * Bold settings menu with geometric flair
 * Refactored to use centralized screenStyles
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, textStyles, borderRadius, shadows, screenStyles } from '../../styles';
import { staggeredFadeIn, createAnimatedValues } from '../../utils/animations';

type NavigationProp = NativeStackNavigationProp<any>;

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  // Entrance animations for option cards
  const [optionAnims] = useState(() => createAnimatedValues(3, 0));

  useEffect(() => {
    // Trigger staggered entrance
    staggeredFadeIn(optionAnims, 150, 600).start();
  }, []);

  const settingsOptions = [
    {
      title: 'General Settings',
      description: 'Currency, date format, and default preferences',
      onPress: () => navigation.navigate('GeneralSettings'),
      icon: 'settings-outline',
      color: colors.primary,
      bgColor: colors.primaryLight,
    },
    {
      title: 'AI Service Configuration',
      description: 'Configure your AI service provider and API keys',
      onPress: () => navigation.navigate('AIServiceSettings'),
      icon: 'hardware-chip-outline',
      color: colors.secondary,
      bgColor: colors.secondaryLight,
    },
    {
      title: 'API Key Setup Guide',
      description: 'Learn how to obtain API keys for each service',
      onPress: () => navigation.navigate('AIServiceHelp'),
      icon: 'book-outline',
      color: colors.accent1Dark,
      bgColor: colors.accent1Light,
    },
  ];

  return (
    <View style={screenStyles.screenWithDecorations}>
      {/* Background decorations */}
      <View style={screenStyles.bgDecorCircleMedium} />
      <View style={screenStyles.bgDecorSquareLeft} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={screenStyles.scrollViewContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerDecor} />
          <View style={styles.headerIcon}>
            <Icon name="cog" size={40} color={colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>
            Configure your expense tracker
          </Text>
        </View>

        {/* Settings Options */}
        <View style={styles.optionsContainer}>
          {settingsOptions.map((option, index) => (
            <Animated.View
              key={index}
              style={{
                opacity: optionAnims[index],
                transform: [
                  {
                    translateY: optionAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              }}>
              <TouchableOpacity
                style={styles.optionCard}
                onPress={option.onPress}
                activeOpacity={0.8}>
              {/* Geometric decoration */}
              <View style={[styles.cardDecor, { backgroundColor: option.bgColor }]} />

              <View style={[styles.optionIcon, { backgroundColor: option.bgColor }]}>
                <Icon name={option.icon} size={28} color={option.color} />
              </View>

              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>

              <View style={styles.optionArrow}>
                <Icon name="arrow-forward" size={24} color={colors.textSecondary} />
              </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* App Information Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoDecor} />

          <View style={styles.infoHeader}>
            <View style={styles.infoIconContainer}>
              <Icon name="information-circle" size={32} color={colors.accent3Dark} />
            </View>
            <Text style={styles.infoTitle}>ABOUT THIS APP</Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoContent}>
            <View style={styles.infoRow}>
              <Icon name="apps" size={20} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>0.0.1</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Minimal local styles - most styles now use centralized screenStyles
const styles = StyleSheet.create({
  // ScrollView basic style
  scrollView: {
    flex: 1,
  },

  // Header - Settings-specific centered header with icon
  header: {
    marginBottom: spacing.xxl,
    alignItems: 'center',
    position: 'relative',
  },
  headerDecor: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -2,
    width: 4,
    height: 80,
    backgroundColor: colors.primary,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: colors.border,
    ...shadows.medium,
  },
  headerTitle: {
    ...textStyles.h1,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  headerSubtitle: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Options Container
  optionsContainer: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },

  // Option Cards - Settings menu items
  optionCard: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 3,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...shadows.medium,
  },
  cardDecor: {
    position: 'absolute',
    bottom: -15,
    right: -15,
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.4,
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
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
    color: colors.textSecondary,
    lineHeight: 18,
  },
  optionArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },

  // Info Card - App information display
  infoCard: {
    backgroundColor: colors.accent3Light,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 3,
    borderColor: colors.accent3,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.medium,
  },
  infoDecor: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    backgroundColor: colors.accent3,
    opacity: 0.2,
    transform: [{ rotate: '45deg' }],
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.accent3,
  },
  infoTitle: {
    ...textStyles.labelMedium,
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  infoDivider: {
    height: 3,
    backgroundColor: colors.accent3,
    marginBottom: spacing.md,
  },
  infoContent: {
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    ...textStyles.body,
    flex: 1,
    color: colors.textSecondary,
  },
  infoValue: {
    ...textStyles.bodyBold,
    color: colors.textPrimary,
  },
});
