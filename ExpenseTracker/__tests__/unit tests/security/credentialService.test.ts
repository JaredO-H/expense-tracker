/**
 * Tests for Credential Service
 * Validates secure API key storage and retrieval
 */

import { CredentialService } from '../../../src/services/security/credentialService';
import * as Keychain from 'react-native-keychain';

// Get access to mock functions
const mockKeychain = Keychain as jest.Mocked<typeof Keychain>;

describe('Credential Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Clear mock storage
    (Keychain as any).__clearMockStorage?.();
  });

  describe('storeAPIKey', () => {
    it('should store OpenAI API key successfully', async () => {
      const apiKey = 'sk-proj-test1234567890abcdef';

      await CredentialService.storeAPIKey('openai', apiKey);

      expect(mockKeychain.setGenericPassword).toHaveBeenCalledWith(
        'openai',
        apiKey,
        expect.objectContaining({
          service: 'com.expensetracker.ai.openai',
        }),
      );
    });

    it('should store Anthropic API key successfully', async () => {
      const apiKey = 'sk-ant-api03-test1234567890';

      await CredentialService.storeAPIKey('anthropic', apiKey);

      expect(mockKeychain.setGenericPassword).toHaveBeenCalledWith(
        'anthropic',
        apiKey,
        expect.objectContaining({
          service: 'com.expensetracker.ai.anthropic',
        }),
      );
    });

    it('should store Gemini API key successfully', async () => {
      const apiKey = 'AIzaSyTest1234567890';

      await CredentialService.storeAPIKey('gemini', apiKey);

      expect(mockKeychain.setGenericPassword).toHaveBeenCalledWith(
        'gemini',
        apiKey,
        expect.objectContaining({
          service: 'com.expensetracker.ai.gemini',
        }),
      );
    });

    it('should use correct keychain service prefix', async () => {
      const apiKey = 'test-key';

      await CredentialService.storeAPIKey('openai', apiKey);

      expect(mockKeychain.setGenericPassword).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          service: expect.stringContaining('com.expensetracker.ai.'),
        }),
      );
    });

    it('should set accessible to WHEN_UNLOCKED', async () => {
      const apiKey = 'test-key';

      await CredentialService.storeAPIKey('openai', apiKey);

      expect(mockKeychain.setGenericPassword).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        }),
      );
    });

    it('should throw error if keychain storage fails', async () => {
      mockKeychain.setGenericPassword.mockRejectedValueOnce(new Error('Keychain error'));

      await expect(CredentialService.storeAPIKey('openai', 'test-key')).rejects.toThrow(
        'Failed to securely store API key',
      );
    });

    it('should handle empty API key', async () => {
      await CredentialService.storeAPIKey('openai', '');

      expect(mockKeychain.setGenericPassword).toHaveBeenCalledWith(
        'openai',
        '',
        expect.any(Object),
      );
    });

    it('should overwrite existing API key', async () => {
      await CredentialService.storeAPIKey('openai', 'old-key');
      await CredentialService.storeAPIKey('openai', 'new-key');

      expect(mockKeychain.setGenericPassword).toHaveBeenCalledTimes(2);
      expect(mockKeychain.setGenericPassword).toHaveBeenLastCalledWith(
        'openai',
        'new-key',
        expect.any(Object),
      );
    });
  });

  describe('getAPIKey', () => {
    it('should retrieve stored OpenAI API key', async () => {
      const apiKey = 'sk-proj-test1234567890';
      await CredentialService.storeAPIKey('openai', apiKey);

      const retrieved = await CredentialService.getAPIKey('openai');

      expect(retrieved).toBe(apiKey);
    });

    it('should retrieve stored Anthropic API key', async () => {
      const apiKey = 'sk-ant-api03-test1234567890';
      await CredentialService.storeAPIKey('anthropic', apiKey);

      const retrieved = await CredentialService.getAPIKey('anthropic');

      expect(retrieved).toBe(apiKey);
    });

    it('should retrieve stored Gemini API key', async () => {
      const apiKey = 'AIzaSyTest1234567890';
      await CredentialService.storeAPIKey('gemini', apiKey);

      const retrieved = await CredentialService.getAPIKey('gemini');

      expect(retrieved).toBe(apiKey);
    });

    it('should return null if API key not found', async () => {
      const apiKey = await CredentialService.getAPIKey('openai');

      expect(apiKey).toBeNull();
    });

    it('should return null if keychain returns false', async () => {
      mockKeychain.getGenericPassword.mockResolvedValueOnce(false);

      const apiKey = await CredentialService.getAPIKey('openai');

      expect(apiKey).toBeNull();
    });

    it('should return null if keychain access fails', async () => {
      mockKeychain.getGenericPassword.mockRejectedValueOnce(new Error('Keychain error'));

      const apiKey = await CredentialService.getAPIKey('openai');

      expect(apiKey).toBeNull();
    });

    it('should use correct service name when retrieving', async () => {
      await CredentialService.getAPIKey('openai');

      expect(mockKeychain.getGenericPassword).toHaveBeenCalledWith({
        service: 'com.expensetracker.ai.openai',
      });
    });

    it('should handle credentials with empty password', async () => {
      mockKeychain.getGenericPassword.mockResolvedValueOnce({
        username: 'openai',
        password: '',
        service: 'test',
        storage: 'test',
      });

      const apiKey = await CredentialService.getAPIKey('openai');

      // Empty password returns null per implementation logic
      expect(apiKey).toBeNull();
    });
  });

  describe('deleteAPIKey', () => {
    it('should delete stored API key successfully', async () => {
      await CredentialService.storeAPIKey('openai', 'test-key');

      const result = await CredentialService.deleteAPIKey('openai');

      expect(result).toBe(true);
      expect(mockKeychain.resetGenericPassword).toHaveBeenCalledWith({
        service: 'com.expensetracker.ai.openai',
      });
    });

    it('should return true when deleting OpenAI key', async () => {
      await CredentialService.storeAPIKey('openai', 'test-key');

      const result = await CredentialService.deleteAPIKey('openai');

      expect(result).toBe(true);
    });

    it('should return true when deleting Anthropic key', async () => {
      await CredentialService.storeAPIKey('anthropic', 'test-key');

      const result = await CredentialService.deleteAPIKey('anthropic');

      expect(result).toBe(true);
    });

    it('should return true when deleting Gemini key', async () => {
      await CredentialService.storeAPIKey('gemini', 'test-key');

      const result = await CredentialService.deleteAPIKey('gemini');

      expect(result).toBe(true);
    });

    it('should return false if deletion fails', async () => {
      mockKeychain.resetGenericPassword.mockRejectedValueOnce(new Error('Keychain error'));

      const result = await CredentialService.deleteAPIKey('openai');

      expect(result).toBe(false);
    });

    it('should handle deleting non-existent key', async () => {
      const result = await CredentialService.deleteAPIKey('openai');

      // Should still attempt deletion and return result
      expect(mockKeychain.resetGenericPassword).toHaveBeenCalled();
    });

    it('should use correct service name when deleting', async () => {
      await CredentialService.deleteAPIKey('openai');

      expect(mockKeychain.resetGenericPassword).toHaveBeenCalledWith({
        service: 'com.expensetracker.ai.openai',
      });
    });
  });

  describe('hasAPIKey', () => {
    it('should return true if API key exists', async () => {
      await CredentialService.storeAPIKey('openai', 'test-key');

      const hasKey = await CredentialService.hasAPIKey('openai');

      expect(hasKey).toBe(true);
    });

    it('should return false if API key does not exist', async () => {
      const hasKey = await CredentialService.hasAPIKey('openai');

      expect(hasKey).toBe(false);
    });

    it('should return false if API key is empty string', async () => {
      await CredentialService.storeAPIKey('openai', '');

      const hasKey = await CredentialService.hasAPIKey('openai');

      expect(hasKey).toBe(false);
    });

    it('should check all services independently', async () => {
      await CredentialService.storeAPIKey('openai', 'key1');
      await CredentialService.storeAPIKey('gemini', 'key3');

      expect(await CredentialService.hasAPIKey('openai')).toBe(true);
      expect(await CredentialService.hasAPIKey('anthropic')).toBe(false);
      expect(await CredentialService.hasAPIKey('gemini')).toBe(true);
    });

    it('should return false after key deletion', async () => {
      await CredentialService.storeAPIKey('openai', 'test-key');
      await CredentialService.deleteAPIKey('openai');

      const hasKey = await CredentialService.hasAPIKey('openai');

      expect(hasKey).toBe(false);
    });
  });

  describe('maskAPIKey', () => {
    it('should mask API key showing last 4 characters', () => {
      const apiKey = 'sk-proj-abcdefghijklmnopqrstuvwxyz123456';
      const masked = CredentialService.maskAPIKey(apiKey);

      expect(masked).toMatch(/^•+3456$/);
      expect(masked.length).toBe(apiKey.length);
    });

    it('should show only last 4 characters', () => {
      const apiKey = 'test1234567890';
      const masked = CredentialService.maskAPIKey(apiKey);

      expect(masked).toContain('7890');
      expect(masked.startsWith('•')).toBe(true);
    });

    it('should handle short keys (< 8 chars)', () => {
      const apiKey = 'short';
      const masked = CredentialService.maskAPIKey(apiKey);

      expect(masked).toBe('••••••••');
    });

    it('should handle empty string', () => {
      const masked = CredentialService.maskAPIKey('');

      expect(masked).toBe('••••••••');
    });

    it('should handle exactly 8 characters', () => {
      const apiKey = '12345678';
      const masked = CredentialService.maskAPIKey(apiKey);

      expect(masked).toBe('••••5678');
    });

    it('should handle very long keys', () => {
      const apiKey = 'a'.repeat(100) + '1234';
      const masked = CredentialService.maskAPIKey(apiKey);

      expect(masked).toMatch(/^•+1234$/);
      expect(masked.length).toBe(apiKey.length);
    });

    it('should mask OpenAI format keys correctly', () => {
      const apiKey = 'sk-proj-abc123xyz789def456ghi789';
      const masked = CredentialService.maskAPIKey(apiKey);

      expect(masked).toContain('i789');
      expect(masked.split('•').length - 1).toBeGreaterThan(0);
    });

    it('should mask Anthropic format keys correctly', () => {
      const apiKey = 'sk-ant-api03-abcdefghijklmnopqrstuvwxyz1234567890';
      const masked = CredentialService.maskAPIKey(apiKey);

      expect(masked).toContain('7890');
    });

    it('should mask Gemini format keys correctly', () => {
      const apiKey = 'AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567';
      const masked = CredentialService.maskAPIKey(apiKey);

      expect(masked).toContain('4567');
    });
  });

  describe('deleteAllAPIKeys', () => {
    it('should delete all stored API keys', async () => {
      await CredentialService.storeAPIKey('openai', 'key1');
      await CredentialService.storeAPIKey('anthropic', 'key2');
      await CredentialService.storeAPIKey('gemini', 'key3');

      await CredentialService.deleteAllAPIKeys();

      expect(await CredentialService.hasAPIKey('openai')).toBe(false);
      expect(await CredentialService.hasAPIKey('anthropic')).toBe(false);
      expect(await CredentialService.hasAPIKey('gemini')).toBe(false);
    });

    it('should call deleteAPIKey for each service', async () => {
      const deleteSpy = jest.spyOn(CredentialService, 'deleteAPIKey');

      await CredentialService.deleteAllAPIKeys();

      expect(deleteSpy).toHaveBeenCalledWith('openai');
      expect(deleteSpy).toHaveBeenCalledWith('anthropic');
      expect(deleteSpy).toHaveBeenCalledWith('gemini');
      expect(deleteSpy).toHaveBeenCalledTimes(3);

      deleteSpy.mockRestore();
    });

    it('should handle when no keys are stored', async () => {
      await expect(CredentialService.deleteAllAPIKeys()).resolves.not.toThrow();
    });

    it('should complete even if some deletions fail', async () => {
      await CredentialService.storeAPIKey('openai', 'key1');

      // Mock one deletion to fail
      mockKeychain.resetGenericPassword
        .mockResolvedValueOnce(false) // First call fails
        .mockResolvedValueOnce(true) // Second succeeds
        .mockResolvedValueOnce(true); // Third succeeds

      await CredentialService.deleteAllAPIKeys();

      expect(mockKeychain.resetGenericPassword).toHaveBeenCalledTimes(3);
    });
  });

  describe('isKeychainAvailable', () => {
    it('should return true if keychain is available', async () => {
      mockKeychain.getSupportedBiometryType.mockResolvedValueOnce('FaceID' as any);

      const available = await CredentialService.isKeychainAvailable();

      expect(available).toBe(true);
    });

    it('should return false if keychain is not available', async () => {
      mockKeychain.getSupportedBiometryType.mockRejectedValueOnce(new Error('Not available'));

      const available = await CredentialService.isKeychainAvailable();

      expect(available).toBe(false);
    });

    it('should call getSupportedBiometryType for availability check', async () => {
      await CredentialService.isKeychainAvailable();

      expect(mockKeychain.getSupportedBiometryType).toHaveBeenCalled();
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete lifecycle of API key', async () => {
      const apiKey = 'sk-proj-test123456';

      // Store
      await CredentialService.storeAPIKey('openai', apiKey);
      expect(await CredentialService.hasAPIKey('openai')).toBe(true);

      // Retrieve
      const retrieved = await CredentialService.getAPIKey('openai');
      expect(retrieved).toBe(apiKey);

      // Mask
      const masked = CredentialService.maskAPIKey(apiKey);
      expect(masked).not.toBe(apiKey);
      expect(masked).toContain(apiKey.slice(-4));

      // Delete
      const deleted = await CredentialService.deleteAPIKey('openai');
      expect(deleted).toBe(true);
      expect(await CredentialService.hasAPIKey('openai')).toBe(false);
    });

    it('should maintain separate storage for each service', async () => {
      await CredentialService.storeAPIKey('openai', 'openai-key');
      await CredentialService.storeAPIKey('anthropic', 'anthropic-key');
      await CredentialService.storeAPIKey('gemini', 'gemini-key');

      expect(await CredentialService.getAPIKey('openai')).toBe('openai-key');
      expect(await CredentialService.getAPIKey('anthropic')).toBe('anthropic-key');
      expect(await CredentialService.getAPIKey('gemini')).toBe('gemini-key');

      // Delete one should not affect others
      await CredentialService.deleteAPIKey('openai');

      expect(await CredentialService.hasAPIKey('openai')).toBe(false);
      expect(await CredentialService.hasAPIKey('anthropic')).toBe(true);
      expect(await CredentialService.hasAPIKey('gemini')).toBe(true);
    });

    it('should handle updating API key multiple times', async () => {
      await CredentialService.storeAPIKey('openai', 'key-v1');
      expect(await CredentialService.getAPIKey('openai')).toBe('key-v1');

      await CredentialService.storeAPIKey('openai', 'key-v2');
      expect(await CredentialService.getAPIKey('openai')).toBe('key-v2');

      await CredentialService.storeAPIKey('openai', 'key-v3');
      expect(await CredentialService.getAPIKey('openai')).toBe('key-v3');
    });
  });
});
