/**
 * Sample AI service responses for testing
 */

// Valid JSON response in markdown code block
export const validMarkdownResponse = `Here's the extracted receipt data:

\`\`\`json
{
  "merchant": "The Italian Kitchen",
  "amount": 87.50,
  "date": "2024-03-15",
  "time": "19:30:00",
  "tax": 7.00,
  "taxType": "GST",
  "category": "Food",
  "items": [
    {"name": "Pasta Carbonara", "price": 24.00},
    {"name": "Caesar Salad", "price": 12.50}
  ],
  "paymentMethod": "Credit Card"
}
\`\`\`

The receipt shows a dinner transaction at an Italian restaurant.`;

// Valid JSON without markdown
export const validPlainJSONResponse = `{
  "merchant": "Office Supplies Plus",
  "amount": 156.78,
  "date": "2024-03-14",
  "time": "14:22:00",
  "tax": 12.54,
  "taxType": "HST",
  "category": "Office Supplies",
  "paymentMethod": "Debit Card"
}`;

// Response with multiple JSON blocks (should use first valid one)
export const multipleJSONResponse = `I found the receipt data:

\`\`\`json
{
  "merchant": "Starbucks",
  "amount": 12.75,
  "date": "2024-03-16"
}
\`\`\`

But also found this alternate parsing:

\`\`\`json
{
  "merchant": "Coffee Shop",
  "amount": 12.00,
  "date": "2024-03-16"
}
\`\`\``;

// Invalid JSON (syntax error)
export const invalidJSONResponse = `{
  "merchant": "Test Store",
  "amount": 50.00,
  "date": "2024-03-15",
  missing closing brace`;

// Missing required fields
export const missingFieldsResponse = `{
  "merchant": "Test Store",
  "category": "Food"
}`;

// Invalid field types
export const invalidTypesResponse = `{
  "merchant": "Test Store",
  "amount": "not a number",
  "date": "invalid-date",
  "tax": true
}`;

// Empty response
export const emptyResponse = '';

// Response with no JSON
export const noJSONResponse = `I couldn't extract any receipt data from this image. The image appears to be too blurry or the receipt is not clearly visible.`;

// Response with escaped characters
export const escapedCharactersResponse = `{
  "merchant": "Joe's \\"Fancy\\" Diner",
  "amount": 45.50,
  "date": "2024-03-15",
  "notes": "Server said: \\"Have a nice day!\\""
}`;

// Response with special characters in amounts
export const specialCharactersAmountResponse = `{
  "merchant": "International Store",
  "amount": "$1,234.56",
  "date": "2024-03-15",
  "tax": "$98.77"
}`;

// Negative amounts (should be rejected)
export const negativeAmountResponse = `{
  "merchant": "Test Store",
  "amount": -50.00,
  "date": "2024-03-15"
}`;

// Future date (should be handled appropriately)
export const futureDateResponse = `{
  "merchant": "Test Store",
  "amount": 50.00,
  "date": "2099-12-31"
}`;

// Very large amount
export const largeAmountResponse = `{
  "merchant": "Luxury Store",
  "amount": 999999.99,
  "date": "2024-03-15",
  "tax": 129999.99,
  "taxType": "HST"
}`;

// Very small amount
export const smallAmountResponse = `{
  "merchant": "Street Vendor",
  "amount": 0.50,
  "date": "2024-03-15"
}`;

// Complex nested response
export const complexNestedResponse = `{
  "merchant": "Department Store",
  "amount": 234.56,
  "date": "2024-03-15",
  "time": "15:45:00",
  "tax": 30.49,
  "taxType": "HST",
  "category": "Shopping",
  "items": [
    {
      "name": "T-Shirt",
      "quantity": 2,
      "price": 29.99,
      "subtotal": 59.98,
      "department": "Clothing"
    },
    {
      "name": "Socks",
      "quantity": 3,
      "price": 9.99,
      "subtotal": 29.97,
      "department": "Clothing"
    },
    {
      "name": "Book",
      "quantity": 1,
      "price": 24.99,
      "subtotal": 24.99,
      "department": "Books"
    }
  ],
  "paymentMethod": "Credit Card",
  "cardType": "Visa",
  "lastFourDigits": "1234",
  "transactionId": "TXN-2024-03-15-12345"
}`;

// OpenAI API successful response wrapper
export const openAISuccessResponse = {
  choices: [
    {
      message: {
        content: validMarkdownResponse,
        role: 'assistant',
      },
      finish_reason: 'stop',
      index: 0,
    },
  ],
  created: 1710518400,
  id: 'chatcmpl-test123',
  model: 'gpt-4-vision-preview',
  object: 'chat.completion',
  usage: {
    completion_tokens: 150,
    prompt_tokens: 200,
    total_tokens: 350,
  },
};

// OpenAI API error response (401 Unauthorized)
export const openAIUnauthorizedResponse = {
  error: {
    message: 'Incorrect API key provided',
    type: 'invalid_request_error',
    param: null,
    code: 'invalid_api_key',
  },
};

// Anthropic API successful response wrapper
export const anthropicSuccessResponse = {
  id: 'msg_test123',
  type: 'message',
  role: 'assistant',
  content: [
    {
      type: 'text',
      text: validPlainJSONResponse,
    },
  ],
  model: 'claude-sonnet-4-20250514',
  stop_reason: 'end_turn',
  stop_sequence: null,
  usage: {
    input_tokens: 180,
    output_tokens: 120,
  },
};

// Anthropic API error response (401 Unauthorized)
export const anthropicUnauthorizedResponse = {
  type: 'error',
  error: {
    type: 'authentication_error',
    message: 'invalid x-api-key',
  },
};

// Gemini API successful response wrapper
export const geminiSuccessResponse = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: validMarkdownResponse,
          },
        ],
        role: 'model',
      },
      finishReason: 'STOP',
      index: 0,
      safetyRatings: [
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          probability: 'NEGLIGIBLE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          probability: 'NEGLIGIBLE',
        },
      ],
    },
  ],
  promptFeedback: {
    safetyRatings: [],
  },
};

// Gemini API error response (400 Bad Request)
export const geminiInvalidAPIKeyResponse = {
  error: {
    code: 400,
    message: 'API key not valid. Please pass a valid API key.',
    status: 'INVALID_ARGUMENT',
  },
};
