/**
 * Expense Store
 * Global state management for expenses using Zustand
 */

import { create } from 'zustand';
import { Expense, CreateExpenseModel, UpdateExpenseModel } from '../types/database';
import databaseService from '../services/database/databaseService';

interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  selectedExpense: Expense | null;

  // Actions
  fetchExpenses: (trip_id? : number) => Promise<void>;
  createExpense: (model: CreateExpenseModel) => Promise<Expense>;
  updateExpense: (model: UpdateExpenseModel) => Promise<Expense>;
  deleteExpense: (id: number) => Promise<void>;
  selectExpense: (expense: Expense | null) => void;
  clearError: () => void;
}

export const useExpenseStore = create<ExpenseState>(set => ({
  expenses: [],
  isLoading: false,
  error: null,
  selectedExpense: null,

  fetchExpenses: async (trip_id? : number) => {
    set({ isLoading: true, error: null });
    try {
      const expenses = await databaseService.getAllExpenses(trip_id);
      set({ expenses, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch expenses';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  createExpense: async (model: CreateExpenseModel) => {
    set({ isLoading: true, error: null });
    try {
      const newExpense = await databaseService.createExpense(model);
      set(state => ({
        expenses: [newExpense, ...state.expenses],
        isLoading: false,
      }));
      return newExpense;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create expense';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateExpense: async (model: UpdateExpenseModel) => {
    set({ isLoading: true, error: null });
    try {
      const updatedExpense = await databaseService.updateExpense(model);
      set(state => ({
        expenses: state.expenses.map(expense => (expense.id === updatedExpense.id ? updatedExpense : expense)),
        selectedExpense: state.selectedExpense?.id === updatedExpense.id ? updatedExpense : state.selectedExpense,
        isLoading: false,
      }));
      return updatedExpense;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update expense';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteExpense: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await databaseService.deleteExpense(id);
      set(state => ({
        expenses: state.expenses.filter(expense => expense.id !== id),
        selectedExpense: state.selectedExpense?.id === id ? null : state.selectedExpense,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete expense';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  selectExpense: (expense: Expense | null) => {
    set({ selectedExpense: expense });
  },

  clearError: () => {
    set({ error: null });
  },
}));