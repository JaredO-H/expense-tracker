/**
 * Database type definitions for ExpenseTracker
 */

export enum TaxType {
  GST = 'GST',
  HST = 'HST',
  PST = 'PST',
  VAT = 'VAT',
  SALES_TAX = 'sales_tax',
  OTHER = 'other',
  NONE = 'none',
}

export interface ExpenseCategory {
  id: number;
  name: string;
  type: 'standard' | 'custom';
  icon_name?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Trip {
  id: number;
  name: string;
  start_date: string; // ISO 8601 date string
  end_date: string; // ISO 8601 date string
  destination?: string;
  purpose?: string;
  default_currency?: string; // ISO 4217 currency code (e.g., USD, EUR, GBP)
  status?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: number;
  trip_id?: number; // Nullable for unassigned expenses
  image_path?: string;
  thumbnail_path?: string;
  merchant?: string;
  amount: number; // Stored as cents to avoid floating point issues
  currency?: string;
  tax_amount?: number; // Stored as cents
  tax_type?: TaxType;
  tax_rate?: number; // Percentage (e.g., 13.0 for 13%)
  date: string; // ISO 8601 date string
  time?: string; // ISO 8601 time string
  category: number; // category_id foreign key
  processed: boolean; // Whether AI processing is complete
  ai_service_used?: string; // Which AI service processed this (openai, anthropic, gemini, mlkit)
  capture_method: string; // 'ai_service', 'offline_ocr', 'manual'
  verification_status: string; // 'pending', 'verified', 'edited'
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Extended types with joined data
export interface ExpenseWithDetails extends Expense {
  trip_name?: string;
  trip_destination?: string;
  trip_start_date?: string;
  trip_end_date?: string;
  category_name: string;
  category_icon?: string;
}

export interface TripWithStats extends Trip {
  expense_count: number;
  total_amount: number;
}

export interface CategoryBreakdown {
  category_id: number;
  category_name: string;
  category_icon?: string;
  expense_count: number;
  total_amount: number;
  avg_amount: number;
}

// Input types for creating new records (without id and timestamps)
export interface CreateTripModel {
  name: string;
  start_date: string;
  end_date: string;
  destination?: string;
  purpose?: string;
  default_currency?: string;
}

export interface CreateExpenseModel {
  trip_id?: number;
  image_path?: string;
  merchant?: string;
  amount: number;
  currency?: string;
  tax_amount?: number;
  tax_type?: TaxType;
  tax_rate?: number;
  date: string;
  time?: string;
  category: number;
  notes?: string;
  processed?: boolean;
  ai_service_used?: string;
  capture_method?: string; // 'ai_service', 'offline_ocr', 'manual';
  verification_status?: string; // 'pending', 'verified', 'edited'
}

// Update types (all fields optional except id)
export interface UpdateTripModel {
  id: number;
  name?: string;
  start_date?: string;
  end_date?: string;
  destination?: string;
  purpose?: string;
  default_currency?: string;
}

export interface UpdateExpenseModel {
  id: number;
  trip_id?: number;
  image_path?: string;
  merchant?: string;
  amount?: number;
  currency?: string;
  tax_amount?: number;
  tax_type?: TaxType;
  tax_rate?: number;
  date?: string;
  time?: string;
  category?: number;
  notes?: string;
  ai_service_used?: string;
  capture_method?: string;
}

// Database configuration interface
export interface DatabaseConfig {
  name: string;
  version: number;
}
