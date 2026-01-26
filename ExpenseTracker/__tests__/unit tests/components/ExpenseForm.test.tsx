/**
 * Tests for Expense Form Component
 * Validates form rendering, validation, and submission
 */

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../../src/__tests__/utils/testUtils';
import { ExpenseForm } from '../../../src/components/forms/ExpenseForm';
import { useTripStore } from '../../../src/stores/tripStore';
import { useCategoryStore } from '../../../src/stores/categoryStore';

// Mock stores
jest.mock('../../../src/stores/tripStore');
jest.mock('../../../src/stores/categoryStore');

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn(_date => '2024-03-15'),
}));

const mockUseTripStore = useTripStore as jest.MockedFunction<typeof useTripStore>;
const mockUseCategoryStore = useCategoryStore as jest.MockedFunction<typeof useCategoryStore>;

describe('ExpenseForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const mockTrips = [
    { id: 1, name: 'Business Trip to NYC', start_date: '2024-03-01', end_date: '2024-03-05' },
    { id: 2, name: 'Conference in LA', start_date: '2024-04-01', end_date: '2024-04-05' },
  ];

  const mockCategories = [
    { id: 1, name: 'Transportation' },
    { id: 2, name: 'Accommodation' },
    { id: 3, name: 'Meals' },
    { id: 4, name: 'Food and Drink' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock trip store
    mockUseTripStore.mockReturnValue({
      trips: mockTrips,
      fetchTrips: jest.fn().mockResolvedValue(undefined),
    } as any);

    // Mock category store
    mockUseCategoryStore.mockReturnValue({
      categories: mockCategories,
      fetchCategories: jest.fn().mockResolvedValue(undefined),
    } as any);
  });

  describe('rendering', () => {
    it('should render form in create mode', () => {
      const { getByText } = renderWithProviders(
        <ExpenseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
      );

      expect(getByText('SAVE EXPENSE')).toBeTruthy();
      expect(getByText('CANCEL')).toBeTruthy();
    });

    it('should render form in edit mode with existing expense', async () => {
      const existingExpense = {
        id: 1,
        trip_id: 1,
        merchant: 'Starbucks',
        amount: 15.5,
        date: '2024-03-15',
        category: 4,
        capture_method: 'manual',
      } as any;

      const { getByDisplayValue } = renderWithProviders(
        <ExpenseForm expense={existingExpense} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
      );

      await waitFor(() => {
        expect(getByDisplayValue('Starbucks')).toBeTruthy();
        expect(getByDisplayValue('15.5')).toBeTruthy();
      });
    });

    it('should show loading indicator when isLoading is true', () => {
      const { getByTestId } = renderWithProviders(
        <ExpenseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={true} />,
      );

      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should pre-fill trip when initialTripId is provided', async () => {
      const { getByTestId, getByText, getByPlaceholderText } = renderWithProviders(
        <ExpenseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} initialTripId={1} />,
      );

      // Wait for form to be fully loaded
      await waitFor(
        () => {
          expect(getByTestId('trip-picker')).toBeTruthy();
        },
        { timeout: 2000 },
      );

      // Submit form with required fields to verify initialTripId is included
      const merchantInput = getByPlaceholderText('e.g., Starbucks');
      fireEvent.changeText(merchantInput, 'Test Merchant');

      const amountInput = getByTestId('amount-input');
      fireEvent.changeText(amountInput, '10.00');

      const submitButton = getByText('SAVE EXPENSE');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            trip_id: 1,
          }),
        );
      });
    });
  });

  describe('form validation', () => {
    it('should validate required amount field', async () => {
      const { getByText, getByTestId } = renderWithProviders(
        <ExpenseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
      );

      const amountInput = getByTestId('amount-input');
      fireEvent.changeText(amountInput, '');

      const submitButton = getByText('SAVE EXPENSE');
      fireEvent.press(submitButton);

      await waitFor(() => {
        // Form should not submit with invalid data
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should validate date format', async () => {
      const { getByText, getByPlaceholderText } = renderWithProviders(
        <ExpenseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
      );

      const dateInput = getByPlaceholderText('YYYY-MM-DD');
      fireEvent.changeText(dateInput, 'invalid-date');

      const submitButton = getByText('SAVE EXPENSE');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should accept valid amount values', async () => {
      const { getByTestId } = renderWithProviders(
        <ExpenseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
      );

      const amountInput = getByTestId('amount-input');

      // Test various valid formats
      fireEvent.changeText(amountInput, '15.50');
      expect(amountInput.props.value).toBe('15.50');

      fireEvent.changeText(amountInput, '100');
      expect(amountInput.props.value).toBe('100');
    });
  });

  describe('form submission', () => {
    it('should call onSubmit with valid form data', async () => {
      const { getByText, getByPlaceholderText, getByTestId } = renderWithProviders(
        <ExpenseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} initialTripId={1} />,
      );

      // Fill form fields
      const merchantInput = getByPlaceholderText('e.g., Starbucks');
      fireEvent.changeText(merchantInput, 'Starbucks');

      const amountInput = getByTestId('amount-input');
      fireEvent.changeText(amountInput, '15.50');

      const dateInput = getByPlaceholderText('YYYY-MM-DD');
      fireEvent.changeText(dateInput, '2024-03-15');

      // Submit form
      const submitButton = getByText('SAVE EXPENSE');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            merchant: 'Starbucks',
            amount: 15.5,
            date: '2024-03-15',
          }),
        );
      });
    });

    it('should include optional fields when provided', async () => {
      const { getByText, getByPlaceholderText, getByTestId } = renderWithProviders(
        <ExpenseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} initialTripId={1} />,
      );

      const merchantInput = getByPlaceholderText('e.g., Starbucks');
      fireEvent.changeText(merchantInput, 'Hotel XYZ');

      const amountInput = getByTestId('amount-input');
      fireEvent.changeText(amountInput, '150.00');

      const dateInput = getByPlaceholderText('YYYY-MM-DD');
      fireEvent.changeText(dateInput, '2024-03-15');

      const notesInput = getByPlaceholderText('Add any additional notes here...');
      fireEvent.changeText(notesInput, 'Business accommodation');

      const submitButton = getByText('SAVE EXPENSE');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            notes: 'Business accommodation',
          }),
        );
      });
    });

    it('should not submit when form is loading', () => {
      const { getByTestId, queryByText } = renderWithProviders(
        <ExpenseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={true} />,
      );

      // When loading, the submit button shows a loading indicator instead of text
      expect(getByTestId('loading-indicator')).toBeTruthy();
      expect(queryByText('SAVE EXPENSE')).toBeNull();
    });
  });

  describe('cancel functionality', () => {
    it('should call onCancel when cancel button is pressed', () => {
      const { getByText } = renderWithProviders(
        <ExpenseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
      );

      const cancelButton = getByText('CANCEL');
      fireEvent.press(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should not submit form when canceling', () => {
      const { getByText } = renderWithProviders(
        <ExpenseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
      );

      const cancelButton = getByText('CANCEL');
      fireEvent.press(cancelButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('trip and category selection', () => {
    it('should load trips on mount', async () => {
      const mockFetchTrips = jest.fn().mockResolvedValue(undefined);
      mockUseTripStore.mockReturnValue({
        trips: mockTrips,
        fetchTrips: mockFetchTrips,
      } as any);

      renderWithProviders(<ExpenseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      await waitFor(() => {
        expect(mockFetchTrips).toHaveBeenCalled();
      });
    });

    it('should load categories on mount', async () => {
      const mockFetchCategories = jest.fn().mockResolvedValue(undefined);
      mockUseCategoryStore.mockReturnValue({
        categories: mockCategories,
        fetchCategories: mockFetchCategories,
      } as any);

      renderWithProviders(<ExpenseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      await waitFor(() => {
        expect(mockFetchCategories).toHaveBeenCalled();
      });
    });

    it('should handle trip selection change', async () => {
      const { getByTestId, getByText, getByPlaceholderText } = renderWithProviders(
        <ExpenseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
      );

      await waitFor(() => {
        expect(getByTestId('trip-picker')).toBeTruthy();
      });

      // Change trip selection
      const tripPicker = getByTestId('trip-picker');
      fireEvent(tripPicker, 'onValueChange', 2);

      // Fill required fields and submit to verify the trip_id was set
      const merchantInput = getByPlaceholderText('e.g., Starbucks');
      fireEvent.changeText(merchantInput, 'Test Merchant');

      const amountInput = getByTestId('amount-input');
      fireEvent.changeText(amountInput, '10.00');

      const submitButton = getByText('SAVE EXPENSE');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            trip_id: 2,
          }),
        );
      });
    });

    it('should handle category selection change', async () => {
      const { getByTestId, getByText, getByPlaceholderText } = renderWithProviders(
        <ExpenseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
      );

      await waitFor(() => {
        expect(getByTestId('category-picker')).toBeTruthy();
      });

      // Change category selection
      const categoryPicker = getByTestId('category-picker');
      fireEvent(categoryPicker, 'onValueChange', 3);

      // Fill required fields and submit to verify the category was set
      const merchantInput = getByPlaceholderText('e.g., Starbucks');
      fireEvent.changeText(merchantInput, 'Test Merchant');

      const amountInput = getByTestId('amount-input');
      fireEvent.changeText(amountInput, '10.00');

      const submitButton = getByText('SAVE EXPENSE');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            category: 3,
          }),
        );
      });
    });
  });

  describe('edit mode behavior', () => {
    it('should populate form with existing expense data', async () => {
      const existingExpense = {
        id: 1,
        trip_id: 1,
        merchant: 'Restaurant ABC',
        amount: 45.0,
        tax_amount: 4.5,
        date: '2024-03-10',
        time: '18:30',
        category: 3,
        notes: 'Dinner meeting',
        capture_method: 'manual',
      } as any;

      const { getByDisplayValue } = renderWithProviders(
        <ExpenseForm expense={existingExpense} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
      );

      await waitFor(() => {
        expect(getByDisplayValue('Restaurant ABC')).toBeTruthy();
        expect(getByDisplayValue('45')).toBeTruthy();
        expect(getByDisplayValue('Dinner meeting')).toBeTruthy();
      });
    });

    it('should submit updated expense data', async () => {
      const existingExpense = {
        id: 1,
        trip_id: 1,
        merchant: 'Old Merchant',
        amount: 10.0,
        date: '2024-03-10',
        category: 3,
        capture_method: 'manual',
      } as any;

      const { getByText, getByDisplayValue } = renderWithProviders(
        <ExpenseForm expense={existingExpense} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
      );

      // Update merchant field
      const merchantInput = getByDisplayValue('Old Merchant');
      fireEvent.changeText(merchantInput, 'New Merchant');

      const submitButton = getByText('SAVE EXPENSE');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            merchant: 'New Merchant',
          }),
        );
      });
    });
  });

  describe('error handling', () => {
    it('should handle trip loading failure gracefully', async () => {
      const mockFetchTrips = jest.fn().mockRejectedValue(new Error('Network error'));
      mockUseTripStore.mockReturnValue({
        trips: [],
        fetchTrips: mockFetchTrips,
      } as any);

      const { getByText } = renderWithProviders(
        <ExpenseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
      );

      await waitFor(() => {
        // Component should still render
        expect(getByText('SAVE EXPENSE')).toBeTruthy();
      });
    });

    it('should handle category loading failure gracefully', async () => {
      const mockFetchCategories = jest.fn().mockRejectedValue(new Error('Network error'));
      mockUseCategoryStore.mockReturnValue({
        categories: [],
        fetchCategories: mockFetchCategories,
      } as any);

      const { getByText } = renderWithProviders(
        <ExpenseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
      );

      await waitFor(() => {
        // Component should still render
        expect(getByText('SAVE EXPENSE')).toBeTruthy();
      });
    });
  });
});
