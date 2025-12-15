/**
 * AI Service Factory
 * Creates AI service clients based on configuration
 */

import {
  AIServiceId,
  AIServiceConfig,
  AI_SERVICE_CONFIGS,
  ValidationResult,
} from '../../types/aiService';
import { CredentialService } from '../security/credentialService';

/**
 * Validate API key format for a specific service
 */
export function validateAPIKeyFormat(
  serviceId: AIServiceId,
  apiKey: string
): ValidationResult {
  const config = AI_SERVICE_CONFIGS[serviceId];

  if (!apiKey || apiKey.trim().length === 0) {
    return {
      success: false,
      error: 'invalid_format',
      errorMessage: 'API key cannot be empty',
    };
  }

  if (!config.apiKeyFormat.test(apiKey)) {
    return {
      success: false,
      error: 'invalid_format',
      errorMessage: `Invalid ${config.name} API key format. Expected format: ${config.apiKeyPlaceholder}`,
    };
  }

  return { success: true };
}

/**
 * Test API connection for a service
 */
export async function testServiceConnection(
  serviceId: AIServiceId,
  apiKey?: string
): Promise<ValidationResult> {
  try {
    // Get API key from storage if not provided
    const key = apiKey || (await CredentialService.getAPIKey(serviceId));

    if (!key) {
      return {
        success: false,
        error: 'invalid_key',
        errorMessage: 'No API key configured for this service',
      };
    }

    // Validate format first
    const formatValidation = validateAPIKeyFormat(serviceId, key);
    if (!formatValidation.success) {
      return formatValidation;
    }

    // Test connection based on service type
    switch (serviceId) {
      case 'openai':
        return await testOpenAIConnection(key);
      case 'anthropic':
        return await testAnthropicConnection(key);
      case 'gemini':
        return await testGeminiConnection(key);
      default:
        return {
          success: false,
          error: 'unknown_error',
          errorMessage: 'Unknown service type',
        };
    }
  } catch (error) {
    console.error(`Failed to test ${serviceId} connection:`, error);
    return {
      success: false,
      error: 'network_error',
      errorMessage: 'Network error. Please check your internet connection.',
    };
  }
}

/**
 * Test OpenAI API connection
 */
async function testOpenAIConnection(apiKey: string): Promise<ValidationResult> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      return {
        success: false,
        error: 'invalid_key',
        errorMessage: 'Invalid API key. Please check your OpenAI API key.',
      };
    }

    if (response.status === 429) {
      return {
        success: false,
        error: 'rate_limit',
        errorMessage: 'Rate limit exceeded. Please try again later.',
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: 'service_unavailable',
        errorMessage: `OpenAI API error: ${response.statusText}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'network_error',
      errorMessage: 'Failed to connect to OpenAI. Please check your internet connection.',
    };
  }
}

/**
 * Test Anthropic API connection
 */
async function testAnthropicConnection(apiKey: string): Promise<ValidationResult> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'test',
          },
        ],
      }),
    });

    if (response.status === 401) {
      return {
        success: false,
        error: 'invalid_key',
        errorMessage: 'Invalid API key. Please check your Anthropic API key.',
      };
    }

    if (response.status === 429) {
      return {
        success: false,
        error: 'rate_limit',
        errorMessage: 'Rate limit exceeded. Please try again later.',
      };
    }

    if (!response.ok && response.status !== 400) {
      return {
        success: false,
        error: 'service_unavailable',
        errorMessage: `Anthropic API error: ${response.statusText}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'network_error',
      errorMessage: 'Failed to connect to Anthropic. Please check your internet connection.',
    };
  }
}

/**
 * Test Gemini API connection
 */
async function testGeminiConnection(apiKey: string): Promise<ValidationResult> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 400 || response.status === 403) {
      return {
        success: false,
        error: 'invalid_key',
        errorMessage: 'Invalid API key. Please check your Google API key.',
      };
    }

    if (response.status === 429) {
      return {
        success: false,
        error: 'rate_limit',
        errorMessage: 'Rate limit exceeded. Please try again later.',
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: 'service_unavailable',
        errorMessage: `Google Gemini API error: ${response.statusText}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'network_error',
      errorMessage: 'Failed to connect to Google Gemini. Please check your internet connection.',
    };
  }
}

/**
 * Get AI service configuration
 */
export function getServiceConfig(serviceId: AIServiceId): AIServiceConfig {
  return AI_SERVICE_CONFIGS[serviceId];
}

/**
 * Get all available AI services
 */
export function getAllServices(): AIServiceConfig[] {
  return Object.values(AI_SERVICE_CONFIGS).filter(config => config.id !== 'mlkit');
}
