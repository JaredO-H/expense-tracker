/**
 * AI Processing Types
 * Types for AI-powered receipt processing results
 */

export interface ReceiptProcessingResult {
  merchant?: string;
  amount?: number;
  tax_amount?: number;
  tax_type?: string;
  tax_rate?: number;
  date?: string;
  time?: string;
  category?: number;
  notes?: string;
  confidence: number;
  processingTime: number;
}
