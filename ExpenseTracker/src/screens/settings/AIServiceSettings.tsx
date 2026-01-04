/**
 * AI Service Settings Screen
 * Configure AI service provider and API keys
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSettingsStore } from '../../stores/settingsStore';
import { CredentialService } from '../../services/security/credentialService';
import {
  testServiceConnection,
  validateAPIKeyFormat,
  getAllServices,
  getServiceConfig,
} from '../../services/ai/aiServiceFactory';
import { AIServiceId } from '../../types/aiService';
import { colors as staticColors, spacing, textStyles, commonStyles } from '../../styles';
import { useTheme } from '../../contexts/ThemeContext';

export const AIServiceSettings: React.FC = () => {
  const { colors, themeVersion } = useTheme();
  const {
    selectedAIService,
    serviceStatuses,
    setSelectedAIService,
    setServiceStatus,
    initializeSettings,
  } = useSettingsStore();

  const [apiKeys, setApiKeys] = useState<Record<AIServiceId, string>>({
    openai: '',
    anthropic: '',
    gemini: '',
  });

  const [showAPIKey, setShowAPIKey] = useState<Record<AIServiceId, boolean>>({
    openai: false,
    anthropic: false,
    gemini: false,
  });

  const [isTesting, setIsTesting] = useState<AIServiceId | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    await initializeSettings();

    // Load masked API keys for display
    const services: AIServiceId[] = ['openai', 'anthropic', 'gemini'];
    for (const serviceId of services) {
      const apiKey = await CredentialService.getAPIKey(serviceId);
      if (apiKey) {
        setApiKeys(prev => ({
          ...prev,
          [serviceId]: CredentialService.maskAPIKey(apiKey),
        }));
      }
    }

    setIsLoading(false);
  };

  const handleServiceSelect = async (serviceId: AIServiceId) => {
    await setSelectedAIService(serviceId);
  };

  const handleAPIKeyChange = (serviceId: AIServiceId, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [serviceId]: value,
    }));
  };

  const handleSaveAPIKey = async (serviceId: AIServiceId) => {
    const apiKey = apiKeys[serviceId];

    if (!apiKey || apiKey.trim().length === 0) {
      Alert.alert('Error', 'Please enter an API key');
      return;
    }

    // Skip validation if it's a masked key (already saved)
    if (apiKey.includes('•')) {
      Alert.alert('Info', 'This API key is already saved');
      return;
    }

    // Validate format
    const validation = validateAPIKeyFormat(serviceId, apiKey);
    if (!validation.success) {
      Alert.alert('Invalid API Key', validation.errorMessage || 'Invalid API key format');
      return;
    }

    try {
      setIsLoading(true);

      // Save to secure storage
      await CredentialService.storeAPIKey(serviceId, apiKey);

      // Update status
      setServiceStatus(serviceId, 'configured');

      // Mask the key for display
      setApiKeys(prev => ({
        ...prev,
        [serviceId]: CredentialService.maskAPIKey(apiKey),
      }));

      Alert.alert('Success', 'API key saved securely');
    } catch (error) {
      Alert.alert('Error', 'Failed to save API key. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async (serviceId: AIServiceId) => {
    setIsTesting(serviceId);
    setServiceStatus(serviceId, 'testing');

    const result = await testServiceConnection(serviceId);

    setIsTesting(null);

    if (result.success) {
      setServiceStatus(serviceId, 'connected');
      Alert.alert('Success', `Successfully connected to ${getServiceConfig(serviceId).name}`);
    } else {
      setServiceStatus(serviceId, 'error');
      Alert.alert('Connection Failed', result.errorMessage || 'Failed to connect to service');
    }
  };

  const handleDeleteAPIKey = async (serviceId: AIServiceId) => {
    Alert.alert(
      'Delete API Key',
      `Are you sure you want to delete your ${getServiceConfig(serviceId).name} API key?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await CredentialService.deleteAPIKey(serviceId);
              setApiKeys(prev => ({
                ...prev,
                [serviceId]: '',
              }));
              setServiceStatus(serviceId, 'not_configured');
              Alert.alert('Success', 'API key deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete API key');
            }
          },
        },
      ],
    );
  };

  const toggleShowAPIKey = (serviceId: AIServiceId) => {
    setShowAPIKey(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId],
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return colors.success;
      case 'configured':
        return colors.info;
      case 'testing':
        return colors.warning;
      case 'error':
        return colors.error;
      default:
        return colors.textTertiary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'configured':
        return 'Configured';
      case 'testing':
        return 'Testing...';
      case 'error':
        return 'Error';
      default:
        return 'Not Configured';
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textPrimary }]}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
      key={themeVersion}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            AI Service Configuration
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textTertiary }]}>
            Choose your preferred AI service for receipt processing
          </Text>
        </View>

        {/* Service Selection */}
        {getAllServices().map(service => {
          const isSelected = selectedAIService === service.id;
          const status = serviceStatuses[service.id];

          return (
            <View
              key={service.id}
              style={[
                styles.serviceCard,
                { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
              ]}>
              {/* Service Header */}
              <TouchableOpacity
                style={[
                  styles.serviceHeader,
                  isSelected && [
                    styles.serviceHeaderSelected,
                    { borderBottomColor: colors.border },
                  ],
                ]}
                onPress={() => handleServiceSelect(service.id)}
                activeOpacity={0.7}>
                <View style={styles.serviceHeaderLeft}>
                  <View
                    style={[
                      styles.radioButton,
                      { borderColor: isSelected ? colors.primary : colors.border },
                      isSelected && { borderColor: colors.primary },
                    ]}>
                    {isSelected && (
                      <View
                        style={[styles.radioButtonInner, { backgroundColor: colors.primary }]}
                      />
                    )}
                  </View>
                  <View style={styles.serviceInfo}>
                    <Text style={[styles.serviceName, { color: colors.textPrimary }]}>
                      {service.name}
                    </Text>
                    <View style={styles.statusBadge}>
                      <View
                        style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]}
                      />
                      <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                        {getStatusText(status)}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Service Details (shown when selected) */}
              {isSelected && (
                <View style={styles.serviceDetails}>
                  <Text style={[styles.serviceDescription, { color: colors.textSecondary }]}>
                    {service.description}
                  </Text>

                  {/* API Key Input */}
                  <Text style={[styles.apiKeyLabel, { color: colors.textPrimary }]}>API Key</Text>
                  <View style={styles.apiKeyContainer}>
                    <TextInput
                      style={[
                        styles.apiKeyInput,
                        {
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                          color: colors.textPrimary,
                        },
                      ]}
                      value={apiKeys[service.id]}
                      onChangeText={value => handleAPIKeyChange(service.id, value)}
                      placeholder={service.apiKeyPlaceholder}
                      placeholderTextColor={colors.textDisabled}
                      secureTextEntry={!showAPIKey[service.id]}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.showButton}
                      onPress={() => toggleShowAPIKey(service.id)}>
                      <Text style={[styles.showButtonText, { color: colors.primary }]}>
                        {showAPIKey[service.id] ? 'Hide' : 'Show'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Setup Instructions */}
                  <Text style={[styles.setupInstructions, { color: colors.textSecondary }]}>
                    {service.setupInstructions}
                  </Text>

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        styles.saveButton,
                        { backgroundColor: colors.primary, borderColor: colors.border },
                      ]}
                      onPress={() => handleSaveAPIKey(service.id)}
                      disabled={isLoading}>
                      <Text style={[styles.saveButtonText, { color: colors.textInverse }]}>
                        Save API Key
                      </Text>
                    </TouchableOpacity>

                    {status !== 'not_configured' && (
                      <>
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            styles.testButton,
                            { backgroundColor: colors.info, borderColor: colors.border },
                          ]}
                          onPress={() => handleTestConnection(service.id)}
                          disabled={isTesting === service.id}>
                          {isTesting === service.id ? (
                            <ActivityIndicator size="small" color={colors.textInverse} />
                          ) : (
                            <Text style={[styles.testButtonText, { color: colors.textInverse }]}>
                              Test Connection
                            </Text>
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            styles.deleteButton,
                            { backgroundColor: colors.background, borderColor: colors.error },
                          ]}
                          onPress={() => handleDeleteAPIKey(service.id)}>
                          <Text style={[styles.deleteButtonText, { color: colors.error }]}>
                            Delete Key
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* Help Section */}
        <View
          style={[
            styles.helpSection,
            { backgroundColor: colors.infoLight, borderLeftColor: colors.primary },
          ]}>
          <Text style={[styles.helpTitle, { color: colors.info }]}>Need Help?</Text>
          <Text style={[styles.helpText, { color: colors.textSecondary }]}>
            Visit the documentation for each service to learn how to obtain an API key and configure
            your account.
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
    color: staticColors.textTertiary,
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
    borderBottomColor: staticColors.border,
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
    borderColor: staticColors.border,
    ...commonStyles.flexCenter,
    marginRight: spacing.md,
  },
  radioButtonSelected: {
    borderColor: staticColors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: staticColors.primary,
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
    color: staticColors.textSecondary,
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
    color: staticColors.primary,
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
    backgroundColor: staticColors.info,
  },
  testButtonText: {
    ...textStyles.button,
  },
  deleteButton: {
    backgroundColor: staticColors.background,
    borderWidth: 1,
    borderColor: staticColors.error,
  },
  deleteButtonText: {
    ...textStyles.button,
    color: staticColors.error,
  },
  helpSection: {
    ...commonStyles.card,
    marginTop: spacing.lg,
    backgroundColor: staticColors.infoLight,
    borderLeftWidth: 4,
    borderLeftColor: staticColors.primary,
  },
  helpTitle: {
    ...textStyles.h6,
    color: staticColors.info,
    marginBottom: spacing.sm,
  },
  helpText: {
    ...textStyles.body,
    color: staticColors.info,
  },
});
