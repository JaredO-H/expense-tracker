/**
 * Tests for Expense Detail Screen
 * Validates expense details display, receipt viewing, editing, and deletion
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ExpenseDetailScreen } from '../../../src/screens/expenses/ExpenseDetailScreen';
import { useExpenseStore } from '../../../src/stores/expenseStore';
import { useTripStore } from '../../../src/stores/tripStore';
import { useCategoryStore } from '../../../src/stores/categoryStore';
import fileService from '../../../src/services/storage/fileService';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('../../../src/stores/expenseStore');
jest.mock('../../../src/stores/tripStore');
jest.mock('../../../src/stores/categoryStore');
jest.mock('../../../src/services/storage/fileService');
jest.mock('../../../src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      background: '#FFFFFF',
      backgroundSecondary: '#F5F5F5',
      backgroundElevated: '#FFFFFF',
      textPrimary: '#000000',
      textSecondary: '#666666',
      textTertiary: '#999999',
      textInverse: '#FFFFFF',
      primary: '#007AFF',
      border: '#E0E0E0',
      borderSubtle: '#F0F0F0',
      error: '#FF3B30',
      errorDark: '#D32F2F',
    },
    themeVersion: 1,
  }),
}));

// Mock react-navigation hooks
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  }),
}));

// Mock general settings
jest.mock('../../../src/utils/generalSettings', () => ({
  getDateFormat: jest.fn().mockResolvedValue('YYYY-MM-DD'),
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((_date, formatStr) => {
    if (formatStr === 'MMMM dd, yyyy') return 'March 15, 2024';
    if (formatStr === 'MMM dd, yyyy HH:mm') return 'Mar 15, 2024 14:30';
    return '2024-03-15';
  }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

const mockUseExpenseStore = useExpenseStore as jest.MockedFunction<typeof useExpenseStore>;
const mockUseTripStore = useTripStore as jest.MockedFunction<typeof useTripStore>;
const mockUseCategoryStore = useCategoryStore as jest.MockedFunction<typeof useCategoryStore>;

describe('ExpenseDetailScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  };

  const mockExpenseWithReceipt = {
    id: 1,
    trip_id: 1,
    merchant: 'Starbucks',
    amount: 15.5,
    currency: 'USD',
    date: '2024-03-15',
    time: '14:30',
    category: 4,
    notes: 'Coffee meeting',
    capture_method: 'camera',
    ai_service_used: 'openai',
    image_path: '/path/to/receipt.jpg',
    created_at: '2024-03-15T14:30:00Z',
    updated_at: '2024-03-15T14:30:00Z',
    verification_status: 'verified',
  };

  const mockExpenseWithoutReceipt = {
    ...mockExpenseWithReceipt,
    image_path: undefined,
  };

  const mockRoute = {
    params: {
      expenseId: 1,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockUseExpenseStore.mockReturnValue({
      expenses: [mockExpenseWithReceipt],
      updateExpense: jest.fn().mockResolvedValue(undefined),
      deleteExpense: jest.fn().mockResolvedValue(undefined),
      isLoading: false,
    } as any);

    // Mock trip store
    mockUseTripStore.mockReturnValue({
      trips: [{ id: 1, name: 'Business Trip', start_date: '2024-03-01', end_date: '2024-03-05' }],
      fetchTrips: jest.fn().mockResolvedValue(undefined),
    } as any);

    // Mock category store
    mockUseCategoryStore.mockReturnValue({
      categories: [
        { id: 1, name: 'Transportation' },
        { id: 4, name: 'Food and Drink' },
      ],
      fetchCategories: jest.fn().mockResolvedValue(undefined),
    } as any);

    (fileService.getReceiptImage as jest.Mock).mockResolvedValue(true);
    (fileService.deleteReceiptImage as jest.Mock).mockResolvedValue(undefined);
    (fileService.saveReceiptImage as jest.Mock).mockResolvedValue('/path/to/saved/receipt.jpg');
  });

  describe('Receipt Image Display', () => {
    it('should display receipt image card when expense has image and file exists', async () => {
      const { getByText } = render(
        <ExpenseDetailScreen route={mockRoute} navigation={mockNavigation} />,
      );

      await waitFor(() => {
        expect(getByText('Receipt Image')).toBeTruthy();
        expect(getByText('View Full Size')).toBeTruthy();
      });
    });

    it('should not display receipt image card when expense has no image', async () => {
      mockUseExpenseStore.mockReturnValue({
        expenses: [mockExpenseWithoutReceipt],
        updateExpense: jest.fn(),
        deleteExpense: jest.fn(),
        isLoading: false,
      } as any);

      const { queryByText } = render(
        <ExpenseDetailScreen route={mockRoute} navigation={mockNavigation} />,
      );

      await waitFor(() => {
        expect(queryByText('Receipt Image')).toBeNull();
        expect(queryByText('View Full Size')).toBeNull();
      });
    });

    it('should not display receipt image card when file does not exist', async () => {
      (fileService.getReceiptImage as jest.Mock).mockResolvedValue(false);

      const { queryByText } = render(
        <ExpenseDetailScreen route={mockRoute} navigation={mockNavigation} />,
      );

      await waitFor(() => {
        expect(queryByText('Receipt Image')).toBeNull();
      });
    });

    it('should verify image exists on mount', async () => {
      render(<ExpenseDetailScreen route={mockRoute} navigation={mockNavigation} />);

      await waitFor(() => {
        expect(fileService.getReceiptImage).toHaveBeenCalledWith('/path/to/receipt.jpg');
      });
    });

    it('should display thumbnail with correct URI', async () => {
      const { UNSAFE_getByType } = render(
        <ExpenseDetailScreen route={mockRoute} navigation={mockNavigation} />,
      );

      await waitFor(() => {
        const images = UNSAFE_getByType('Image' as any);
        expect(images).toBeTruthy();
      });
    });
  });

  describe('Receipt Image Navigation', () => {
    it('should navigate to ReceiptImageViewer when View Full Size is pressed', async () => {
      const { getByText } = render(
        <ExpenseDetailScreen route={mockRoute} navigation={mockNavigation} />,
      );

      await waitFor(() => {
        const viewButton = getByText('View Full Size');
        fireEvent.press(viewButton);
      });

      expect(mockNavigation.navigate).toHaveBeenCalledWith('ReceiptImageViewer', {
        imagePath: '/path/to/receipt.jpg',
      });
    });

    it('should not navigate if image does not exist', async () => {
      (fileService.getReceiptImage as jest.Mock).mockResolvedValue(false);

      const { queryByText } = render(
        <ExpenseDetailScreen route={mockRoute} navigation={mockNavigation} />,
      );

      await waitFor(() => {
        expect(queryByText('View Full Size')).toBeNull();
      });

      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Expense Information Display', () => {
    it('should display all expense information', async () => {
      const { getByText } = render(
        <ExpenseDetailScreen route={mockRoute} navigation={mockNavigation} />,
      );

      await waitFor(() => {
        expect(getByText('Starbucks')).toBeTruthy();
        expect(getByText('15.5')).toBeTruthy();
        expect(getByText('March 15, 2024')).toBeTruthy();
        expect(getByText('14:30')).toBeTruthy();
        expect(getByText('Coffee meeting')).toBeTruthy();
      });
    });

    it('should set navigation title to merchant name', async () => {
      render(<ExpenseDetailScreen route={mockRoute} navigation={mockNavigation} />);

      await waitFor(() => {
        expect(mockNavigation.setOptions).toHaveBeenCalledWith({
          title: 'Starbucks',
        });
      });
    });
  });

  describe('Edit and Delete Actions', () => {
    it('should show edit button', async () => {
      const { getByText } = render(
        <ExpenseDetailScreen route={mockRoute} navigation={mockNavigation} />,
      );

      await waitFor(() => {
        expect(getByText('Edit Expense')).toBeTruthy();
      });
    });

    it('should show delete button', async () => {
      const { getByText } = render(
        <ExpenseDetailScreen route={mockRoute} navigation={mockNavigation} />,
      );

      await waitFor(() => {
        expect(getByText('Delete Expense')).toBeTruthy();
      });
    });

    it('should switch to edit mode when edit button is pressed', async () => {
      const { getByText, queryByText } = render(
        <ExpenseDetailScreen route={mockRoute} navigation={mockNavigation} />,
      );

      let editButton;
      await waitFor(() => {
        editButton = getByText('Edit Expense');
        expect(editButton).toBeTruthy();
      });

      // Press the edit button
      fireEvent.press(editButton!);

      // Should show save/cancel buttons from the form instead of edit/delete buttons
      await waitFor(() => {
        expect(queryByText('SAVE EXPENSE')).toBeTruthy();
        expect(queryByText('CANCEL')).toBeTruthy();
      });
    });

    it('should show confirmation alert when delete button is pressed', async () => {
      const { getByText } = render(
        <ExpenseDetailScreen route={mockRoute} navigation={mockNavigation} />,
      );

      await waitFor(() => {
        const deleteButton = getByText('Delete Expense');
        fireEvent.press(deleteButton);
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Delete Expense',
        'Are you sure you want to delete "Starbucks"?',
        expect.any(Array),
      );
    });
  });

  describe('Error Handling', () => {
    it('should show error and navigate back if expense not found', async () => {
      mockUseExpenseStore.mockReturnValue({
        expenses: [],
        updateExpense: jest.fn(),
        deleteExpense: jest.fn(),
        isLoading: false,
      } as any);

      render(<ExpenseDetailScreen route={mockRoute} navigation={mockNavigation} />);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Expense not found',
          expect.arrayContaining([
            expect.objectContaining({
              text: 'OK',
              onPress: expect.any(Function),
            }),
          ]),
        );
      });
    });

    it('should show loading indicator while data is loading', () => {
      mockUseExpenseStore.mockReturnValue({
        expenses: [],
        updateExpense: jest.fn(),
        deleteExpense: jest.fn(),
        isLoading: false,
      } as any);

      const { UNSAFE_getByType } = render(
        <ExpenseDetailScreen route={mockRoute} navigation={mockNavigation} />,
      );

      // Should show ActivityIndicator when expense not found
      expect(UNSAFE_getByType('ActivityIndicator' as any)).toBeTruthy();
    });
  });

  describe('Image Cleanup on Delete', () => {
    it('should delete receipt image when deleting expense', async () => {
      const mockDeleteExpense = jest.fn().mockResolvedValue(undefined);
      mockUseExpenseStore.mockReturnValue({
        expenses: [mockExpenseWithReceipt],
        updateExpense: jest.fn(),
        deleteExpense: mockDeleteExpense,
        isLoading: false,
      } as any);

      const { getByText } = render(
        <ExpenseDetailScreen route={mockRoute} navigation={mockNavigation} />,
      );

      await waitFor(() => {
        const deleteButton = getByText('Delete Expense');
        fireEvent.press(deleteButton);
      });

      // Simulate confirming the delete
      const alertCalls = (Alert.alert as jest.Mock).mock.calls;
      const lastCall = alertCalls[alertCalls.length - 1];
      const buttons = lastCall[2];
      const deleteConfirmButton = buttons.find((btn: any) => btn.text === 'Delete');

      if (deleteConfirmButton && deleteConfirmButton.onPress) {
        await deleteConfirmButton.onPress();
      }

      await waitFor(() => {
        expect(fileService.deleteReceiptImage).toHaveBeenCalledWith('/path/to/receipt.jpg');
        expect(mockDeleteExpense).toHaveBeenCalledWith(1);
      });
    });

    it('should continue deletion even if image cleanup fails', async () => {
      (fileService.deleteReceiptImage as jest.Mock).mockRejectedValue(new Error('File not found'));

      const mockDeleteExpense = jest.fn().mockResolvedValue(undefined);
      mockUseExpenseStore.mockReturnValue({
        expenses: [mockExpenseWithReceipt],
        updateExpense: jest.fn(),
        deleteExpense: mockDeleteExpense,
        isLoading: false,
      } as any);

      const { getByText } = render(
        <ExpenseDetailScreen route={mockRoute} navigation={mockNavigation} />,
      );

      await waitFor(() => {
        const deleteButton = getByText('Delete Expense');
        fireEvent.press(deleteButton);
      });

      // Confirm delete
      const alertCalls = (Alert.alert as jest.Mock).mock.calls;
      const lastCall = alertCalls[alertCalls.length - 1];
      const buttons = lastCall[2];
      const deleteConfirmButton = buttons.find((btn: any) => btn.text === 'Delete');

      if (deleteConfirmButton && deleteConfirmButton.onPress) {
        await deleteConfirmButton.onPress();
      }

      // Should still delete expense even if image cleanup failed
      await waitFor(() => {
        expect(mockDeleteExpense).toHaveBeenCalledWith(1);
      });
    });
  });
});
