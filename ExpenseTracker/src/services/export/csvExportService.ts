/**
 * CSV Export Service
 * Generates CSV files with expense data using papaparse
 */

import Papa from 'papaparse';
import { format } from 'date-fns';
import {
  ExportService,
  ExportResult,
  ValidationResult,
  ExportOptions,
  ExportFormat,
} from '../../types/export';
import { Expense, Trip } from '../../types/database';
import { generateFilename, saveExportFile, getFileSize } from './fileManager';

export class CSVExportService implements ExportService {
  /**
   * Generate a CSV export for a trip
   */
  async generateExport(
    trip: Trip,
    expenses: Expense[],
    options: ExportOptions,
  ): Promise<ExportResult> {
    try {
      // Validate data
      const validation = this.validateData(expenses);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`,
        };
      }

      // Generate CSV content
      const csvContent = this.generateCSVContent(trip, expenses, options);

      // Add UTF-8 BOM for Excel compatibility
      const csvWithBOM = '\uFEFF' + csvContent;

      // Save to file
      const filename = generateFilename(trip.name, ExportFormat.CSV);
      const filePath = await saveExportFile(csvWithBOM, filename, 'utf8');

      // Get file size
      const fileSize = await getFileSize(filePath);

      return {
        success: true,
        filePath,
        fileSize,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Generate CSV content with headers and data
   */
  private generateCSVContent(trip: Trip, expenses: Expense[], options: ExportOptions): string {
    const lines: string[] = [];

    // Add header section if requested
    if (options.includeHeader) {
      lines.push(`Trip Name:,${this.escapeCSV(trip.name)}`);
      lines.push(
        `Trip Dates:,${format(new Date(trip.start_date), 'MMM dd, yyyy')} - ${format(new Date(trip.end_date), 'MMM dd, yyyy')}`,
      );
      if (trip.destination) {
        lines.push(`Destination:,${this.escapeCSV(trip.destination)}`);
      }
      if (trip.purpose) {
        lines.push(`Purpose:,${this.escapeCSV(trip.purpose)}`);
      }
      lines.push(`Generated:,${format(new Date(), 'MMM dd, yyyy HH:mm:ss')}`);
      lines.push(''); // Empty line
    }

    // Prepare expense data
    const expenseRows = expenses.map(expense => ({
      Date: format(new Date(expense.date), 'yyyy-MM-dd'),
      Merchant: expense.merchant || 'N/A',
      Currency: expense.currency || 'USD',
      Amount: expense.amount.toFixed(2),
      'Tax Amount': expense.tax_amount ? expense.tax_amount.toFixed(2) : '0.00',
      'Tax Type': expense.tax_type || 'None',
      'Tax Rate': expense.tax_rate ? `${expense.tax_rate.toFixed(1)}%` : '0%',
      'Has Receipt': expense.image_path ? 'Yes' : 'No',
      Notes: expense.notes || '',
    }));

    // Convert to CSV using papaparse
    const csvData = Papa.unparse(expenseRows, {
      quotes: true,
      quoteChar: '"',
      escapeChar: '"',
      delimiter: ',',
      header: true,
      newline: '\r\n',
    });

    lines.push(csvData);
    return lines.join('\r\n');
  }

  /**
   * Escape special characters for CSV
   */
  private escapeCSV(value: string): string {
    if (!value) return '';
    // Wrap in quotes if contains comma, quote, or newline
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Format amount from cents to currency string
   */
  private formatCurrency(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  /**
   * Estimate file size based on expense count
   */
  getEstimatedSize(expenses: Expense[], _includeReceipts: boolean): number {
    // Rough estimate: ~200 bytes per expense row + header overhead
    const baseSize = expenses.length * 200;
    const headerSize = 500;

    return baseSize + headerSize;
  }

  /**
   * Validate expense data before export
   */
  validateData(expenses: Expense[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (expenses.length === 0) {
      errors.push('No expenses to export');
    }

    // Check for missing data
    expenses.forEach((expense, index) => {
      if (!expense.amount || expense.amount <= 0) {
        warnings.push(`Expense ${index + 1} has invalid amount`);
      }
      if (!expense.date) {
        warnings.push(`Expense ${index + 1} is missing date`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get file extension for CSV
   */
  getFileExtension(): string {
    return 'csv';
  }
}

// Export singleton instance
export const csvExportService = new CSVExportService();
