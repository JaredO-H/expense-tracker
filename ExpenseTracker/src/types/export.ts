/**
 * Export service type definitions
 */

import { Expense, Trip } from './database';

export enum ExportFormat {
  CSV = 'csv',
  PDF = 'pdf',
  EXCEL = 'excel',
}

export interface ExportResult {
  success: boolean;
  filePath?: string;
  fileSize?: number;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ExportOptions {
  includeReceipts: boolean;
  includeHeader: boolean;
  deleteReceiptsAfterExport?: boolean;
}

export interface ExportMetadata {
  tripId: number;
  tripName: string;
  format: ExportFormat;
  generatedAt: string;
  filePath: string;
  fileSize: number;
  expenseCount: number;
}

export interface ExportHistory {
  id: number;
  trip_id: number;
  format: ExportFormat;
  file_path: string;
  file_size: number;
  expense_count: number;
  receipts_deleted: boolean;
  created_at: string;
}

/**
 * Common interface for all export services
 */
export interface ExportService {
  /**
   * Generate an export file for a trip
   */
  generateExport(
    trip: Trip,
    expenses: Expense[],
    options: ExportOptions
  ): Promise<ExportResult>;

  /**
   * Estimate the size of the export file
   */
  getEstimatedSize(expenses: Expense[], includeReceipts: boolean): number;

  /**
   * Validate that the data is ready for export
   */
  validateData(expenses: Expense[]): ValidationResult;

  /**
   * Get the file extension for this export format
   */
  getFileExtension(): string;
}

export interface ExportData {
  trip: Trip;
  expenses: ExpenseWithCategory[];
  totalAmount: number;
  totalTax: number;
}

export interface ExpenseWithCategory extends Expense {
  category_name?: string;
}
