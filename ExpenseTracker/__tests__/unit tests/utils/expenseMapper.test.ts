/**
 * Tests for Expense Mapper
 * Validates conversion of queue items to expense models
 */

import {
  mapQueueItemToExpense,
  hasExtractionResult,
  getConfidenceLevel,
} from '../../../src/utils/expenseMapper';
import { QueueItem } from '../../../src/services/queue/processingQueue';
import { ReceiptProcessingResult } from '../../../src/types/aiService';
import { TaxType } from '../../../src/types/database';

// Helper to create mock QueueItem
function createMockQueueItem(overrides: Partial<QueueItem> = {}): QueueItem {
  return {
    id: 'test-queue-item-1',
    imageUri: '/path/to/receipt.jpg',
    serviceId: 'openai',
    status: 'completed',
    priority: 'normal',
    createdAt: new Date('2024-03-15T10:00:00Z'),
    processedAt: new Date('2024-03-15T10:00:05Z'),
    retryCount: 0,
    maxRetries: 3,
    ...overrides,
  };
}

// Helper to create mock ReceiptProcessingResult
function createMockResult(overrides: Partial<ReceiptProcessingResult> = {}): ReceiptProcessingResult {
  return {
    merchant: 'Test Store',
    amount: 50.00,
    date: '2024-03-15',
    category: 5,
    confidence: 0.95,
    processingTime: 1500,
    ...overrides,
  };
}

describe('Expense Mapper', () => {
  describe('mapQueueItemToExpense', () => {
    describe('with AI service result', () => {
      it('should map complete queue item with all fields', () => {
        const queueItem = createMockQueueItem({
          result: createMockResult({
            merchant: 'Starbucks',
            amount: 12.75,
            tax_amount: 1.02,
            tax_type: 'GST',
            tax_rate: 8.0,
            date: '2024-03-15',
            time: '14:30:00',
            category: 5,
            notes: 'Business meeting',
            confidence: 0.95,
          }),
          serviceId: 'openai',
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.merchant).toBe('Starbucks');
        expect(expense.amount).toBe(12.75);
        expect(expense.tax_amount).toBe(1.02);
        expect(expense.tax_type).toBe(TaxType.GST);
        expect(expense.tax_rate).toBe(8.0);
        expect(expense.date).toBe('2024-03-15');
        expect(expense.time).toBe('14:30:00');
        expect(expense.category).toBe(5);
        expect(expense.notes).toBe('Business meeting');
        expect(expense.image_path).toBe(queueItem.imageUri);
        expect(expense.processed).toBe(true);
        expect(expense.ai_service_used).toBe('openai');
        expect(expense.capture_method).toBe('ai_service');
        expect(expense.verification_status).toBe('pending');
      });

      it('should map minimal result with required fields only', () => {
        const queueItem = createMockQueueItem({
          result: createMockResult({
            merchant: 'Store',
            amount: 25.00,
            date: '2024-03-15',
          }),
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.merchant).toBe('Store');
        expect(expense.amount).toBe(25.00);
        expect(expense.date).toBe('2024-03-15');
        expect(expense.processed).toBe(true);
        expect(expense.verification_status).toBe('pending');
      });

      it('should use defaults for missing optional fields', () => {
        const queueItem = createMockQueueItem({
          result: {
            merchant: 'Store',
            amount: 30.00,
            date: '2024-03-15',
            confidence: 0.8,
            processingTime: 1000,
            // Missing: tax_amount, tax_type, time, category, notes
          },
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.tax_amount).toBeUndefined();
        expect(expense.tax_type).toBeUndefined();
        expect(expense.time).toBeUndefined();
        expect(expense.category).toBe(8); // Uncategorized
        expect(expense.notes).toBeUndefined();
      });

      it('should handle empty merchant gracefully', () => {
        const queueItem = createMockQueueItem({
          result: createMockResult({
            merchant: '',
            amount: 20.00,
            date: '2024-03-15',
          }),
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.merchant).toBe('');
      });

      it('should handle zero amount', () => {
        const queueItem = createMockQueueItem({
          result: createMockResult({
            merchant: 'Store',
            amount: 0,
            date: '2024-03-15',
          }),
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.amount).toBe(0);
      });

      it('should set capture_method to ai_service for AI services', () => {
        const services: Array<'openai' | 'anthropic' | 'gemini'> = ['openai', 'anthropic', 'gemini'];

        services.forEach(serviceId => {
          const queueItem = createMockQueueItem({
            result: createMockResult(),
            serviceId,
          });

          const expense = mapQueueItemToExpense(queueItem);

          expect(expense.capture_method).toBe('ai_service');
          expect(expense.ai_service_used).toBe(serviceId);
        });
      });

      it('should set capture_method to offline_ocr for ML Kit', () => {
        const queueItem = createMockQueueItem({
          result: createMockResult(),
          serviceId: 'mlkit',
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.capture_method).toBe('offline_ocr');
        expect(expense.ai_service_used).toBe('mlkit');
      });
    });

    describe('tax type mapping', () => {
      it('should map GST correctly', () => {
        const queueItem = createMockQueueItem({
          result: createMockResult({ tax_type: 'GST' }),
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.tax_type).toBe(TaxType.GST);
      });

      it('should map HST correctly', () => {
        const queueItem = createMockQueueItem({
          result: createMockResult({ tax_type: 'HST' }),
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.tax_type).toBe(TaxType.HST);
      });

      it('should map PST correctly', () => {
        const queueItem = createMockQueueItem({
          result: createMockResult({ tax_type: 'PST' }),
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.tax_type).toBe(TaxType.PST);
      });

      it('should map VAT correctly', () => {
        const queueItem = createMockQueueItem({
          result: createMockResult({ tax_type: 'VAT' }),
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.tax_type).toBe(TaxType.VAT);
      });

      it('should map SALES TAX correctly', () => {
        const queueItem = createMockQueueItem({
          result: createMockResult({ tax_type: 'SALES TAX' }),
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.tax_type).toBe(TaxType.SALES_TAX);
      });

      it('should map SALES_TAX correctly', () => {
        const queueItem = createMockQueueItem({
          result: createMockResult({ tax_type: 'SALES_TAX' }),
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.tax_type).toBe(TaxType.SALES_TAX);
      });

      it('should map OTHER correctly', () => {
        const queueItem = createMockQueueItem({
          result: createMockResult({ tax_type: 'OTHER' }),
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.tax_type).toBe(TaxType.OTHER);
      });

      it('should map NONE correctly', () => {
        const queueItem = createMockQueueItem({
          result: createMockResult({ tax_type: 'NONE' }),
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.tax_type).toBe(TaxType.NONE);
      });

      it('should handle case-insensitive tax types', () => {
        const queueItem = createMockQueueItem({
          result: createMockResult({ tax_type: 'gst' }),
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.tax_type).toBe(TaxType.GST);
      });

      it('should default unknown tax types to OTHER', () => {
        const queueItem = createMockQueueItem({
          result: createMockResult({ tax_type: 'UNKNOWN_TAX' }),
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.tax_type).toBe(TaxType.OTHER);
      });

      it('should return undefined for missing tax type', () => {
        const queueItem = createMockQueueItem({
          result: createMockResult({
            merchant: 'Store',
            amount: 50.00,
            date: '2024-03-15',
            // No tax_type
          }),
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.tax_type).toBeUndefined();
      });
    });

    describe('without result (failed processing)', () => {
      it('should return minimal model with defaults when no result', () => {
        const queueItem = createMockQueueItem({
          result: undefined,
          status: 'failed',
          error: 'API error',
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.merchant).toBe('');
        expect(expense.amount).toBe(0);
        expect(expense.date).toMatch(/^\d{4}-\d{2}-\d{2}$/); // Today's date
        expect(expense.category).toBe(8); // Uncategorized
        expect(expense.image_path).toBe(queueItem.imageUri);
        expect(expense.processed).toBe(false);
        expect(expense.capture_method).toBe('manual');
        expect(expense.verification_status).toBe('pending');
      });

      it('should use today\'s date when no result', () => {
        const queueItem = createMockQueueItem({
          result: undefined,
        });

        const expense = mapQueueItemToExpense(queueItem);

        const today = new Date().toISOString().split('T')[0];
        expect(expense.date).toBe(today);
      });

      it('should preserve image path when no result', () => {
        const imageUri = '/custom/path/to/image.jpg';
        const queueItem = createMockQueueItem({
          result: undefined,
          imageUri,
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.image_path).toBe(imageUri);
      });
    });

    describe('edge cases', () => {
      it('should handle result with undefined merchant', () => {
        const queueItem = createMockQueueItem({
          result: {
            merchant: undefined as any,
            amount: 50.00,
            date: '2024-03-15',
            category: 5,
            confidence: 0.5,
            processingTime: 1000,
          },
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.merchant).toBe('');
      });

      it('should handle result with undefined amount', () => {
        const queueItem = createMockQueueItem({
          result: {
            merchant: 'Store',
            amount: undefined as any,
            date: '2024-03-15',
            category: 5,
            confidence: 0.5,
            processingTime: 1000,
          },
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.amount).toBe(0);
      });

      it('should handle result with undefined date', () => {
        const queueItem = createMockQueueItem({
          result: {
            merchant: 'Store',
            amount: 50.00,
            date: undefined as any,
            category: 5,
            confidence: 0.5,
            processingTime: 1000,
          },
        });

        const expense = mapQueueItemToExpense(queueItem);

        const today = new Date().toISOString().split('T')[0];
        expect(expense.date).toBe(today);
      });

      it('should handle result with undefined category', () => {
        const queueItem = createMockQueueItem({
          result: {
            merchant: 'Store',
            amount: 50.00,
            date: '2024-03-15',
            category: undefined as any,
            confidence: 0.5,
            processingTime: 1000,
          },
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.category).toBe(8); // Uncategorized
      });

      it('should handle queue item without serviceId', () => {
        const queueItem = createMockQueueItem({
          result: createMockResult(),
          serviceId: undefined as any,
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.capture_method).toBe('manual');
        expect(expense.ai_service_used).toBeUndefined();
      });

      it('should handle very long notes', () => {
        const longNotes = 'A'.repeat(1000);
        const queueItem = createMockQueueItem({
          result: createMockResult({ notes: longNotes }),
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.notes).toBe(longNotes);
      });

      it('should handle special characters in merchant name', () => {
        const queueItem = createMockQueueItem({
          result: createMockResult({ merchant: 'Joe\'s "Fancy" Café & Bar' }),
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.merchant).toBe('Joe\'s "Fancy" Café & Bar');
      });

      it('should handle very large amounts', () => {
        const queueItem = createMockQueueItem({
          result: createMockResult({ amount: 99999.99 }),
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.amount).toBe(99999.99);
      });

      it('should handle fractional amounts with many decimals', () => {
        const queueItem = createMockQueueItem({
          result: createMockResult({ amount: 12.345678 }),
        });

        const expense = mapQueueItemToExpense(queueItem);

        expect(expense.amount).toBe(12.345678);
      });
    });
  });

  describe('hasExtractionResult', () => {
    it('should return true for completed item with result', () => {
      const queueItem = createMockQueueItem({
        status: 'completed',
        result: createMockResult(),
      });

      expect(hasExtractionResult(queueItem)).toBe(true);
    });

    it('should return false for completed item without result', () => {
      const queueItem = createMockQueueItem({
        status: 'completed',
        result: undefined,
      });

      expect(hasExtractionResult(queueItem)).toBe(false);
    });

    it('should return false for pending item', () => {
      const queueItem = createMockQueueItem({
        status: 'pending',
        result: undefined,
      });

      expect(hasExtractionResult(queueItem)).toBe(false);
    });

    it('should return false for processing item', () => {
      const queueItem = createMockQueueItem({
        status: 'processing',
        result: undefined,
      });

      expect(hasExtractionResult(queueItem)).toBe(false);
    });

    it('should return false for failed item', () => {
      const queueItem = createMockQueueItem({
        status: 'failed',
        result: undefined,
        error: 'Processing failed',
      });

      expect(hasExtractionResult(queueItem)).toBe(false);
    });

    it('should return false for failed item even with result', () => {
      const queueItem = createMockQueueItem({
        status: 'failed',
        result: createMockResult(),
        error: 'Processing failed',
      });

      expect(hasExtractionResult(queueItem)).toBe(false);
    });
  });

  describe('getConfidenceLevel', () => {
    it('should return high for confidence >= 0.8', () => {
      expect(getConfidenceLevel(0.8)).toBe('high');
      expect(getConfidenceLevel(0.9)).toBe('high');
      expect(getConfidenceLevel(0.95)).toBe('high');
      expect(getConfidenceLevel(1.0)).toBe('high');
    });

    it('should return medium for confidence 0.6-0.79', () => {
      expect(getConfidenceLevel(0.6)).toBe('medium');
      expect(getConfidenceLevel(0.7)).toBe('medium');
      expect(getConfidenceLevel(0.79)).toBe('medium');
    });

    it('should return low for confidence 0.4-0.59', () => {
      expect(getConfidenceLevel(0.4)).toBe('low');
      expect(getConfidenceLevel(0.5)).toBe('low');
      expect(getConfidenceLevel(0.59)).toBe('low');
    });

    it('should return very-low for confidence < 0.4', () => {
      expect(getConfidenceLevel(0)).toBe('very-low');
      expect(getConfidenceLevel(0.1)).toBe('very-low');
      expect(getConfidenceLevel(0.3)).toBe('very-low');
      expect(getConfidenceLevel(0.39)).toBe('very-low');
    });

    it('should handle boundary values correctly', () => {
      expect(getConfidenceLevel(0.8)).toBe('high');
      expect(getConfidenceLevel(0.799)).toBe('medium');
      expect(getConfidenceLevel(0.6)).toBe('medium');
      expect(getConfidenceLevel(0.599)).toBe('low');
      expect(getConfidenceLevel(0.4)).toBe('low');
      expect(getConfidenceLevel(0.399)).toBe('very-low');
    });

    it('should handle extreme values', () => {
      expect(getConfidenceLevel(0)).toBe('very-low');
      expect(getConfidenceLevel(1.0)).toBe('high');
      // Values outside 0-1 range (though shouldn't happen in practice)
      expect(getConfidenceLevel(-0.5)).toBe('very-low');
      expect(getConfidenceLevel(1.5)).toBe('high');
    });
  });
});
