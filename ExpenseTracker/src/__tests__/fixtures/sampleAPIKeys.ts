/**
 * Sample API key formats for testing validation
 */

// Valid format examples
export const validAPIKeys = {
  openai: 'sk-proj-abcdef1234567890abcdef1234567890abcdef1234567890',
  anthropic:
    'sk-ant-api03-abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqr',
  gemini: 'AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567',
};

// Invalid format examples
export const invalidAPIKeys = {
  // Wrong prefix
  openaiWrongPrefix: 'pk-proj-abcdef1234567890',
  anthropicWrongPrefix: 'sk-api-abcdef1234567890',
  geminiWrongPrefix: 'GoogleAI-abcdef1234567890',

  // Too short
  openaiTooShort: 'sk-abc123',
  anthropicTooShort: 'sk-ant-short',
  geminiTooShort: 'AIzaSy123',

  // Invalid characters
  openaiInvalidChars: 'sk-proj-abc!@#$%^&*()',
  anthropicInvalidChars: 'sk-ant-api03-abc!@#$',
  geminiInvalidChars: 'AIzaSy!@#$%^&*()',

  // Empty
  empty: '',

  // Null/undefined handled by TypeScript but for testing
  // null: null,
  // undefined: undefined,

  // Spaces
  withSpaces: 'sk-proj- abcd efgh 1234',

  // Just random strings
  random1: 'this-is-not-an-api-key',
  random2: '1234567890',
};

// Edge cases
export const edgeCaseAPIKeys = {
  // Exactly minimum length for OpenAI
  openaiMinLength: 'sk-' + 'a'.repeat(48),

  // Very long key
  openaiVeryLong: 'sk-proj-' + 'a'.repeat(200),

  // Key with all valid special characters
  openaiWithDashUnderscore: 'sk-proj-abc_def-123_456-xyz_789',

  // Anthropic with minimum length
  anthropicMinLength: 'sk-ant-api03-' + 'a'.repeat(50),
};
