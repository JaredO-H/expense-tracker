// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
