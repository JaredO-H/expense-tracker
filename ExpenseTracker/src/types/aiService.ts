/**
 * AI Service Types and Interfaces
 * Configuration and types for AI-powered receipt processing services
 */

import { AIServiceId } from '../services/security/credentialService';

export type { AIServiceId };


 //AI Service Configuration

export interface AIServiceConfig {
  id: AIServiceId;
  name: string;
  description: string;
  apiKeyFormat: RegExp;
  apiKeyPlaceholder: string;
  testEndpoint: string;
  setupInstructions: string;
  documentationUrl: string;
}


 //AI Service Status

export type AIServiceStatus =
  | 'not_configured'  // No API key set
  | 'configured'      // API key set but not tested
  | 'testing'         // Currently testing connection
  | 'connected'       // Successfully tested and working
  | 'error';          // Connection test failed


 //Service Configuration State

export interface ServiceConfigState {
  serviceId: AIServiceId;
  status: AIServiceStatus;
  hasAPIKey: boolean;
  lastTested?: Date;
  errorMessage?: string;
}


//Receipt Processing Result

export interface ReceiptProcessingResult {
  merchant?: string;
  amount?: number;
  tax_amount?: number;
  tax_type?: string;
  tax_rate?: number;
  date?: string;
  time?: string;
  category?: number;
  notes?: string;
  confidence: number;
  processingTime: number;
}


 //AI Service Client Interface

export interface AIServiceClient {
  serviceId: AIServiceId;


 //Process receipt image and extract data

  processReceipt(imageBase64: string): Promise<ReceiptProcessingResult>;


   //Test API connection and credentials

  testConnection(): Promise<boolean>;


 //Get current usage information (if available)

  getUsageInfo?(): Promise<UsageInfo>;
}


  //Usage Information

export interface UsageInfo {
  requestsThisMonth: number;
  estimatedCost: number;
  lastReset: Date;
}


 //AI Service Constants and Configuration

export const AI_SERVICE_CONFIGS: Record<AIServiceId, AIServiceConfig> = {
  openai: {
    id: 'openai',
    name: 'OpenAI GPT-4 Vision',
    description: 'Advanced AI model with excellent accuracy for complex receipts and handwriting recognition.',
    apiKeyFormat: /^sk-[A-Za-z0-9-_]{48,}$/,
    apiKeyPlaceholder: 'sk-...',
    testEndpoint: 'https://api.openai.com/v1/chat/completions',
    setupInstructions: 'Obtain your API key from platform.openai.com/api-keys',
    documentationUrl: 'https://platform.openai.com/docs/guides/vision',
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic Claude 3 Sonnet',
    description: 'Fast and reliable AI model optimized for structured data extraction with great value.',
    apiKeyFormat: /^sk-ant-[A-Za-z0-9-_]{95,}$/,
    apiKeyPlaceholder: 'sk-ant-...',
    testEndpoint: 'https://api.anthropic.com/v1/messages',
    setupInstructions: 'Get your API key from console.anthropic.com',
    documentationUrl: 'https://docs.anthropic.com/claude/docs/vision',
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini Pro Vision',
    description: 'Google\'s advanced multimodal AI with strong performance on varied receipt formats.',
    apiKeyFormat: /^AIza[A-Za-z0-9_-]{35}$/,
    apiKeyPlaceholder: 'AIza...',
    testEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent',
    setupInstructions: 'Create API key in Google Cloud Console AI Platform section',
    documentationUrl: 'https://ai.google.dev/tutorials/python_quickstart',
  },
};


 //Default AI service for new users

export const DEFAULT_AI_SERVICE: AIServiceId = 'anthropic';


 //Validation error types

export type ValidationError =
  | 'invalid_format'
  | 'invalid_key'
  | 'network_error'
  | 'rate_limit'
  | 'service_unavailable'
  | 'unknown_error';


 //Validation result

export interface ValidationResult {
  success: boolean;
  error?: ValidationError;
  errorMessage?: string;
}
