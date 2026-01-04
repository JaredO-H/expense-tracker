/**
 * Tests for AI Service Factory
 * Validates API key format validation and connection testing
 */

import {
  validateAPIKeyFormat,
  testServiceConnection,
  getServiceConfig,
  getAllServices,
} from '../../../src/services/ai/aiServiceFactory';
import { CredentialService } from '../../../src/services/security/credentialService';
import * as fixtures from '../../../src/__tests__/fixtures';

// Mock fetch globally
global.fetch = jest.fn();

// Mock CredentialService
jest.mock('../../../src/services/security/credentialService');

describe('AI Service Factory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('validateAPIKeyFormat', () => {
    describe('OpenAI', () => {
      it('should validate correct OpenAI API key format', () => {
        const result = validateAPIKeyFormat('openai', fixtures.validAPIKeys.openai);

        expect(result.success).toBe(true);
        expect(result.error).toBeUndefined();
        expect(result.errorMessage).toBeUndefined();
      });

      it('should reject OpenAI key with wrong prefix', () => {
        const result = validateAPIKeyFormat('openai', fixtures.invalidAPIKeys.openaiWrongPrefix);

        expect(result.success).toBe(false);
        expect(result.error).toBe('invalid_format');
        expect(result.errorMessage).toContain('Invalid');
        expect(result.errorMessage).toContain('OpenAI');
      });

      it('should reject OpenAI key that is too short', () => {
        const result = validateAPIKeyFormat('openai', fixtures.invalidAPIKeys.openaiTooShort);

        expect(result.success).toBe(false);
        expect(result.error).toBe('invalid_format');
      });

      it('should reject OpenAI key with invalid characters', () => {
        const result = validateAPIKeyFormat('openai', fixtures.invalidAPIKeys.openaiInvalidChars);

        expect(result.success).toBe(false);
        expect(result.error).toBe('invalid_format');
      });

      it('should reject empty OpenAI key', () => {
        const result = validateAPIKeyFormat('openai', '');

        expect(result.success).toBe(false);
        expect(result.error).toBe('invalid_format');
        expect(result.errorMessage).toBe('API key cannot be empty');
      });

      it('should reject whitespace-only OpenAI key', () => {
        const result = validateAPIKeyFormat('openai', '   ');

        expect(result.success).toBe(false);
        expect(result.error).toBe('invalid_format');
        expect(result.errorMessage).toBe('API key cannot be empty');
      });
    });

    describe('Anthropic', () => {
      it('should validate correct Anthropic API key format', () => {
        const result = validateAPIKeyFormat('anthropic', fixtures.validAPIKeys.anthropic);

        expect(result.success).toBe(true);
      });

      it('should reject Anthropic key with wrong prefix', () => {
        const result = validateAPIKeyFormat(
          'anthropic',
          fixtures.invalidAPIKeys.anthropicWrongPrefix,
        );

        expect(result.success).toBe(false);
        expect(result.error).toBe('invalid_format');
        expect(result.errorMessage).toContain('Anthropic');
      });

      it('should reject Anthropic key that is too short', () => {
        const result = validateAPIKeyFormat('anthropic', fixtures.invalidAPIKeys.anthropicTooShort);

        expect(result.success).toBe(false);
        expect(result.error).toBe('invalid_format');
      });

      it('should reject Anthropic key with invalid characters', () => {
        const result = validateAPIKeyFormat(
          'anthropic',
          fixtures.invalidAPIKeys.anthropicInvalidChars,
        );

        expect(result.success).toBe(false);
        expect(result.error).toBe('invalid_format');
      });

      it('should reject empty Anthropic key', () => {
        const result = validateAPIKeyFormat('anthropic', '');

        expect(result.success).toBe(false);
        expect(result.error).toBe('invalid_format');
      });
    });

    describe('Gemini', () => {
      it('should validate correct Gemini API key format', () => {
        const result = validateAPIKeyFormat('gemini', fixtures.validAPIKeys.gemini);

        expect(result.success).toBe(true);
      });

      it('should reject Gemini key with wrong prefix', () => {
        const result = validateAPIKeyFormat('gemini', fixtures.invalidAPIKeys.geminiWrongPrefix);

        expect(result.success).toBe(false);
        expect(result.error).toBe('invalid_format');
        expect(result.errorMessage).toContain('Gemini');
      });

      it('should reject Gemini key that is too short', () => {
        const result = validateAPIKeyFormat('gemini', fixtures.invalidAPIKeys.geminiTooShort);

        expect(result.success).toBe(false);
        expect(result.error).toBe('invalid_format');
      });

      it('should reject Gemini key with invalid characters', () => {
        const result = validateAPIKeyFormat('gemini', fixtures.invalidAPIKeys.geminiInvalidChars);

        expect(result.success).toBe(false);
        expect(result.error).toBe('invalid_format');
      });

      it('should reject empty Gemini key', () => {
        const result = validateAPIKeyFormat('gemini', '');

        expect(result.success).toBe(false);
        expect(result.error).toBe('invalid_format');
      });
    });

    describe('edge cases', () => {
      it('should trim whitespace before validation', () => {
        const keyWithSpaces = `  ${fixtures.validAPIKeys.openai}  `;
        const result = validateAPIKeyFormat('openai', keyWithSpaces);

        // Should fail because spaces are part of the key
        expect(result.success).toBe(false);
      });

      it('should handle keys with spaces in middle', () => {
        const result = validateAPIKeyFormat('openai', fixtures.invalidAPIKeys.withSpaces);

        expect(result.success).toBe(false);
        expect(result.error).toBe('invalid_format');
      });

      it('should handle random strings', () => {
        const result = validateAPIKeyFormat('openai', fixtures.invalidAPIKeys.random1);

        expect(result.success).toBe(false);
        expect(result.error).toBe('invalid_format');
      });
    });
  });

  describe('testServiceConnection', () => {
    describe('OpenAI', () => {
      it('should successfully test valid OpenAI API key', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
        });

        const result = await testServiceConnection('openai', fixtures.validAPIKeys.openai);

        expect(result.success).toBe(true);
        expect(global.fetch).toHaveBeenCalledWith(
          'https://api.openai.com/v1/models',
          expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
              Authorization: `Bearer ${fixtures.validAPIKeys.openai}`,
            }),
          }),
        );
      });

      it('should detect invalid OpenAI API key (401)', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
        });

        const result = await testServiceConnection('openai', fixtures.validAPIKeys.openai);

        expect(result.success).toBe(false);
        expect(result.error).toBe('invalid_key');
        expect(result.errorMessage).toContain('Invalid API key');
      });

      it('should detect rate limit (429)', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
        });

        const result = await testServiceConnection('openai', fixtures.validAPIKeys.openai);

        expect(result.success).toBe(false);
        expect(result.error).toBe('rate_limit');
        expect(result.errorMessage).toContain('Rate limit');
      });

      it('should handle service unavailable', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
        });

        const result = await testServiceConnection('openai', fixtures.validAPIKeys.openai);

        expect(result.success).toBe(false);
        expect(result.error).toBe('service_unavailable');
      });

      it('should handle network errors', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const result = await testServiceConnection('openai', fixtures.validAPIKeys.openai);

        expect(result.success).toBe(false);
        expect(result.error).toBe('network_error');
      });

      it('should validate format before testing connection', async () => {
        const result = await testServiceConnection('openai', 'invalid-key');

        expect(result.success).toBe(false);
        expect(result.error).toBe('invalid_format');
        expect(global.fetch).not.toHaveBeenCalled();
      });

      it('should retrieve API key from storage if not provided', async () => {
        (CredentialService.getAPIKey as jest.Mock).mockResolvedValueOnce(
          fixtures.validAPIKeys.openai,
        );
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
        });

        const result = await testServiceConnection('openai');

        expect(CredentialService.getAPIKey).toHaveBeenCalledWith('openai');
        expect(result.success).toBe(true);
      });

      it('should fail if no API key in storage', async () => {
        (CredentialService.getAPIKey as jest.Mock).mockResolvedValueOnce(null);

        const result = await testServiceConnection('openai');

        expect(result.success).toBe(false);
        expect(result.error).toBe('invalid_key');
        expect(result.errorMessage).toContain('No API key configured');
      });
    });

    describe('Anthropic', () => {
      it('should successfully test valid Anthropic API key', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
        });

        const result = await testServiceConnection('anthropic', fixtures.validAPIKeys.anthropic);

        expect(result.success).toBe(true);
        expect(global.fetch).toHaveBeenCalledWith(
          'https://api.anthropic.com/v1/messages',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'x-api-key': fixtures.validAPIKeys.anthropic,
              'anthropic-version': '2023-06-01',
            }),
          }),
        );
      });

      it('should detect invalid Anthropic API key (401)', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 401,
        });

        const result = await testServiceConnection('anthropic', fixtures.validAPIKeys.anthropic);

        expect(result.success).toBe(false);
        expect(result.error).toBe('invalid_key');
        expect(result.errorMessage).toContain('Anthropic');
      });

      it('should handle 400 errors as success (validation request)', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
        });

        const result = await testServiceConnection('anthropic', fixtures.validAPIKeys.anthropic);

        // 400 is expected for validation request, so success
        expect(result.success).toBe(true);
      });

      it('should detect rate limit (429)', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 429,
        });

        const result = await testServiceConnection('anthropic', fixtures.validAPIKeys.anthropic);

        expect(result.success).toBe(false);
        expect(result.error).toBe('rate_limit');
      });

      it('should handle network errors', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const result = await testServiceConnection('anthropic', fixtures.validAPIKeys.anthropic);

        expect(result.success).toBe(false);
        expect(result.error).toBe('network_error');
      });
    });

    describe('Gemini', () => {
      it('should successfully test valid Gemini API key', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
        });

        const result = await testServiceConnection('gemini', fixtures.validAPIKeys.gemini);

        expect(result.success).toBe(true);
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('generativelanguage.googleapis.com'),
          expect.objectContaining({
            method: 'GET',
          }),
        );
      });

      it('should detect invalid Gemini API key (400)', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 400,
        });

        const result = await testServiceConnection('gemini', fixtures.validAPIKeys.gemini);

        expect(result.success).toBe(false);
        expect(result.error).toBe('invalid_key');
      });

      it('should detect invalid Gemini API key (403)', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 403,
        });

        const result = await testServiceConnection('gemini', fixtures.validAPIKeys.gemini);

        expect(result.success).toBe(false);
        expect(result.error).toBe('invalid_key');
        expect(result.errorMessage).toContain('Google');
      });

      it('should detect rate limit (429)', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 429,
        });

        const result = await testServiceConnection('gemini', fixtures.validAPIKeys.gemini);

        expect(result.success).toBe(false);
        expect(result.error).toBe('rate_limit');
      });

      it('should handle network errors', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const result = await testServiceConnection('gemini', fixtures.validAPIKeys.gemini);

        expect(result.success).toBe(false);
        expect(result.error).toBe('network_error');
      });

      it('should include API key in URL for Gemini', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
        });

        await testServiceConnection('gemini', fixtures.validAPIKeys.gemini);

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining(`key=${fixtures.validAPIKeys.gemini}`),
          expect.any(Object),
        );
      });
    });

    describe('error handling', () => {
      it('should handle fetch errors gracefully', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Fetch failed'));

        const result = await testServiceConnection('openai', fixtures.validAPIKeys.openai);

        expect(result.success).toBe(false);
        expect(result.error).toBe('network_error');
      });

      it('should handle timeout errors', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Request timeout'));

        const result = await testServiceConnection('anthropic', fixtures.validAPIKeys.anthropic);

        expect(result.success).toBe(false);
        expect(result.error).toBe('network_error');
      });

      it('should validate format even when key from storage', async () => {
        (CredentialService.getAPIKey as jest.Mock).mockResolvedValueOnce('invalid-format');

        const result = await testServiceConnection('openai');

        expect(result.success).toBe(false);
        expect(result.error).toBe('invalid_format');
        expect(global.fetch).not.toHaveBeenCalled();
      });
    });
  });

  describe('getServiceConfig', () => {
    it('should return OpenAI configuration', () => {
      const config = getServiceConfig('openai');

      expect(config).toBeDefined();
      expect(config.id).toBe('openai');
      expect(config.name).toContain('OpenAI');
      expect(config.apiKeyFormat).toBeDefined();
      expect(config.apiKeyPlaceholder).toBe('sk-...');
    });

    it('should return Anthropic configuration', () => {
      const config = getServiceConfig('anthropic');

      expect(config).toBeDefined();
      expect(config.id).toBe('anthropic');
      expect(config.name).toContain('Anthropic');
      expect(config.apiKeyPlaceholder).toBe('sk-ant-...');
    });

    it('should return Gemini configuration', () => {
      const config = getServiceConfig('gemini');

      expect(config).toBeDefined();
      expect(config.id).toBe('gemini');
      expect(config.name).toContain('Gemini');
      expect(config.apiKeyPlaceholder).toBe('AIza...');
    });

    it('should return ML Kit configuration', () => {
      const config = getServiceConfig('mlkit');

      expect(config).toBeDefined();
      expect(config.id).toBe('mlkit');
      expect(config.name).toContain('Offline');
    });

    it('should include documentation URLs', () => {
      const openaiConfig = getServiceConfig('openai');
      const anthropicConfig = getServiceConfig('anthropic');
      const geminiConfig = getServiceConfig('gemini');

      expect(openaiConfig.documentationUrl).toBeTruthy();
      expect(anthropicConfig.documentationUrl).toBeTruthy();
      expect(geminiConfig.documentationUrl).toBeTruthy();
    });

    it('should include setup instructions', () => {
      const config = getServiceConfig('openai');

      expect(config.setupInstructions).toBeTruthy();
      expect(config.setupInstructions).toContain('platform.openai.com');
    });
  });

  describe('getAllServices', () => {
    it('should return all AI services excluding mlkit', () => {
      const services = getAllServices();

      expect(services).toHaveLength(3);
      expect(services.map(s => s.id)).toEqual(['openai', 'anthropic', 'gemini']);
    });

    it('should not include mlkit in services list', () => {
      const services = getAllServices();

      expect(services.find(s => s.id === 'mlkit')).toBeUndefined();
    });

    it('should return valid service configurations', () => {
      const services = getAllServices();

      services.forEach(service => {
        expect(service.id).toBeDefined();
        expect(service.name).toBeDefined();
        expect(service.apiKeyFormat).toBeDefined();
        expect(service.testEndpoint).toBeDefined();
      });
    });
  });
});
