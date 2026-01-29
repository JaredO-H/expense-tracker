/**
 * Category Store
 * Global state management for expense categories
 */

import { create } from 'zustand';
import { ExpenseCategory } from '../types/database';
import databaseService from '../services/database/databaseService';

interface CategoryState {
  categories: ExpenseCategory[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCategories: () => Promise<void>;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>(set => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await databaseService.getAllCategories();
      set({ categories, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
