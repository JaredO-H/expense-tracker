/**
 * AI Service Client
 * Unified client for processing receipts with different AI services
 */

import { AIServiceId, ReceiptProcessingResult } from '../../types/aiService';
import { CredentialService } from '../security/credentialService';
import { RECEIPT_PROCESSING_PROMPT } from './receiptPrompt';
import { parseAndValidateResponse } from './responseParser';

export interface AIProcessingOptions {
  maxTokens?: number;
  temperature?: number;
}

const DEFAULT_OPTIONS: Required<AIProcessingOptions> = {
  maxTokens: 1000,
  temperature: 0.1, // Low temperature for consistent, factual extraction
};

/**
 * Process receipt image with AI service
 */
export async function processReceiptWithAI(
  serviceId: AIServiceId,
  imageBase64: string,
  options: AIProcessingOptions = {}
): Promise<ReceiptProcessingResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Get API key from secure storage
  const apiKey = await CredentialService.getAPIKey(serviceId);
  if (!apiKey) {
    throw new Error(`No API key configured for ${serviceId}`);
  }

  const startTime = Date.now();

  try {
    let rawResponse: string;

    switch (serviceId) {
      case 'openai':
        rawResponse = await processWithOpenAI(apiKey, imageBase64, opts);
        break;
      case 'anthropic':
        rawResponse = await processWithAnthropic(apiKey, imageBase64, opts);
        break;
      case 'gemini':
        rawResponse = await processWithGemini(apiKey, imageBase64, opts);
        break;
      default:
        throw new Error(`Unknown service: ${serviceId}`);
    }

    const processingTime = Date.now() - startTime;

    // Parse and validate the response
    const result = parseAndValidateResponse(rawResponse, processingTime);

    return result;
  } catch (error) {
    console.error(`AI processing error with ${serviceId}:`, error);
    throw error;
  }
}

/**
 * Process receipt with OpenAI
 */
async function processWithOpenAI(
  apiKey: string,
  imageBase64: string,
  options: Required<AIProcessingOptions>
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: RECEIPT_PROCESSING_PROMPT,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: options.maxTokens,
      temperature: options.temperature,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response format from OpenAI');
  }

  return data.choices[0].message.content;
}

/**
 * Process receipt with Anthropic
 */
async function processWithAnthropic(
  apiKey: string,
  imageBase64: string,
  options: Required<AIProcessingOptions>
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: options.maxTokens,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: RECEIPT_PROCESSING_PROMPT,
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageBase64,
              },
            },
          ],
        },
      ],
      temperature: options.temperature,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (!data.content || !data.content[0] || !data.content[0].text) {
    throw new Error('Invalid response format from Anthropic');
  }

  return data.content[0].text;
}

/**
 * Process receipt with Google Gemini
 */
async function processWithGemini(
  apiKey: string,
  imageBase64: string,
  options: Required<AIProcessingOptions>
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: RECEIPT_PROCESSING_PROMPT,
              },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: options.temperature,
          maxOutputTokens: options.maxTokens,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response format from Gemini');
  }

  const content = data.candidates[0].content;
  if (!content.parts || !content.parts[0] || !content.parts[0].text) {
    throw new Error('Invalid content format from Gemini');
  }

  return content.parts[0].text;
}

