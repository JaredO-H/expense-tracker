import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Custom render function that includes theme provider
export const renderWithTheme = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Custom render function that includes common providers
export const renderWithNavigation = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <NavigationContainer>{children}</NavigationContainer>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Custom render function that includes both navigation and theme
export const renderWithProviders = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>
      <NavigationContainer>{children}</NavigationContainer>
    </ThemeProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Helper to wait for async operations to complete
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Helper to create mock navigation prop
export const createMockNavigation = (overrides = {}) => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
  setOptions: jest.fn(),
  ...overrides,
});

// Helper to create mock route prop
export const createMockRoute = (params = {}, overrides = {}) => ({
  key: 'test-route',
  name: 'TestScreen',
  params,
  ...overrides,
});

export { render };
