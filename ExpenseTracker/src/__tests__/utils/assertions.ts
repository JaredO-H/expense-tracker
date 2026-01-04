/**
 * Custom test assertions and helper functions
 */

/**
 * Assert that a value is within a range
 */
export const expectToBeWithinRange = (
  actual: number,
  expected: number,
  tolerance: number = 0.01,
) => {
  const min = expected - tolerance;
  const max = expected + tolerance;
  expect(actual).toBeGreaterThanOrEqual(min);
  expect(actual).toBeLessThanOrEqual(max);
};

/**
 * Assert that a date string is valid and in ISO format
 */
export const expectValidISODate = (dateString: string) => {
  expect(dateString).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  const date = new Date(dateString);
  expect(date.toString()).not.toBe('Invalid Date');
};

/**
 * Assert that a date string is valid in various formats
 */
export const expectValidDate = (dateString: string) => {
  const date = new Date(dateString);
  expect(date.toString()).not.toBe('Invalid Date');
};

/**
 * Assert that an amount in cents is valid
 */
export const expectValidAmountCents = (amountCents: number) => {
  expect(typeof amountCents).toBe('number');
  expect(amountCents).toBeGreaterThan(0);
  expect(Number.isInteger(amountCents)).toBe(true);
};

/**
 * Assert that a confidence score is valid (0-1)
 */
export const expectValidConfidenceScore = (score: number) => {
  expect(typeof score).toBe('number');
  expect(score).toBeGreaterThanOrEqual(0);
  expect(score).toBeLessThanOrEqual(1);
};

/**
 * Assert that an API key format is valid
 */
export const expectValidAPIKeyFormat = (
  apiKey: string,
  service: 'openai' | 'anthropic' | 'gemini',
) => {
  expect(typeof apiKey).toBe('string');
  expect(apiKey.length).toBeGreaterThan(0);

  switch (service) {
    case 'openai':
      expect(apiKey).toMatch(/^sk-[A-Za-z0-9_-]+$/);
      break;
    case 'anthropic':
      expect(apiKey).toMatch(/^sk-ant-[A-Za-z0-9_-]+$/);
      break;
    case 'gemini':
      expect(apiKey).toMatch(/^AIza[A-Za-z0-9_-]+$/);
      break;
  }
};

/**
 * Assert that a JSON string is valid and parseable
 */
export const expectValidJSON = (jsonString: string) => {
  expect(() => JSON.parse(jsonString)).not.toThrow();
};

/**
 * Assert that a file path looks valid
 */
export const expectValidFilePath = (filePath: string) => {
  expect(typeof filePath).toBe('string');
  expect(filePath.length).toBeGreaterThan(0);
  // Should not contain invalid characters
  expect(filePath).not.toMatch(/[<>:"|?*]/);
};

/**
 * Assert that a mock function was called with partial arguments
 */
export const expectCalledWithPartial = (mockFn: jest.Mock, partialArgs: any[]) => {
  const calls = mockFn.mock.calls;
  const matchingCall = calls.find(call =>
    partialArgs.every((arg, index) => {
      if (typeof arg === 'object' && arg !== null) {
        return Object.keys(arg).every(key => call[index]?.[key] === arg[key]);
      }
      return call[index] === arg;
    }),
  );
  expect(matchingCall).toBeDefined();
};
