/**
 * General Settings Screen
 * Configure app-wide preferences like currency, date format, and defaults
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors as staticColors, spacing, textStyles, commonStyles } from '../../styles';
import { useTheme } from '../../contexts/ThemeContext';

interface GeneralSettings {
  dateFormat: string;
  useSystemLocale: boolean;
  showCents: boolean;
  defaultTaxType: string;
}

const DATE_FORMATS = [
  { label: 'MM/DD/YYYY (US)', value: 'MM/DD/YYYY' },
  { label: 'DD/MM/YYYY (International)', value: 'DD/MM/YYYY' },
  { label: 'YYYY-MM-DD (ISO)', value: 'YYYY-MM-DD' },
  { label: 'DD.MM.YYYY (European)', value: 'DD.MM.YYYY' },
];

const TAX_TYPES = [
  { label: 'None', value: 'none' },
  { label: 'Sales Tax', value: 'sales_tax' },
  { label: 'VAT', value: 'VAT' },
  { label: 'GST', value: 'GST' },
  { label: 'HST', value: 'HST' },
  { label: 'PST', value: 'PST' },
  { label: 'Other', value: 'other' },
];

const SETTINGS_KEY = '@general_settings';

const defaultSettings: GeneralSettings = {
  dateFormat: 'MM/DD/YYYY',
  useSystemLocale: true,
  showCents: true,
  defaultTaxType: 'none',
};

export const GeneralSettingsScreen: React.FC = () => {
  const { colors, themeVersion } = useTheme();
  const [settings, setSettings] = useState<GeneralSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      setHasChanges(false);

      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
      console.error('Failed to save settings:', error);
    }
  };

  const updateSetting = <K extends keyof GeneralSettings>(key: K, value: GeneralSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset to Defaults',
      'Are you sure you want to reset all general settings to their default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setSettings(defaultSettings);
            setHasChanges(true);
            try {
              await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));

              Alert.alert('Success', 'Settings reset to defaults');
              setHasChanges(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to reset settings');
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={styles.content}>
        {/* Date & Time Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Date & Time</Text>
          <View
            style={[
              styles.settingCard,
              { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
            ]}>
            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Date Format</Text>
            <View
              style={[
                styles.pickerContainer,
                { borderColor: colors.border, backgroundColor: colors.background },
              ]}>
              <Picker
                selectedValue={settings.dateFormat}
                onValueChange={value => updateSetting('dateFormat', value)}
                style={[styles.picker, { color: colors.textPrimary }]}>
                {DATE_FORMATS.map(format => (
                  <Picker.Item key={format.value} label={format.label} value={format.value} />
                ))}
              </Picker>
            </View>
            <Text style={[styles.settingDescription, { color: colors.textTertiary }]}>
              How dates are displayed throughout the app
            </Text>
          </View>

          <View
            style={[
              styles.settingCard,
              { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
            ]}>
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                  Use System Locale
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textTertiary }]}>
                  Follow device language and region settings
                </Text>
              </View>
              <Switch
                value={settings.useSystemLocale}
                onValueChange={value => updateSetting('useSystemLocale', value)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>
          </View>
        </View>

        {/* Expense Defaults */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Expense Defaults</Text>
          <View
            style={[
              styles.settingCard,
              { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
            ]}>
            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
              Default Tax Type
            </Text>
            <View
              style={[
                styles.pickerContainer,
                { borderColor: colors.border, backgroundColor: colors.background },
              ]}>
              <Picker
                selectedValue={settings.defaultTaxType}
                onValueChange={value => updateSetting('defaultTaxType', value)}
                style={[styles.picker, { color: colors.textPrimary }]}>
                {TAX_TYPES.map(taxType => (
                  <Picker.Item key={taxType.value} label={taxType.label} value={taxType.value} />
                ))}
              </Picker>
            </View>
            <Text style={[styles.settingDescription, { color: colors.textTertiary }]}>
              Pre-selected tax type for new expenses
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {hasChanges && (
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={saveSettings}>
              <Icon name="checkmark-circle" size={20} color={colors.textInverse} />
              <Text style={[styles.saveButtonText, { color: colors.textInverse }]}>
                Save Changes
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.resetButton,
              { backgroundColor: colors.background, borderColor: colors.primary },
            ]}
            onPress={resetToDefaults}>
            <Icon name="refresh" size={20} color={colors.primary} />
            <Text style={[styles.resetButtonText, { color: colors.primary }]}>
              Reset to Defaults
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={[styles.infoCard, { backgroundColor: colors.backgroundTertiary }]}>
          <Icon name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.textTertiary }]}>
            These settings affect how data is displayed and the default values for new expenses.
            Changes do not affect existing expenses.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: staticColors.backgroundSecondary,
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
    color: staticColors.textPrimary,
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
    color: staticColors.textPrimary,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    ...textStyles.bodySmall,
    color: staticColors.textTertiary,
    marginTop: spacing.xs,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: staticColors.border,
    borderRadius: 8,
    marginTop: spacing.sm,
    backgroundColor: staticColors.background,
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
    backgroundColor: staticColors.background,
    borderWidth: 2,
    borderColor: staticColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  resetButtonText: {
    ...textStyles.button,
    color: staticColors.primary,
  },
  infoCard: {
    flexDirection: 'row',
    ...commonStyles.card,
    backgroundColor: staticColors.backgroundTertiary,
    padding: spacing.base,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  infoText: {
    ...textStyles.bodySmall,
    color: staticColors.textTertiary,
    flex: 1,
  },
});

export default GeneralSettingsScreen;
