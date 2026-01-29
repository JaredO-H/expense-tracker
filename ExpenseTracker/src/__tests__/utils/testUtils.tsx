/**
 * Test Utilities
 * Helper functions for rendering components with providers in tests
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '../../contexts/ThemeContext';

/**
 * Custom render function that wraps component with necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <NavigationContainer>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </NavigationContainer>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Create mock navigation object
 */
export function createMockNavigation() {
  return {
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
    dispatch: jest.fn(),
    reset: jest.fn(),
    isFocused: jest.fn(() => true),
    canGoBack: jest.fn(() => true),
    getId: jest.fn(() => 'mock-id'),
    getState: jest.fn(),
    getParent: jest.fn(),
    setParams: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
    removeListener: jest.fn(),
  };
}

/**
 * Create mock route object
 */
export function createMockRoute(params: any = {}) {
  return {
    key: 'mock-route-key',
    name: 'MockScreen',
    params,
  };
}

/**
 * Wait for async updates in tests
 */
export function wait(ms: number = 0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
