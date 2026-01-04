export const SECURITY_LEVEL = {
  ANY: 'ANY',
  SECURE_SOFTWARE: 'SECURE_SOFTWARE',
  SECURE_HARDWARE: 'SECURE_HARDWARE',
};

export const ACCESS_CONTROL = {
  USER_PRESENCE: 'USER_PRESENCE',
  BIOMETRY_ANY: 'BIOMETRY_ANY',
  BIOMETRY_CURRENT_SET: 'BIOMETRY_CURRENT_SET',
  DEVICE_PASSCODE: 'DEVICE_PASSCODE',
  APPLICATION_PASSWORD: 'APPLICATION_PASSWORD',
  BIOMETRY_ANY_OR_DEVICE_PASSCODE: 'BIOMETRY_ANY_OR_DEVICE_PASSCODE',
  BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE: 'BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE',
};

const mockStorage: Record<string, { username: string; password: string }> = {};

export const setGenericPassword = jest.fn((username: string, password: string, options?: any) => {
  const key = options?.service || 'default';
  mockStorage[key] = { username, password };
  return Promise.resolve({ service: key });
});

export const getGenericPassword = jest.fn((options?: any) => {
  const key = options?.service || 'default';
  const credentials = mockStorage[key];
  if (credentials) {
    return Promise.resolve({ ...credentials, service: key, storage: 'keychain' });
  }
  return Promise.resolve(false);
});

export const resetGenericPassword = jest.fn((options?: any) => {
  const key = options?.service || 'default';
  delete mockStorage[key];
  return Promise.resolve(true);
});

export const hasInternetCredentials = jest.fn((service: string) => {
  return Promise.resolve(!!mockStorage[service]);
});

export const setInternetCredentials = jest.fn(
  (service: string, username: string, password: string) => {
    mockStorage[service] = { username, password };
    return Promise.resolve();
  },
);

export const getInternetCredentials = jest.fn((service: string) => {
  const credentials = mockStorage[service];
  if (credentials) {
    return Promise.resolve(credentials);
  }
  return Promise.resolve(null);
});

export const resetInternetCredentials = jest.fn((service: string) => {
  delete mockStorage[service];
  return Promise.resolve();
});

// Helper for tests to clear mock storage
export const __clearMockStorage = () => {
  Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
};

// Mock ACCESSIBLE constant
export const ACCESSIBLE = {
  WHEN_UNLOCKED: 'AccessibleWhenUnlocked',
  AFTER_FIRST_UNLOCK: 'AccessibleAfterFirstUnlock',
  ALWAYS: 'AccessibleAlways',
  WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: 'AccessibleWhenPasscodeSetThisDeviceOnly',
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'AccessibleWhenUnlockedThisDeviceOnly',
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AccessibleAfterFirstUnlockThisDeviceOnly',
  ALWAYS_THIS_DEVICE_ONLY: 'AccessibleAlwaysThisDeviceOnly',
};

// Mock getSupportedBiometryType for keychain availability check
export const getSupportedBiometryType = jest.fn(() => Promise.resolve(null));

export default {
  setGenericPassword,
  getGenericPassword,
  resetGenericPassword,
  hasInternetCredentials,
  setInternetCredentials,
  getInternetCredentials,
  resetInternetCredentials,
  getSupportedBiometryType,
  SECURITY_LEVEL,
  ACCESS_CONTROL,
  ACCESSIBLE,
};
