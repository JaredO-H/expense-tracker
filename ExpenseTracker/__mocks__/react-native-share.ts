/**
 * Mock for react-native-share
 */

export default {
  open: jest.fn(() => Promise.resolve({ success: true })),
  shareSingle: jest.fn(() => Promise.resolve({ success: true })),
};

export const open = jest.fn(() => Promise.resolve({ success: true }));
export const shareSingle = jest.fn(() => Promise.resolve({ success: true }));
