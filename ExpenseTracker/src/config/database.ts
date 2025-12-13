/**
 * Database configuration and schema definitions for ExpenseTracker
 */

import { DatabaseConfig } from '../types/database';

// Database configuration
export const DB_CONFIG: DatabaseConfig = {
  name: 'ExpenseTracker.db',
  version: 1,
};

// SQL Schema Definitions

/**
 * Trips table schema
 * Stores business trip information
 */
export const CREATE_TRIP_TABLE = `
    CREATE TABLE IF NOT EXISTS trip (
       trip_id INTEGER PRIMARY KEY AUTOINCREMENT,
       trip_name TEXT NOT NULL,
       start_date TEXT NOT NULL, -- We'll store this in ISO 8601 format: YYYY-MM-DD
       end_date TEXT NOT NULL,
       destination TEXT,
       business_purpose TEXT,
       status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'archived')),
       notes TEXT,
       created_at TEXT NOT NULL DEFAULT (datetime('now')),
       updated_at TEXT
    );

`;

export const CREATE_TRIP_DATE_INDEX = `
    CREATE INDEX IF NOT EXISTS idx_trip_date ON trip(start_date, end_date);
`;

/**
 * Trigger to automatically update updated_at timestamp for trips
 */
export const CREATE_TRIP_UPDATE_TRIGGER = `
    CREATE TRIGGER IF NOT EXISTS trip_updated_at
    AFTER UPDATE ON trip
    FOR EACH ROW
    BEGIN
      UPDATE trip SET updated_at = datetime('now') WHERE trip_id = OLD.trip_id;
    END;
`;

export const CREATE_EXPENSE_CATEGORY_TABLE = `
  CREATE TABLE IF NOT EXISTS  expense_category (
     category_id INTEGER PRIMARY KEY,
     category_name TEXT UNIQUE NOT NULL,
     category_type TEXT DEFAULT 'standard' CHECK(category_type IN ('standard', 'custom')),
     icon_name TEXT,
     sort_order INTEGER DEFAULT 0,
     is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
     created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

export const CREATE_EXPENSE_CATEGORY_DEFAULT_VALUES = `
    INSERT OR IGNORE INTO expense_category
    (category_id, category_name, category_type, icon_name, sort_order) VALUES
       (1, 'Meals', 'standard', 'utensils', 1),
       (2, 'Transportation', 'standard', 'car', 2),
       (3, 'Accommodation', 'standard', 'hotel', 3),
       (4, 'Office Supplies', 'standard', 'briefcase', 4),
       (5, 'Entertainment', 'standard', 'film', 5),
       (6, 'Communication', 'standard', 'phone', 6),
       (7, 'Other', 'standard', 'tag', 7),
       (8, 'Uncategorized', 'standard', 'help-circle', 99);
`;

export const CREATE_EXPENSE_CATEGORY_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_expense_category ON expense_category(category_id);
`;

/**
 * Expenses table schema
 * Stores individual expense records linked to trips
 * Amounts stored as integers (cents) to avoid floating poINTEGER precision issues
 */
export const CREATE_EXPENSE_TABLE = `
  CREATE TABLE IF NOT EXISTS expense (
     expense_id INTEGER PRIMARY KEY AUTOINCREMENT,
     trip_id INT,
     merchant_name TEXT NOT NULL,
     total_amount REAL NOT NULL CHECK(total_amount >= 0),
     currency TEXT DEFAULT 'GBP' CHECK(length(currency) = 3),
     tax_amount REAL CHECK(tax_amount >= 0),
     tax_type TEXT,
     tax_rate REAL CHECK(tax_rate >= 0 AND tax_rate <= 100),
     expense_date TEXT NOT NULL,
     expense_time TEXT,
     category_id INTEGER NOT NULL DEFAULT 8, -- Uncategorised
     payment_method TEXT, -- cash, credit_card, debit_card, corporate_card
     description TEXT,
     notes TEXT,
     data_capture_method TEXT NOT NULL CHECK(data_capture_method IN ('ai_service', 'offline_ocr', 'manual')),
     ai_service_used TEXT,
     verification_status TEXT DEFAULT 'pending' CHECK(verification_status IN ('pending', 'verified', 'edited')),
     receipt_path TEXT NOT NULL,
     receipt_thumbnail_path TEXT,
     created_at TEXT NOT NULL DEFAULT (datetime('now')),
     updated_at TEXT NOT NULL DEFAULT (datetime('now')),
     FOREIGN KEY (trip_id) REFERENCES trip(trip_id) ON DELETE RESTRICT,
     FOREIGN KEY (category_id) REFERENCES expense_category(category_id) ON DELETE RESTRICT
  );

`;

export const CREATE_EXPENSE_TRIP_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_expense_trip_id ON expense(trip_id);
`;

export const CREATE_EXPENSE_DATE_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_expense_date ON expense(expense_date);
`;

/**
 * Trigger to automatically update updated_at timestamp for expenses
 */
export const CREATE_EXPENSE_UPDATE_TRIGGER = `
  CREATE TRIGGER IF NOT EXISTS expense_updated_at
  AFTER UPDATE ON expense
  FOR EACH ROW
  BEGIN
    UPDATE expense SET updated_at = datetime('now') WHERE expense_id = OLD.expense_id;
  END;
`;

export const CREATE_CATEGORISATION_RULE_TABLE = `
  CREATE TABLE IF NOT EXISTS categorisation_rule (
     rule_id INTEGER PRIMARY KEY AUTOINCREMENT,
     category_id INTEGER NOT NULL,
     merchant_pattern TEXT NOT NULL, -- Pattern to match merchant names
     priority INTEGER DEFAULT 0, -- Higher priority rules checked first
     is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
     match_count INTEGER DEFAULT 0, -- Track rule usage
     created_at TEXT NOT NULL DEFAULT (datetime('now')),
     FOREIGN KEY (category_id) REFERENCES expense_category(category_id) ON DELETE CASCADE
  );

`;

export const CREATE_CATEGORISATION_RULE_DEFAULT_VALUES = `
    INSERT OR IGNORE INTO categorisation_rule (rule_id, category_id, merchant_pattern, priority) VALUES
        (1, 1 , '%restaurant%', 10),
        (2, 1 , '%cafe%', 10),
        (3, 1 , '%coffee%', 10),
        (4, 2 , '%uber%', 10),
        (5, 2 , '%taxi%', 10),
        (6, 2 , '%airline%', 10),
        (7, 2 , '%rental%', 10),
        (8, 3 , '%hotel%', 10),
        (9, 3 , '%inn%', 10);
`;

export const CREATE_CATEGORISATION_RULE_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_categorisation_rule_id ON categorisation_rule(rule_id);
`;

export const CREATE_PROCESSING_QUEUE_TABLE = `
    CREATE TABLE IF NOT EXISTS processing_queue (
       queue_id INTEGER PRIMARY KEY AUTOINCREMENT,
       expense_id INTEGER NOT NULL,
       receipt_path TEXT NOT NULL,
       processing_status TEXT DEFAULT 'pending' CHECK(processing_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
       preferred_service TEXT, -- chatgpt, claude, gemini
       retry_count INTEGER DEFAULT 0,
       last_error TEXT,
       queued_at TEXT NOT NULL DEFAULT (datetime('now')),
       started_at TEXT,
       completed_at TEXT,
       priority INTEGER DEFAULT 0, -- Higher numbers = higher priority
       FOREIGN KEY (expense_id) REFERENCES expense(expense_id) ON DELETE CASCADE
    );

`;

export const CREATE_PROCESSING_QUEUE_INDEX = `
    CREATE INDEX IF NOT EXISTS idx_processing_queue_id ON processing_queue(queue_id);
`;

export const CREATE_USER_SETTING_TABLE = `
    CREATE TABLE IF NOT EXISTS user_setting (
       setting_key TEXT PRIMARY KEY,
       setting_value TEXT NOT NULL,
       data_type TEXT DEFAULT 'string' CHECK(data_type IN ('string', 'number', 'boolean', 'json')),
       updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

`;

export const CREATE_USER_SETTING_DEFAULT_VALUES = `
    INSERT OR IGNORE INTO user_setting (setting_key, setting_value, data_type) VALUES
        ('default_ai_service', 'chatgpt', 'string'),
        ('default_currency', 'GBP', 'string'),
        ('enable_offline_ocr', 'true', 'boolean'),
        ('auto_process_queue', 'true', 'boolean'),
        ('batch_processing_limit', '10', 'number'),
        ('default_payment_method', 'credit_card', 'string'),
        ('camera_quality', 'high', 'string'),
        ('enable_auto_categorization', 'true', 'boolean');
`;

export const CREATE_USER_SETTING_INDEX = `
    CREATE INDEX IF NOT EXISTS idx_user_setting_key ON user_setting(setting_key);
`;

/**
 * Database metadata table for version tracking and migrations
 */
export const CREATE_METADATA_TABLE = `
  CREATE TABLE IF NOT EXISTS db_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

/**
 * All initialization SQL statements in order
 */
export const INITIALIZATION_STATEMENTS = [
  CREATE_TRIP_TABLE,
  CREATE_TRIP_DATE_INDEX,
  CREATE_TRIP_UPDATE_TRIGGER,
  CREATE_EXPENSE_CATEGORY_TABLE,
  CREATE_EXPENSE_CATEGORY_DEFAULT_VALUES,
  CREATE_EXPENSE_CATEGORY_INDEX,
  CREATE_EXPENSE_TABLE,
  CREATE_EXPENSE_TRIP_INDEX,
  CREATE_EXPENSE_DATE_INDEX,
  CREATE_EXPENSE_UPDATE_TRIGGER,
  CREATE_CATEGORISATION_RULE_TABLE,
  CREATE_CATEGORISATION_RULE_DEFAULT_VALUES,
  CREATE_CATEGORISATION_RULE_INDEX,
  CREATE_PROCESSING_QUEUE_TABLE,
  CREATE_PROCESSING_QUEUE_INDEX,
  CREATE_USER_SETTING_TABLE,
  CREATE_USER_SETTING_DEFAULT_VALUES,
  CREATE_USER_SETTING_INDEX,
  CREATE_METADATA_TABLE,
];
