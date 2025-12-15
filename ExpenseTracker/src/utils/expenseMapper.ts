/**
 * Expense Mapper Utility
 * Converts AI processing queue items to expense models
 */

import { QueueItem } from '../services/queue/processingQueue';
import { CreateExpenseModel, TaxType } from '../types/database';

/**
 * Map a completed queue item to an expense model for creation
 * Pre-populates all available data from AI extraction result
 */
export function mapQueueItemToExpense(queueItem: QueueItem): Partial<CreateExpenseModel> {
  const result = queueItem.result;

  if (!result) {
    // If no result, return minimal model with defaults
    return {
      merchant: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      category: 8, // Uncategorized
      image_path: queueItem.imageUri,
      processed: false,
      capture_method: 'manual',
      verification_status: 'pending',
    };
  }

  // Map tax type string to TaxType enum
  const mapTaxType = (taxType?: string): TaxType | undefined => {
    if (!taxType) return undefined;

    const normalized = taxType.toUpperCase();
    switch (normalized) {
      case 'GST':
        return TaxType.GST;
      case 'HST':
        return TaxType.HST;
      case 'PST':
        return TaxType.PST;
      case 'VAT':
        return TaxType.VAT;
      case 'SALES_TAX':
      case 'SALES TAX':
        return TaxType.SALES_TAX;
      case 'OTHER':
        return TaxType.OTHER;
      case 'NONE':
        return TaxType.NONE;
      default:
        return TaxType.OTHER;
    }
  };

  // Determine capture method based on service ID
  let capture_method: 'ai_service' | 'offline_ocr' | 'manual';
  if (queueItem.serviceId === 'mlkit') {
    capture_method = 'offline_ocr';
  } else if (queueItem.serviceId) {
    capture_method = 'ai_service';
  } else {
    capture_method = 'manual'; // Fallback when no service was used
  }

  // Build expense model from processing result
  return {
    merchant: result.merchant || '',
    amount: result.amount || 0,
    tax_amount: result.tax_amount,
    tax_type: mapTaxType(result.tax_type),
    tax_rate: result.tax_rate,
    date: result.date || new Date().toISOString().split('T')[0],
    time: result.time,
    category: result.category || 8, // Default to Uncategorized
    notes: result.notes,
    image_path: queueItem.imageUri,
    processed: true,
    ai_service_used: queueItem.serviceId || undefined, // undefined for manual entry
    capture_method,
    verification_status: 'pending', // User will verify before saving
  };
}

/**
 * Check if a queue item has extraction result data
 */
export function hasExtractionResult(queueItem: QueueItem): boolean {
  return queueItem.status === 'completed' && !!queueItem.result;
}

/**
 * Get confidence level category for UI display
 */
export function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' | 'very-low' {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.6) return 'medium';
  if (confidence >= 0.4) return 'low';
  return 'very-low';
}
