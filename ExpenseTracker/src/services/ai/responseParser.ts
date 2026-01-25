/**
 * Response Parser
 * Parse and validate AI service responses for receipt data
 */

import { ReceiptProcessingResult } from '../../types/aiService';
import { getCategoryIdFromName, mapTaxType } from './receiptPrompt';

export interface ParsedReceiptData {
  merchant?: string;
  amount?: number;
  tax_amount?: number;
  tax_type?: string;
  tax_rate?: number;
  date?: string;
  time?: string;
  category?: string;
  confidence?: number;
  currency?: string;
  notes?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Extract JSON from AI response
 * Handles various response formats (plain JSON, markdown code blocks, mixed content)
 */
export function extractJSON(rawResponse: string): ParsedReceiptData | null {
  try {
    let cleanedResponse = rawResponse.trim();

    // Remove markdown code blocks
    cleanedResponse = cleanedResponse.replace(/```json\s*/gi, '');
    cleanedResponse = cleanedResponse.replace(/```\s*/g, '');

    // Try to find JSON object
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON object found in response');
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error('JSON extraction error:', error);
    return null;
  }
}

/**
 * Validate extracted receipt data
 */
export function validateReceiptData(data: ParsedReceiptData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate merchant
  if (!data.merchant || data.merchant.trim().length === 0) {
    errors.push('Merchant name is required');
  } else if (data.merchant.length > 100) {
    warnings.push('Merchant name is unusually long');
  }

  // Validate amount
  if (data.amount === undefined || data.amount === null) {
    errors.push('Amount is required');
  } else if (typeof data.amount !== 'number' || data.amount <= 0) {
    errors.push('Amount must be a positive number');
  } else if (data.amount > 100000) {
    warnings.push('Amount is unusually high');
  }

  // Validate tax amount
  if (data.tax_amount !== undefined && data.tax_amount !== null) {
    if (typeof data.tax_amount !== 'number' || data.tax_amount < 0) {
      errors.push('Tax amount must be a non-negative number');
    } else if (data.amount && data.tax_amount > data.amount) {
      errors.push('Tax amount cannot exceed total amount');
    }
  }

  // Validate tax rate
  if (data.tax_rate !== undefined && data.tax_rate !== null) {
    if (typeof data.tax_rate !== 'number' || data.tax_rate < 0 || data.tax_rate > 100) {
      errors.push('Tax rate must be between 0 and 100');
    }
  }

  // Validate date (optional)
  if (data.date) {
    if (!isValidDate(data.date)) {
      errors.push('Invalid date format. Expected YYYY-MM-DD');
    } else if (isFutureDate(data.date)) {
      errors.push('Date cannot be more than 1 day in the future');
    }
  }

  // Validate time (if present)
  if (data.time && !isValidTime(data.time)) {
    warnings.push('Time format may be invalid. Expected HH:MM:SS');
  }

  // Validate category
  if (data.category) {
    const validCategories = ['meal', 'transport', 'accommodation', 'office', 'other'];
    if (!validCategories.includes(data.category.toLowerCase())) {
      warnings.push('Unknown category, will default to "other"');
    }
  }

  // Validate confidence
  if (data.confidence !== undefined && data.confidence !== null) {
    if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 1) {
      warnings.push('Confidence score should be between 0.0 and 1.0');
    } else if (data.confidence < 0.5) {
      warnings.push('Low confidence score - data may need manual review');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Parse and validate complete AI response
 */
export function parseAndValidateResponse(
  rawResponse: string,
  processingTime: number,
): ReceiptProcessingResult {
  // Extract JSON from response
  const extracted = extractJSON(rawResponse);

  if (!extracted) {
    throw new Error('Failed to extract receipt data from AI response');
  }

  // Validate the data
  const validation = validateReceiptData(extracted);

  if (!validation.isValid) {
    throw new Error(`Invalid receipt data: ${validation.errors.join(', ')}`);
  }

  // Log warnings
  if (validation.warnings.length > 0) {
    console.warn('Receipt data warnings:', validation.warnings);
  }

  // Sanitize and normalize data
  const sanitized = sanitizeReceiptData(extracted);

  // Convert to ReceiptProcessingResult format
  return {
    merchant: sanitized.merchant,
    amount: sanitized.amount,
    tax_amount: sanitized.tax_amount,
    tax_type: sanitized.tax_type ? mapTaxType(sanitized.tax_type) : undefined,
    tax_rate: sanitized.tax_rate,
    date: sanitized.date,
    time: sanitized.time,
    category: sanitized.category ? getCategoryIdFromName(sanitized.category) : 8,
    notes: sanitized.notes,
    confidence: sanitized.confidence || 0.5,
    processingTime,
  };
}

/**
 * Sanitize and normalize receipt data
 */
function sanitizeReceiptData(data: ParsedReceiptData): ParsedReceiptData {
  const sanitized: ParsedReceiptData = {};

  // Sanitize merchant name
  if (data.merchant) {
    sanitized.merchant = data.merchant
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .substring(0, 100); // Limit length
  }

  // Sanitize numeric values
  if (data.amount !== undefined) {
    sanitized.amount = Number((data.amount || 0).toFixed(2));
  }

  if (data.tax_amount !== undefined) {
    sanitized.tax_amount = Number((data.tax_amount || 0).toFixed(2));
  }

  if (data.tax_rate !== undefined) {
    sanitized.tax_rate = Number((data.tax_rate || 0).toFixed(2));
  }

  // Sanitize tax type
  if (data.tax_type) {
    sanitized.tax_type = data.tax_type.trim().toUpperCase();
  }

  // Sanitize date (ensure YYYY-MM-DD format, default to current date if missing)
  if (data.date) {
    sanitized.date = normalizeDate(data.date);
  } else {
    // Default to current date if not provided
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    sanitized.date = `${year}-${month}-${day}`;
  }

  // Sanitize time
  if (data.time) {
    sanitized.time = normalizeTime(data.time);
  }

  // Sanitize category
  if (data.category) {
    sanitized.category = data.category.toLowerCase().trim();
  }

  // Sanitize confidence
  if (data.confidence !== undefined) {
    sanitized.confidence = Math.max(0, Math.min(1, data.confidence));
  }

  // Sanitize currency
  if (data.currency) {
    sanitized.currency = data.currency.toUpperCase().trim();
  }

  // Sanitize notes
  if (data.notes) {
    sanitized.notes = data.notes.trim().substring(0, 500);
  }

  return sanitized;
}

/**
 * Validate date format
 */
function isValidDate(dateStr: string): boolean {
  // Check YYYY-MM-DD format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    return false;
  }

  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Check if date is in the future (allowing +1 day for timezone differences)
 */
function isFutureDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Allow dates up to 1 day in the future to account for timezone differences
  const maxAllowedDate = new Date(today);
  maxAllowedDate.setDate(maxAllowedDate.getDate() + 1);

  return date > maxAllowedDate;
}

/**
 * Validate time format
 */
function isValidTime(timeStr: string): boolean {
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
  return timeRegex.test(timeStr);
}

/**
 * Normalize date to YYYY-MM-DD format
 */
function normalizeDate(dateStr: string): string {
  // Try to parse various date formats
  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    return dateStr; // Return original if can't parse
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Normalize time to HH:MM:SS format
 */
function normalizeTime(timeStr: string): string {
  // If already in correct format, return as is
  if (isValidTime(timeStr)) {
    return timeStr;
  }

  // Try to parse and format
  const timeParts = timeStr.split(':');
  if (timeParts.length >= 2) {
    const hours = String(parseInt(timeParts[0]) || 0).padStart(2, '0');
    const minutes = String(parseInt(timeParts[1]) || 0).padStart(2, '0');
    const seconds = timeParts[2] ? String(parseInt(timeParts[2]) || 0).padStart(2, '0') : '00';

    return `${hours}:${minutes}:${seconds}`;
  }

  return timeStr; // Return original if can't parse
}
