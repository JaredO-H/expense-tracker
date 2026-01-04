/**
 * AI Service Help Screen
 * Guidance for obtaining and configuring API keys
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getAllServices } from '../../services/ai/aiServiceFactory';
import { colors as staticColors, spacing, textStyles, commonStyles } from '../../styles';
import { useTheme } from '../../contexts/ThemeContext';

export const AIServiceHelp: React.FC = () => {
  const { colors } = useTheme();

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            API Key Setup Guide
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textTertiary }]}>
            Follow these steps to obtain API keys for each service
          </Text>
        </View>

        {/* Service Guides */}
        {getAllServices().map(service => (
          <View key={service.id} style={styles.serviceSection}>
            <Text style={[styles.serviceName, { color: colors.primary }]}>{service.name}</Text>

            <View
              style={[
                styles.guideCard,
                { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
              ]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                How to Get Your API Key:
              </Text>

              {service.id === 'openai' && (
                <View style={styles.stepsList}>
                  <Text style={[styles.step, { color: colors.textSecondary }]}>
                    1. Visit platform.openai.com
                  </Text>
                  <Text style={[styles.step, { color: colors.textSecondary }]}>
                    2. Sign in or create an account
                  </Text>
                  <Text style={[styles.step, { color: colors.textSecondary }]}>
                    3. Navigate to API Keys section
                  </Text>
                  <Text style={[styles.step, { color: colors.textSecondary }]}>
                    4. Click "Create new secret key"
                  </Text>
                  <Text style={[styles.step, { color: colors.textSecondary }]}>
                    5. Copy and save your API key securely
                  </Text>
                  <Text style={[styles.step, { color: colors.textSecondary }]}>
                    6. Paste it in the AI Service Settings
                  </Text>
                </View>
              )}

              {service.id === 'anthropic' && (
                <View style={styles.stepsList}>
                  <Text style={[styles.step, { color: colors.textSecondary }]}>
                    1. Visit console.anthropic.com
                  </Text>
                  <Text style={[styles.step, { color: colors.textSecondary }]}>
                    2. Sign in or create an account
                  </Text>
                  <Text style={[styles.step, { color: colors.textSecondary }]}>
                    3. Go to API Keys in settings
                  </Text>
                  <Text style={[styles.step, { color: colors.textSecondary }]}>
                    4. Generate a new API key
                  </Text>
                  <Text style={[styles.step, { color: colors.textSecondary }]}>
                    5. Copy your API key
                  </Text>
                  <Text style={[styles.step, { color: colors.textSecondary }]}>
                    6. Paste it in the AI Service Settings
                  </Text>
                </View>
              )}

              {service.id === 'gemini' && (
                <View style={styles.stepsList}>
                  <Text style={[styles.step, { color: colors.textSecondary }]}>
                    1. Visit console.cloud.google.com
                  </Text>
                  <Text style={[styles.step, { color: colors.textSecondary }]}>
                    2. Create or select a project
                  </Text>
                  <Text style={[styles.step, { color: colors.textSecondary }]}>
                    3. Enable Generative AI API
                  </Text>
                  <Text style={[styles.step, { color: colors.textSecondary }]}>
                    4. Go to Credentials section
                  </Text>
                  <Text style={[styles.step, { color: colors.textSecondary }]}>
                    5. Create API Key
                  </Text>
                  <Text style={[styles.step, { color: colors.textSecondary }]}>
                    6. Copy and paste in AI Service Settings
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => handleOpenLink(service.documentationUrl)}>
                <Text style={[styles.linkButtonText, { color: colors.primary }]}>
                  View Official Documentation
                </Text>
                <Icon
                  name="arrow-forward"
                  size={16}
                  color={colors.primary}
                  style={styles.linkIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Troubleshooting Section */}
        <View
          style={[
            styles.troubleshootingSection,
            { backgroundColor: colors.warningLight, borderLeftColor: colors.warning },
          ]}>
          <Text style={[styles.troubleshootingTitle, { color: colors.warningDark }]}>
            Troubleshooting
          </Text>

          <View style={styles.troubleshootingItem}>
            <Text style={[styles.troubleshootingQuestion, { color: colors.textPrimary }]}>
              Connection test failed?
            </Text>
            <View style={styles.answerRow}>
              <Icon
                name="wifi-outline"
                size={16}
                color={colors.textSecondary}
                style={styles.answerIcon}
              />
              <Text style={[styles.troubleshootingAnswer, { color: colors.textSecondary }]}>
                Check your internet connection
              </Text>
            </View>
            <View style={styles.answerRow}>
              <Icon
                name="key-outline"
                size={16}
                color={colors.textSecondary}
                style={styles.answerIcon}
              />
              <Text style={[styles.troubleshootingAnswer, { color: colors.textSecondary }]}>
                Verify API key is correct (no extra spaces)
              </Text>
            </View>
            <View style={styles.answerRow}>
              <Icon
                name="card-outline"
                size={16}
                color={colors.textSecondary}
                style={styles.answerIcon}
              />
              <Text style={[styles.troubleshootingAnswer, { color: colors.textSecondary }]}>
                Ensure you have sufficient credits in your account
              </Text>
            </View>
            <View style={styles.answerRow}>
              <Icon
                name="alert-circle-outline"
                size={16}
                color={colors.textSecondary}
                style={styles.answerIcon}
              />
              <Text style={[styles.troubleshootingAnswer, { color: colors.textSecondary }]}>
                Check if the service is experiencing outages
              </Text>
            </View>
          </View>

          <View style={styles.troubleshootingItem}>
            <Text style={[styles.troubleshootingQuestion, { color: colors.textPrimary }]}>
              Invalid API key format?
            </Text>
            <Text style={[styles.troubleshootingAnswer, { color: colors.textSecondary }]}>
              Each service has a specific key format:
            </Text>
            <View style={styles.answerRow}>
              <Icon
                name="ellipse"
                size={8}
                color={colors.textSecondary}
                style={styles.answerIcon}
              />
              <Text style={[styles.troubleshootingAnswer, { color: colors.textSecondary }]}>
                OpenAI: Starts with "sk-"
              </Text>
            </View>
            <View style={styles.answerRow}>
              <Icon
                name="ellipse"
                size={8}
                color={colors.textSecondary}
                style={styles.answerIcon}
              />
              <Text style={[styles.troubleshootingAnswer, { color: colors.textSecondary }]}>
                Anthropic: Starts with "sk-ant-"
              </Text>
            </View>
            <View style={styles.answerRow}>
              <Icon
                name="ellipse"
                size={8}
                color={colors.textSecondary}
                style={styles.answerIcon}
              />
              <Text style={[styles.troubleshootingAnswer, { color: colors.textSecondary }]}>
                Gemini: Starts with "AIza"
              </Text>
            </View>
          </View>

          <View style={styles.troubleshootingItem}>
            <Text style={[styles.troubleshootingQuestion, { color: colors.textPrimary }]}>
              Rate limit errors?
            </Text>
            <Text style={[styles.troubleshootingAnswer, { color: colors.textSecondary }]}>
              You may have exceeded the service's rate limits. Wait a few minutes and try again, or
              upgrade your account tier with the service provider.
            </Text>
          </View>
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
  },
  headerTitle: {
    ...textStyles.h3,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...textStyles.body,
    color: staticColors.textTertiary,
  },
  serviceSection: {
    marginBottom: spacing.xxl,
  },
  serviceName: {
    ...textStyles.h4,
    marginBottom: spacing.md,
    color: staticColors.primary,
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
    color: staticColors.primary,
    textDecorationLine: 'none',
  },
  linkIcon: {
    marginLeft: spacing.xs,
  },
  infoText: {
    ...textStyles.body,
    color: staticColors.textSecondary,
    marginBottom: spacing.sm,
  },
  boldText: {
    fontWeight: textStyles.label.fontWeight,
    color: staticColors.textPrimary,
  },
  troubleshootingSection: {
    ...commonStyles.card,
    backgroundColor: staticColors.warningLight,
    borderLeftWidth: 4,
    borderLeftColor: staticColors.warning,
  },
  troubleshootingTitle: {
    ...textStyles.h5,
    marginBottom: spacing.lg,
    color: staticColors.warningDark,
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
    color: staticColors.textSecondary,
    flex: 1,
  },
});
