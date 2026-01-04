/**
 * Excel Export Service
 * Generates XLSX files with formatted expense data
 */

import * as XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import { format } from 'date-fns';
import {
  ExportService,
  ExportResult,
  ValidationResult,
  ExportOptions,
  ExportFormat,
} from '../../types/export';
import { Expense, Trip } from '../../types/database';
import { generateFilename, getExportDirectory, getFileSize } from './fileManager';

export class ExcelExportService implements ExportService {
  /**
   * Generate an Excel export for a trip
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

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Add Expenses sheet
      const expensesSheet = this.createExpensesSheet(trip, expenses, options);
      XLSX.utils.book_append_sheet(workbook, expensesSheet, 'Expenses');

      // Generate Excel file as base64
      const wbout = XLSX.write(workbook, {
        type: 'base64',
        bookType: 'xlsx',
      });

      // Save to file
      const directory = await getExportDirectory();
      const filename = generateFilename(trip.name, ExportFormat.EXCEL);
      const filePath = `${directory}/${filename}`;

      await RNFS.writeFile(filePath, wbout, 'base64');

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
   * Create the Expenses sheet
   */
  private createExpensesSheet(
    trip: Trip,
    expenses: Expense[],
    options: ExportOptions,
  ): XLSX.WorkSheet {
    const data: any[][] = [];

    // Add header rows if requested
    if (options.includeHeader) {
      data.push(['Trip Name:', trip.name]);
      data.push([
        'Trip Dates:',
        `${format(new Date(trip.start_date), 'MMM dd, yyyy')} - ${format(new Date(trip.end_date), 'MMM dd, yyyy')}`,
      ]);
      if (trip.destination) {
        data.push(['Destination:', trip.destination]);
      }
      if (trip.purpose) {
        data.push(['Purpose:', trip.purpose]);
      }
      data.push(['Generated:', format(new Date(), 'MMM dd, yyyy HH:mm:ss')]);
      data.push([]); // Empty row
    }

    // Add column headers
    const headerRow = [
      'Date',
      'Merchant',
      'Currency',
      'Amount',
      'Tax Amount',
      'Tax Type',
      'Tax Rate',
      'Total',
      'Has Receipt',
      'Notes',
    ];
    data.push(headerRow);

    // Add expense rows
    expenses.forEach(expense => {
      data.push([
        format(new Date(expense.date), 'yyyy-MM-dd'),
        expense.merchant || 'N/A',
        expense.currency || 'USD',
        expense.amount,
        expense.tax_amount || 0,
        expense.tax_type || 'None',
        expense.tax_rate ? expense.tax_rate / 100 : 0, // Convert to decimal for Excel percentage format
        expense.amount + (expense.tax_amount || 0),
        expense.image_path ? 'Yes' : 'No',
        expense.notes || '',
      ]);
    });

    // Add totals grouped by currency
    const currencyTotals = expenses.reduce(
      (acc, exp) => {
        const currency = exp.currency || 'USD';
        if (!acc[currency]) {
          acc[currency] = { amount: 0, tax: 0 };
        }
        acc[currency].amount += exp.amount;
        acc[currency].tax += exp.tax_amount || 0;
        return acc;
      },
      {} as Record<string, { amount: number; tax: number }>,
    );

    data.push([]); // Empty row
    Object.entries(currencyTotals).forEach(([currency, totals]) => {
      data.push(['', `${currency} Subtotal:`, '', totals.amount, '', '', '', '', '', '']);
      data.push(['', `${currency} Tax:`, '', totals.tax, '', '', '', '', '', '']);
      data.push(['', `${currency} Total:`, '', totals.amount + totals.tax, '', '', '', '', '', '']);
      if (Object.keys(currencyTotals).length > 1) {
        data.push([]); // Add spacing between different currencies
      }
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, // Date
      { wch: 20 }, // Merchant
      { wch: 10 }, // Currency
      { wch: 12 }, // Amount
      { wch: 12 }, // Tax Amount
      { wch: 12 }, // Tax Type
      { wch: 10 }, // Tax Rate
      { wch: 12 }, // Total
      { wch: 12 }, // Has Receipt
      { wch: 30 }, // Notes
    ];

    return ws;
  }

  /**
   * Estimate file size based on expense count
   */
  getEstimatedSize(expenses: Expense[], _includeReceipts: boolean): number {
    // Rough estimate: ~1KB per expense row + base workbook size
    const baseSize = 10000; // 10KB for workbook structure
    const rowSize = expenses.length * 1000;

    return baseSize + rowSize;
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
   * Get file extension for Excel
   */
  getFileExtension(): string {
    return 'xlsx';
  }
}

// Export singleton instance
export const excelExportService = new ExcelExportService();
