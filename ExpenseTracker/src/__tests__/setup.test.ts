/**
 * Test to verify the test setup is working correctly
 */

import { createMockExpense, createMockTrip, createMockOCRText } from './utils/mockFactories';
import {
  expectValidAmountCents,
  expectValidISODate,
  expectValidConfidenceScore,
} from './utils/assertions';
import * as fixtures from './fixtures';

describe('Test Setup Verification', () => {
  describe('Mock Factories', () => {
    it('should create a valid mock expense', () => {
      const expense = createMockExpense();

      expect(expense).toBeDefined();
      expect(expense.id).toBeGreaterThan(0);
      expect(expense.merchant_name).toBe('Test Merchant');
      expect(expense.amount_cents).toBe(5000);
      expectValidAmountCents(expense.amount_cents);
      expectValidISODate(expense.transaction_date);
    });

    it('should create a mock expense with overrides', () => {
      const expense = createMockExpense({
        merchant_name: 'Custom Merchant',
        amount_cents: 10000,
      });

      expect(expense.merchant_name).toBe('Custom Merchant');
      expect(expense.amount_cents).toBe(10000);
    });

    it('should create a valid mock trip', () => {
      const trip = createMockTrip();

      expect(trip).toBeDefined();
      expect(trip.id).toBeGreaterThan(0);
      expect(trip.trip_name).toBe('Test Trip');
      expectValidISODate(trip.start_date);
      expectValidISODate(trip.end_date);
    });

    it('should create mock OCR text', () => {
      const ocrText = createMockOCRText();

      expect(ocrText).toBeDefined();
      expect(typeof ocrText).toBe('string');
      expect(ocrText.length).toBeGreaterThan(0);
      expect(ocrText).toContain('Test Store');
      expect(ocrText).toContain('TOTAL');
    });
  });

  describe('Custom Assertions', () => {
    it('should validate amount in cents', () => {
      expectValidAmountCents(5000);
      expectValidAmountCents(100);
      expectValidAmountCents(1);
    });

    it('should validate ISO dates', () => {
      expectValidISODate('2024-03-15');
      expectValidISODate('2023-12-31');
      expectValidISODate('2024-01-01');
    });

    it('should validate confidence scores', () => {
      expectValidConfidenceScore(0.95);
      expectValidConfidenceScore(0.5);
      expectValidConfidenceScore(0);
      expectValidConfidenceScore(1);
    });

    it('should reject invalid confidence scores', () => {
      expect(() => expectValidConfidenceScore(-0.1)).toThrow();
      expect(() => expectValidConfidenceScore(1.1)).toThrow();
    });
  });

  describe('Test Fixtures', () => {
    it('should load sample receipts', () => {
      expect(fixtures.restaurantReceipt).toBeDefined();
      expect(fixtures.retailReceipt).toBeDefined();
      expect(fixtures.gasStationReceipt).toBeDefined();
    });

    it('should load sample OCR text', () => {
      expect(fixtures.restaurantOCR).toBeDefined();
      expect(fixtures.retailOCR).toBeDefined();
      expect(typeof fixtures.restaurantOCR).toBe('string');
    });

    it('should load sample AI responses', () => {
      expect(fixtures.validMarkdownResponse).toBeDefined();
      expect(fixtures.validPlainJSONResponse).toBeDefined();
      expect(fixtures.invalidJSONResponse).toBeDefined();
    });

    it('should load sample API keys', () => {
      expect(fixtures.validAPIKeys).toBeDefined();
      expect(fixtures.validAPIKeys.openai).toBeDefined();
      expect(fixtures.validAPIKeys.anthropic).toBeDefined();
      expect(fixtures.validAPIKeys.gemini).toBeDefined();
    });
  });

  describe('Mocked Modules', () => {
    it('should have mocked react-native-keychain', () => {
      const Keychain = require('react-native-keychain');
      expect(Keychain.setGenericPassword).toBeDefined();
      expect(Keychain.getGenericPassword).toBeDefined();
    });

    it('should have mocked AsyncStorage', () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      expect(AsyncStorage.setItem).toBeDefined();
      expect(AsyncStorage.getItem).toBeDefined();
    });

    it('should have mocked SQLite', () => {
      const SQLite = require('react-native-sqlite-storage').default;
      expect(SQLite.openDatabase).toBeDefined();
    });

    it('should have mocked axios', () => {
      const axios = require('axios').default;
      expect(axios.get).toBeDefined();
      expect(axios.post).toBeDefined();
    });
  });

  describe('Jest Configuration', () => {
    it('should clear mocks after each test', () => {
      const mockFn = jest.fn();
      mockFn('test');
      expect(mockFn).toHaveBeenCalledTimes(1);
      // This will be reset by afterEach in jest.setup.js
    });

    it('should support async/await', async () => {
      const promise = Promise.resolve('test');
      const result = await promise;
      expect(result).toBe('test');
    });

    it('should support TypeScript', () => {
      const expense: { id: number; amount: number } = {
        id: 1,
        amount: 50.0,
      };
      expect(expense.id).toBe(1);
    });
  });
});
