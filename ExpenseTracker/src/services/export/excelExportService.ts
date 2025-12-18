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
    options: ExportOptions
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

      // Add Summary sheet
      const summarySheet = this.createSummarySheet(trip, expenses);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

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
    options: ExportOptions
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
      'Category',
      'Amount',
      'Tax Amount',
      'Tax Type',
      'Tax Rate',
      'Total',
      'Receipt',
      'Notes',
    ];
    data.push(headerRow);

    // Add expense rows
    expenses.forEach(expense => {
      data.push([
        format(new Date(expense.date), 'yyyy-MM-dd'),
        expense.merchant || 'N/A',
        expense.category.toString(),
        expense.amount,
        expense.tax_amount || 0,
        expense.tax_type || 'None',
        expense.tax_rate ? expense.tax_rate / 100 : 0, // Convert to decimal for Excel percentage format
        expense.amount + (expense.tax_amount || 0),
        expense.image_path ? expense.image_path.split('/').pop() : 'N/A',
        expense.notes || '',
      ]);
    });

    // Add totals row
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalTax = expenses.reduce(
      (sum, exp) => sum + (exp.tax_amount || 0),
      0
    );

    data.push([]); // Empty row
    data.push([
      '',
      '',
      'Subtotal:',
      totalAmount,
      '',
      '',
      '',
      '',
      '',
      '',
    ]);
    data.push([
      '',
      '',
      'Total Tax:',
      totalTax,
      '',
      '',
      '',
      '',
      '',
      '',
    ]);
    data.push([
      '',
      '',
      'Grand Total:',
      totalAmount + totalTax,
      '',
      '',
      '',
      '',
      '',
      '',
    ]);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, // Date
      { wch: 20 }, // Merchant
      { wch: 12 }, // Category
      { wch: 12 }, // Amount
      { wch: 12 }, // Tax Amount
      { wch: 12 }, // Tax Type
      { wch: 10 }, // Tax Rate
      { wch: 12 }, // Total
      { wch: 25 }, // Receipt
      { wch: 30 }, // Notes
    ];

    return ws;
  }

  /**
   * Create the Summary sheet
   */
  private createSummarySheet(trip: Trip, expenses: Expense[]): XLSX.WorkSheet {
    const data: any[][] = [];

    // Trip Information
    data.push(['TRIP SUMMARY']);
    data.push([]);
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
    data.push(['Number of Expenses:', expenses.length]);
    data.push([]);

    // Financial Summary
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalTax = expenses.reduce(
      (sum, exp) => sum + (exp.tax_amount || 0),
      0
    );

    data.push(['FINANCIAL SUMMARY']);
    data.push([]);
    data.push(['Subtotal:', totalAmount]);
    data.push(['Total Tax:', totalTax]);
    data.push(['Grand Total:', totalAmount + totalTax]);
    data.push([]);

    // Category Breakdown
    data.push(['CATEGORY BREAKDOWN']);
    data.push([]);
    data.push(['Category', 'Count', 'Total Amount']);

    const categoryTotals = new Map<number, number>();
    expenses.forEach(expense => {
      const current = categoryTotals.get(expense.category) || 0;
      categoryTotals.set(expense.category, current + expense.amount);
    });

    categoryTotals.forEach((total, category) => {
      const count = expenses.filter(e => e.category === category).length;
      data.push([`Category ${category}`, count, total]);
    });

    data.push([]);

    // Tax Breakdown
    data.push(['TAX BREAKDOWN']);
    data.push([]);
    data.push(['Tax Type', 'Count', 'Total Tax']);

    const taxTotals = new Map<string, number>();
    expenses.forEach(expense => {
      if (expense.tax_type && expense.tax_amount) {
        const current = taxTotals.get(expense.tax_type) || 0;
        taxTotals.set(expense.tax_type, current + expense.tax_amount);
      }
    });

    taxTotals.forEach((total, taxType) => {
      const count = expenses.filter(e => e.tax_type === taxType).length;
      data.push([taxType, count, total]);
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, // First column
      { wch: 15 }, // Second column
      { wch: 15 }, // Third column
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
