/**
 * PDF Export Service
 * Generates PDF files with expense data and receipt images
 */

import { generatePDF } from 'react-native-html-to-pdf';
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

export class PDFExportService implements ExportService {
  /**
   * Generate a PDF export for a trip
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

      // Generate HTML content
      const htmlContent = await this.generateHTMLContent(trip, expenses, options);

      // Generate PDF from HTML
      const filename = generateFilename(trip.name, ExportFormat.PDF);

      // Generate PDF in temp location first
      const pdfOptions = {
        html: htmlContent,
        fileName: filename.replace('.pdf', ''),
        base64: false,
      };

      const pdf = await generatePDF(pdfOptions);

      if (!pdf.filePath) {
        throw new Error('PDF generation failed - no file path returned');
      }

      // Move PDF to the correct export directory
      const directory = await getExportDirectory();
      const targetPath = `${directory}/${filename}`;

      // Copy the file to the target location
      await RNFS.moveFile(pdf.filePath, targetPath);

      // Get file size
      const fileSize = await getFileSize(targetPath);

      return {
        success: true,
        filePath: targetPath,
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
   * Generate HTML content for PDF
   */
  private async generateHTMLContent(
    trip: Trip,
    expenses: Expense[],
    options: ExportOptions,
  ): Promise<string> {
    // Group totals by currency
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

    // Generate receipt images section if requested
    let receiptSection = '';
    if (options.includeReceipts) {
      receiptSection = await this.generateReceiptSection(expenses);
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #4472C4;
      padding-bottom: 15px;
    }
    .header h1 {
      color: #4472C4;
      margin: 10px 0;
    }
    .header p {
      margin: 5px 0;
      color: #666;
    }
    .info-section {
      margin-bottom: 20px;
    }
    .info-section p {
      margin: 5px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background-color: #4472C4;
      color: white;
      padding: 10px;
      text-align: left;
      font-weight: bold;
    }
    td {
      padding: 8px;
      border-bottom: 1px solid #ddd;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .totals {
      margin-top: 20px;
      text-align: right;
      font-weight: bold;
    }
    .totals p {
      margin: 5px 0;
    }
    .grand-total {
      font-size: 1.2em;
      color: #4472C4;
      padding-top: 10px;
      border-top: 2px solid #4472C4;
    }
    .receipt-section {
      margin-top: 30px;
    }
    .receipt-item {
      page-break-inside: avoid;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e0e0e0;
    }
    .receipt-item:last-child {
      border-bottom: none;
    }
    .receipt-item h3 {
      color: #4472C4;
      font-size: 1em;
      margin-bottom: 8px;
    }
    .receipt-item p {
      margin: 3px 0;
      font-size: 0.9em;
    }
    .receipt-item img {
      max-width: 400px;
      width: 100%;
      height: auto;
      border: 1px solid #ddd;
      margin: 10px 0;
      display: block;
    }
    .footer {
      margin-top: 30px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${this.escapeHTML(trip.name)}</h1>
    <p><strong>Trip Dates:</strong> ${format(new Date(trip.start_date), 'MMM dd, yyyy')} - ${format(new Date(trip.end_date), 'MMM dd, yyyy')}</p>
    ${trip.destination ? `<p><strong>Destination:</strong> ${this.escapeHTML(trip.destination)}</p>` : ''}
    ${trip.purpose ? `<p><strong>Purpose:</strong> ${this.escapeHTML(trip.purpose)}</p>` : ''}
  </div>

  <div class="info-section">
    <p><strong>Number of Expenses:</strong> ${expenses.length}</p>
    <p><strong>Report Generated:</strong> ${format(new Date(), 'MMM dd, yyyy HH:mm:ss')}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Date</th>
        <th>Merchant</th>
        <th>Currency</th>
        <th>Amount</th>
        <th>Tax</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${expenses
        .map(
          (expense, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${format(new Date(expense.date), 'MMM dd, yyyy')}</td>
          <td>${this.escapeHTML(expense.merchant || 'N/A')}</td>
          <td>${expense.currency || 'USD'}</td>
          <td>${expense.amount.toFixed(2)}</td>
          <td>${expense.tax_amount ? expense.tax_amount.toFixed(2) : '0.00'}</td>
          <td>${(expense.amount + (expense.tax_amount || 0)).toFixed(2)}</td>
        </tr>
      `,
        )
        .join('')}
    </tbody>
  </table>

  <div class="totals">
    ${Object.entries(currencyTotals)
      .map(
        ([currency, totals]) => `
      <p><strong>${currency} Subtotal:</strong> ${totals.amount.toFixed(2)}</p>
      <p><strong>${currency} Tax:</strong> ${totals.tax.toFixed(2)}</p>
      <p class="grand-total">${currency} Total: ${(totals.amount + totals.tax).toFixed(2)}</p>
      ${Object.keys(currencyTotals).length > 1 ? '<br/>' : ''}
    `,
      )
      .join('')}
  </div>

  ${receiptSection}

  <div class="footer">
    <p>Generated by Expense Tracker | ${format(new Date(), 'MMM dd, yyyy')}</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate receipt images section
   */
  private async generateReceiptSection(expenses: Expense[]): Promise<string> {
    const receipts: string[] = [];

    for (let i = 0; i < expenses.length; i++) {
      const expense = expenses[i];
      if (expense.image_path) {
        try {
          const exists = await RNFS.exists(expense.image_path);
          if (exists) {
            // Read image as base64
            const base64Image = await RNFS.readFile(expense.image_path, 'base64');
            const imageExt = expense.image_path.split('.').pop()?.toLowerCase();
            const mimeType = imageExt === 'png' ? 'image/png' : 'image/jpeg';

            receipts.push(`
              <div class="receipt-item">
                <h3>Receipt #${i + 1} - ${this.escapeHTML(expense.merchant || 'N/A')}</h3>
                <p><strong>Date:</strong> ${format(new Date(expense.date), 'MMM dd, yyyy')}</p>
                <p><strong>Amount:</strong> ${(expense.amount + (expense.tax_amount || 0)).toFixed(2)} ${expense.currency || 'USD'}</p>
                <img src="data:${mimeType};base64,${base64Image}" alt="Receipt ${i + 1}" />
              </div>
            `);
          }
        } catch (error) {
          console.warn(`Could not load receipt image: ${expense.image_path}`, error);
        }
      }
    }

    if (receipts.length === 0) {
      return '';
    }

    return `
      <div class="receipt-section">
        <h2>Receipt Images</h2>
        ${receipts.join('')}
      </div>
    `;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHTML(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Format amount from cents to currency string
   */
  /* Unused helper - may be used for future enhancements
  private _formatCurrency(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }
  */

  /**
   * Estimate file size based on expense count and receipts
   */
  getEstimatedSize(expenses: Expense[], includeReceipts: boolean): number {
    // Base PDF size: ~50KB
    let estimatedSize = 50000;

    // Add ~5KB per expense row
    estimatedSize += expenses.length * 5000;

    // If including receipts, add estimated image sizes
    if (includeReceipts) {
      // Rough estimate: 200KB per receipt after compression
      const receiptCount = expenses.filter(e => e.image_path).length;
      estimatedSize += receiptCount * 200000;
    }

    return estimatedSize;
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
   * Get file extension for PDF
   */
  getFileExtension(): string {
    return 'pdf';
  }
}

// Export singleton instance
export const pdfExportService = new PDFExportService();
