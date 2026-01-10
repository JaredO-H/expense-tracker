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
  Switch,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  colors as staticColors,
  spacing,
  textStyles,
  borderRadius,
  shadows,
  screenStyles,
} from '../../styles';
import { staggeredFadeIn, createAnimatedValues } from '../../utils/animations';
import { useTheme } from '../../contexts/ThemeContext';

type NavigationProp = NativeStackNavigationProp<any>;

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isDarkMode, toggleDarkMode, colors } = useTheme();

  // Entrance animations for option cards (5 items: dark mode toggle + 3 settings + info card)
  const [optionAnims] = useState(() => createAnimatedValues(5, 0));

  // Replay animations each time screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Reset animations
      optionAnims.forEach(anim => anim.setValue(0));

      // Trigger staggered entrance
      staggeredFadeIn(optionAnims, 150, 600).start();
    }, [optionAnims]),
  );

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
    <View style={[screenStyles.screenWithDecorations, { backgroundColor: colors.background }]}>
      {/* Background decorations */}
      <View style={[screenStyles.bgDecorCircleMedium, { backgroundColor: colors.accent1 }]} />
      <View style={[screenStyles.bgDecorSquareLeft, { backgroundColor: colors.accent4 }]} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={screenStyles.scrollViewContent}
        showsVerticalScrollIndicator={false}>
        {/* Settings Options */}
        <View style={styles.optionsContainer}>
          {/* Dark Mode Toggle */}
          <Animated.View
            style={{
              opacity: optionAnims[0],
              transform: [
                {
                  translateY: optionAnims[0].interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            }}>
            <View
              style={[
                styles.optionCard,
                { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
              ]}>
              {/* Geometric decoration */}
              <View style={[styles.cardDecor, { backgroundColor: colors.accent3Light }]} />

              <View
                style={[
                  styles.optionIcon,
                  { backgroundColor: colors.accent3Light, borderColor: colors.border },
                ]}>
                <Icon name={isDarkMode ? 'moon' : 'sunny'} size={28} color={colors.accent3Dark} />
              </View>

              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>Dark Mode</Text>
                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                  {isDarkMode ? 'Using dark theme' : 'Using light theme'}
                </Text>
              </View>

              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{
                  false: colors.borderLight,
                  true: colors.accent3Dark,
                }}
                thumbColor={isDarkMode ? colors.accent3 : colors.backgroundElevated}
                ios_backgroundColor={colors.borderLight}
              />
            </View>
          </Animated.View>

          {settingsOptions.map((option, index) => (
            <Animated.View
              key={index}
              style={{
                opacity: optionAnims[index + 1],
                transform: [
                  {
                    translateY: optionAnims[index + 1].interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              }}>
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
                ]}
                onPress={option.onPress}
                activeOpacity={0.8}>
                {/* Geometric decoration */}
                <View style={[styles.cardDecor, { backgroundColor: option.bgColor }]} />

                <View
                  style={[
                    styles.optionIcon,
                    { backgroundColor: option.bgColor, borderColor: colors.border },
                  ]}>
                  <Icon name={option.icon} size={28} color={option.color} />
                </View>

                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>
                    {option.title}
                  </Text>
                  <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                    {option.description}
                  </Text>
                </View>

                <View
                  style={[
                    styles.optionArrow,
                    { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                  ]}>
                  <Icon name="arrow-forward" size={24} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* App Information Card */}
        <Animated.View
          style={{
            opacity: optionAnims[4] || 1,
            transform: [
              {
                translateY: optionAnims[4]
                  ? optionAnims[4].interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    })
                  : 0,
              },
            ],
          }}>
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: isDarkMode ? colors.backgroundSecondary : colors.accent3Light,
                borderColor: colors.accent3,
              },
            ]}>
            <View style={[styles.infoDecor, { backgroundColor: colors.accent3 }]} />

          <View style={styles.infoHeader}>
            <View
              style={[
                styles.infoIconContainer,
                { backgroundColor: colors.backgroundElevated, borderColor: colors.accent3 },
              ]}>
              <Icon name="information-circle" size={32} color={colors.accent3Dark} />
            </View>
            <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>ABOUT THIS APP</Text>
          </View>

          <View style={[styles.infoDivider, { backgroundColor: colors.accent3 }]} />

          <View style={styles.infoContent}>
            <View style={styles.infoRow}>
              <Icon name="apps" size={20} color={colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Version</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>0.0.1</Text>
            </View>
          </View>
        </View>
        </Animated.View>
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

  // Options Container
  optionsContainer: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },

  // Option Cards - Settings menu items
  optionCard: {
    backgroundColor: staticColors.backgroundElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 3,
    borderColor: staticColors.border,
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
    borderColor: staticColors.border,
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
    color: staticColors.textSecondary,
    lineHeight: 18,
  },
  optionArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: staticColors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: staticColors.border,
  },

  // Info Card - App information display
  infoCard: {
    backgroundColor: staticColors.accent3Light,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 3,
    borderColor: staticColors.accent3,
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
    backgroundColor: staticColors.accent3,
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
    backgroundColor: staticColors.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: staticColors.accent3,
  },
  infoTitle: {
    ...textStyles.labelMedium,
    fontSize: 14,
    color: staticColors.textPrimary,
    flex: 1,
  },
  infoDivider: {
    height: 3,
    backgroundColor: staticColors.accent3,
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
    color: staticColors.textSecondary,
  },
  infoValue: {
    ...textStyles.bodyBold,
    color: staticColors.textPrimary,
  },
});
