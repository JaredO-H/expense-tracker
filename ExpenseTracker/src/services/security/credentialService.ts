/**
 * Credential Service
 * Secure storage and management of API keys using device keychain
 */

import * as Keychain from 'react-native-keychain';

export type AIServiceId = 'openai' | 'anthropic' | 'gemini';

//Secure credential storage using device keychain
export class CredentialService {
  private static readonly KEYCHAIN_SERVICE_PREFIX = 'com.expensetracker.ai.';


  //Store API key securely in device keychain
  static async storeAPIKey(serviceId: AIServiceId, apiKey: string): Promise<void> {
    try {
      const keychainService = this.getKeychainServiceName(serviceId);

      await Keychain.setGenericPassword(
        serviceId,
        apiKey,
        {
          service: keychainService,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        }
      );
    } catch (error) {
      console.error(`Failed to store API key for ${serviceId}:`, error);
      throw new Error(`Failed to securely store API key. Please try again.`);
    }
  }


  //Retrieve API key from device keychain
  static async getAPIKey(serviceId: AIServiceId): Promise<string | null> {
    try {
      const keychainService = this.getKeychainServiceName(serviceId);

      const credentials = await Keychain.getGenericPassword({
        service: keychainService,
      });

      if (credentials && credentials.password) {
        return credentials.password;
      }

      return null;
    } catch (error) {
      console.error(`Failed to retrieve API key for ${serviceId}:`, error);
      return null;
    }
  }

  //Delete API key from device keychain
  static async deleteAPIKey(serviceId: AIServiceId): Promise<boolean> {
    try {
      const keychainService = this.getKeychainServiceName(serviceId);

      const result = await Keychain.resetGenericPassword({
        service: keychainService,
      });

      return result;
    } catch (error) {
      console.error(`Failed to delete API key for ${serviceId}:`, error);
      return false;
    }
  }

  //Check if API key exists for a service
  static async hasAPIKey(serviceId: AIServiceId): Promise<boolean> {
    const apiKey = await this.getAPIKey(serviceId);
    return apiKey !== null && apiKey.length > 0;
  }


  //Mask API key for display (show only last 4 characters)
  static maskAPIKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 8) {
      return '••••••••';
    }

    const visibleChars = 4;
    const maskedPart = '•'.repeat(apiKey.length - visibleChars);
    const visiblePart = apiKey.slice(-visibleChars);

    return `${maskedPart}${visiblePart}`;
  }


  //Delete all stored API keys (for logout/reset)
  static async deleteAllAPIKeys(): Promise<void> {
    const services: AIServiceId[] = ['openai', 'anthropic', 'gemini'];

    await Promise.all(
      services.map(serviceId => this.deleteAPIKey(serviceId))
    );
  }


  //Check if keychain is available on device
  static async isKeychainAvailable(): Promise<boolean> {
    try {
      // Try to get supported biometry type as a test
      await Keychain.getSupportedBiometryType();
      return true;
    } catch (error) {
      console.error('Keychain availability check failed:', error);
      return false;
    }
  }


  //Get keychain service name for an AI service
  private static getKeychainServiceName(serviceId: AIServiceId): string {
    return `${this.KEYCHAIN_SERVICE_PREFIX}${serviceId}`;
  }
}
