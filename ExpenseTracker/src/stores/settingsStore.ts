/**
 * Settings Store
 * Global application settings and AI service preferences
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIServiceId, DEFAULT_AI_SERVICE, AIServiceStatus } from '../types/aiService';
import { CredentialService } from '../services/security/credentialService';

interface SettingsState {
  // AI Service Configuration
  selectedAIService: AIServiceId;
  serviceStatuses: Record<AIServiceId, AIServiceStatus>;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedAIService: (serviceId: AIServiceId) => Promise<void>;
  setServiceStatus: (serviceId: AIServiceId, status: AIServiceStatus) => void;
  initializeSettings: () => Promise<void>;
  checkServiceConfiguration: (serviceId: AIServiceId) => Promise<void>;
  clearError: () => void;
}

const SETTINGS_STORAGE_KEY = '@ExpenseTracker:Settings';

/**
 * Settings Store using Zustand
 */
export const useSettingsStore = create<SettingsState>((set, get) => ({
  // Initial state
  selectedAIService: DEFAULT_AI_SERVICE,
  serviceStatuses: {
    openai: 'not_configured',
    anthropic: 'not_configured',
    gemini: 'not_configured',
  },
  isLoading: false,
  error: null,

  /**
   * Set the selected AI service and persist to storage
   */
  setSelectedAIService: async (serviceId: AIServiceId) => {
    try {
      set({ isLoading: true, error: null });

      // Save to AsyncStorage
      const settings = {
        selectedAIService: serviceId,
      };

      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));

      set({ selectedAIService: serviceId, isLoading: false });

      // Check if the service has an API key configured
      await get().checkServiceConfiguration(serviceId);
    } catch (error) {
      console.error('Failed to set selected AI service:', error);
      set({
        error: 'Failed to save AI service preference',
        isLoading: false,
      });
    }
  },

  /**
   * Set service status
   */
  setServiceStatus: (serviceId: AIServiceId, status: AIServiceStatus) => {
    set(state => ({
      serviceStatuses: {
        ...state.serviceStatuses,
        [serviceId]: status,
      },
    }));
  },

  /**
   * Initialize settings from storage
   */
  initializeSettings: async () => {
    try {
      set({ isLoading: true, error: null });

      // Load settings from AsyncStorage
      const settingsJson = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);

      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        set({ selectedAIService: settings.selectedAIService || DEFAULT_AI_SERVICE });
      }

      // Check configuration status for all services
      const services: AIServiceId[] = ['openai', 'anthropic', 'gemini'];
      await Promise.all(
        services.map(serviceId => get().checkServiceConfiguration(serviceId))
      );

      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to initialize settings:', error);
      set({
        error: 'Failed to load settings',
        isLoading: false,
      });
    }
  },

  /**
   * Check if a service has API key configured
   */
  checkServiceConfiguration: async (serviceId: AIServiceId) => {
    try {
      const hasAPIKey = await CredentialService.hasAPIKey(serviceId);

      const status: AIServiceStatus = hasAPIKey ? 'configured' : 'not_configured';

      set(state => ({
        serviceStatuses: {
          ...state.serviceStatuses,
          [serviceId]: status,
        },
      }));
    } catch (error) {
      console.error(`Failed to check ${serviceId} configuration:`, error);
      set(state => ({
        serviceStatuses: {
          ...state.serviceStatuses,
          [serviceId]: 'error',
        },
      }));
    }
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },
}));
