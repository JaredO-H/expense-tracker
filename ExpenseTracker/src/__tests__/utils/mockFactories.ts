import { Expense, Trip, CreateExpenseModel, CreateTripModel } from '../../types/database';
import { TaxType } from '../../types/database';

/**
 * Factory functions to create mock data for tests
 */

let expenseIdCounter = 1;
let tripIdCounter = 1;

export const resetCounters = () => {
  expenseIdCounter = 1;
  tripIdCounter = 1;
};

/**
 * Create a mock Expense with default values
 */
export const createMockExpense = (overrides: Partial<Expense> = {}): Expense => {
  const id = expenseIdCounter++;
  return {
    id,
    merchant_name: 'Test Merchant',
    amount_cents: 5000, // $50.00
    currency: 'USD',
    transaction_date: '2024-03-15',
    transaction_time: '14:30:00',
    category: 'Food',
    tax_amount_cents: 400, // $4.00
    tax_type: TaxType.GST,
    tip_amount_cents: null,
    subtotal_cents: 4600,
    receipt_image_path: `/receipts/${id}.jpg`,
    notes: null,
    trip_id: null,
    payment_method: 'Credit Card',
    is_reimbursable: false,
    is_verified: true,
    verification_status: 'verified',
    confidence_score: 0.95,
    extracted_data: JSON.stringify({
      merchant: 'Test Merchant',
      amount: 50.00,
      date: '2024-03-15',
    }),
    capture_method: 'ai_service',
    ai_service_used: 'openai',
    processing_time_ms: 1500,
    created_at: '2024-03-15T14:30:00Z',
    updated_at: '2024-03-15T14:30:00Z',
    ...overrides,
  };
};

/**
 * Create a mock CreateExpenseModel with default values
 */
export const createMockCreateExpense = (
  overrides: Partial<CreateExpenseModel> = {},
): CreateExpenseModel => ({
  merchant_name: 'Test Merchant',
  amount_cents: 5000,
  currency: 'USD',
  transaction_date: '2024-03-15',
  transaction_time: '14:30:00',
  category: 'Food',
  tax_amount_cents: 400,
  tax_type: TaxType.GST,
  receipt_image_path: '/receipts/test.jpg',
  is_verified: true,
  verification_status: 'verified',
  confidence_score: 0.95,
  capture_method: 'ai_service',
  ai_service_used: 'openai',
  processing_time_ms: 1500,
  ...overrides,
});

/**
 * Create a mock Trip with default values
 */
export const createMockTrip = (overrides: Partial<Trip> = {}): Trip => {
  const id = tripIdCounter++;
  return {
    id,
    trip_name: 'Test Trip',
    destination: 'San Francisco',
    start_date: '2024-03-01',
    end_date: '2024-03-05',
    purpose: 'Business',
    notes: 'Test trip notes',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    ...overrides,
  };
};

/**
 * Create a mock CreateTripModel with default values
 */
export const createMockCreateTrip = (
  overrides: Partial<CreateTripModel> = {},
): CreateTripModel => ({
  trip_name: 'Test Trip',
  destination: 'San Francisco',
  start_date: '2024-03-01',
  end_date: '2024-03-05',
  purpose: 'Business',
  notes: 'Test trip notes',
  ...overrides,
});

/**
 * Create mock OCR text that looks like a receipt
 */
export const createMockOCRText = (overrides: {
  merchant?: string;
  amount?: number;
  date?: string;
  tax?: number;
} = {}): string => {
  const merchant = overrides.merchant || 'Test Store';
  const amount = overrides.amount || 50.00;
  const date = overrides.date || '03/15/2024';
  const tax = overrides.tax || 4.00;

  return `${merchant}
123 Main Street
City, State 12345

Date: ${date}

Items:
Item 1         $20.00
Item 2         $26.00

Subtotal       $${(amount - tax).toFixed(2)}
Tax (GST)      $${tax.toFixed(2)}
TOTAL          $${amount.toFixed(2)}

Payment Method: Credit Card
Thank you for your purchase!`;
};

/**
 * Create mock AI response JSON
 */
export const createMockAIResponse = (overrides: {
  merchant?: string;
  amount?: number;
  date?: string;
  tax?: number;
  category?: string;
} = {}): string => {
  const response = {
    merchant: overrides.merchant || 'Test Store',
    amount: overrides.amount || 50.00,
    date: overrides.date || '2024-03-15',
    time: '14:30:00',
    tax: overrides.tax || 4.00,
    taxType: 'GST',
    category: overrides.category || 'Food',
    items: [
      { name: 'Item 1', price: 20.00 },
      { name: 'Item 2', price: 26.00 },
    ],
    paymentMethod: 'Credit Card',
  };

  return JSON.stringify(response);
};

/**
 * Create mock OpenAI API response
 */
export const createMockOpenAIResponse = (content: string) => ({
  choices: [
    {
      message: {
        content,
        role: 'assistant',
      },
      finish_reason: 'stop',
      index: 0,
    },
  ],
  created: Date.now(),
  id: 'chatcmpl-test123',
  model: 'gpt-4-vision-preview',
  object: 'chat.completion',
  usage: {
    completion_tokens: 100,
    prompt_tokens: 50,
    total_tokens: 150,
  },
});

/**
 * Create mock Anthropic API response
 */
export const createMockAnthropicResponse = (content: string) => ({
  id: 'msg-test123',
  type: 'message',
  role: 'assistant',
  content: [
    {
      type: 'text',
      text: content,
    },
  ],
  model: 'claude-sonnet-4-20250514',
  stop_reason: 'end_turn',
  stop_sequence: null,
  usage: {
    input_tokens: 50,
    output_tokens: 100,
  },
});

/**
 * Create mock Gemini API response
 */
export const createMockGeminiResponse = (content: string) => ({
  candidates: [
    {
      content: {
        parts: [
          {
            text: content,
          },
        ],
        role: 'model',
      },
      finishReason: 'STOP',
      index: 0,
      safetyRatings: [],
    },
  ],
  promptFeedback: {
    safetyRatings: [],
  },
});
