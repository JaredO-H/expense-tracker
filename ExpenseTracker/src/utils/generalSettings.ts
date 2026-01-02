/**
 * General Settings Utility
 * Helper functions to access general settings throughout the app
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GeneralSettings {
  defaultCurrency: string;
  dateFormat: string;
  useSystemLocale: boolean;
  showCents: boolean;
  defaultTaxType: string;
}

const SETTINGS_KEY = '@general_settings';

const defaultSettings: GeneralSettings = {
  defaultCurrency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  useSystemLocale: true,
  showCents: true,
  defaultTaxType: 'none',
};

/**
 * Get all general settings
 */
export const getGeneralSettings = async (): Promise<GeneralSettings> => {
  try {
    const stored = await AsyncStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
    return defaultSettings;
  } catch (error) {
    console.error('Failed to load general settings:', error);
    return defaultSettings;
  }
};

/**
 * Get a specific setting value
 */
export const getSetting = async <K extends keyof GeneralSettings>(
  key: K
): Promise<GeneralSettings[K]> => {
  const settings = await getGeneralSettings();
  return settings[key];
};

/**
 * Get the default currency
 */
export const getDefaultCurrency = async (): Promise<string> => {
  return getSetting('defaultCurrency');
};

/**
 * Get the date format
 */
export const getDateFormat = async (): Promise<string> => {
  return getSetting('dateFormat');
};

/**
 * Get the default tax type
 */
export const getDefaultTaxType = async (): Promise<string> => {
  return getSetting('defaultTaxType');
};

/**
 * Check if cents should be shown
 */
export const shouldShowCents = async (): Promise<boolean> => {
  return getSetting('showCents');
};

/**
 * Format currency based on settings
 */
export const formatCurrency = async (
  amount: number,
  currency?: string
): Promise<string> => {
  const settings = await getGeneralSettings();
  const currencyCode = currency || settings.defaultCurrency;
  const showCents = settings.showCents;

  const formatted = showCents ? amount.toFixed(2) : Math.round(amount).toString();

  // Simple currency symbol mapping
  const currencySymbols: Record<string, string> = {
    USD: '$',
    CAD: 'CA$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    CHF: 'CHF',
    INR: '₹',
  };

  const symbol = currencySymbols[currencyCode] || currencyCode;
  return `${symbol}${formatted}`;
};

/**
 * Format date based on settings
 */
export const formatDateWithSettings = async (date: Date): Promise<string> => {
  const format = await getDateFormat();

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  switch (format) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD.MM.YYYY':
      return `${day}.${month}.${year}`;
    default:
      return `${month}/${day}/${year}`;
  }
};

/**
 * Get currency symbol for a currency code
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  const currencySymbols: Record<string, string> = {
    USD: '$',
    CAD: 'CA$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    CHF: 'CHF',
    INR: '₹',
  };

  return currencySymbols[currencyCode] || currencyCode;
};

/**
 * Update general settings
 */
export const updateGeneralSettings = async (
  updates: Partial<GeneralSettings>
): Promise<void> => {
  try {
    const currentSettings = await getGeneralSettings();
    const newSettings = { ...currentSettings, ...updates };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  } catch (error) {
    console.error('Failed to update general settings:', error);
    throw error;
  }
};
