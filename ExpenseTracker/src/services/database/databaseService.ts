/**
 * Database Service Layer
 * Provides CRUD operations for trips and expenses with proper error handling
 */

import { getDatabase } from './databaseInit';
import {
  Trip,
  CreateTripModel,
  UpdateTripModel,
  Expense,
  CreateExpenseModel,
  UpdateExpenseModel,
  ExpenseCategory,
  ExpenseWithDetails,
  TripWithStats,
  CategoryBreakdown,
} from '../../types/database';

/**
 * Database Service Class
 * Singleton service for all database operations
 */
class DatabaseService {
  /**
   * Trip Operations
   */

  /**
   * Create a new trip
   */
  async createTrip(model: CreateTripModel): Promise<Trip> {
    try {
      const db = getDatabase();

      // Validate dates
      if (new Date(model.end_date) < new Date(model.start_date)) {
        throw new Error('End date cannot be before start date');
      }

      const result = await db.executeSql(
        `INSERT INTO trip (trip_name, start_date, end_date, destination, business_purpose, default_currency)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          model.name,
          model.start_date,
          model.end_date,
          model.destination || null,
          model.purpose || null,
          model.default_currency || 'USD',
        ],
      );

      const tripId = result[0].insertId;

      if (!tripId) {
        throw new Error('Failed to create trip - no ID returned');
      }

      // Fetch and return the created trip
      const createdTrip = await this.getTripById(tripId);
      if (!createdTrip) {
        throw new Error('Failed to retrieve created trip');
      }

      return createdTrip;
    } catch (error) {
      console.error('Error creating trip:', error);
      throw new Error(
        `Failed to create trip: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get a trip by ID
   */
  async getTripById(id: number): Promise<Trip | null> {
    try {
      const db = getDatabase();

      const result = await db.executeSql('SELECT * FROM trip WHERE trip_id = ?', [id]);

      if (result[0].rows.length === 0) {
        return null;
      }

      return this.mapTripFromDatabaseRow(result[0].rows.item(0));
    } catch (error) {
      console.error('Error getting trip by ID:', error);
      throw new Error(
        `Failed to get trip: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get all trips, optionally filtered by status
   */
  async getAllTrips(status?: 'active' | 'completed' | 'archived'): Promise<Trip[]> {
    try {
      const db = getDatabase();

      let query = 'SELECT * FROM trip';
      const params: string[] = [];

      if (status) {
        query += ' WHERE status = ?';
        params.push(status);
      }

      query += ' ORDER BY start_date DESC';

      const result = await db.executeSql(query, params);

      const trips: Trip[] = [];
      for (let i = 0; i < result[0].rows.length; i++) {
        trips.push(this.mapTripFromDatabaseRow(result[0].rows.item(i)));
      }

      return trips;
    } catch (error) {
      console.error('Error getting all trips:', error);
      throw new Error(
        `Failed to get trips: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get all trips with expense statistics (count and total amount)
   * Uses LEFT JOIN to include trips with no expenses
   */
  async getAllTripsWithStats(
    status?: 'active' | 'completed' | 'archived',
  ): Promise<TripWithStats[]> {
    try {
      const db = getDatabase();

      let query = `
        SELECT
          t.*,
          COUNT(e.expense_id) as expense_count,
          COALESCE(SUM(e.total_amount), 0) as total_amount
        FROM trip t
        LEFT JOIN expense e ON t.trip_id = e.trip_id
      `;

      const params: string[] = [];

      if (status) {
        query += ' WHERE t.status = ?';
        params.push(status);
      }

      query += ' GROUP BY t.trip_id ORDER BY t.start_date DESC';

      const result = await db.executeSql(query, params);

      const trips: TripWithStats[] = [];
      for (let i = 0; i < result[0].rows.length; i++) {
        trips.push(this.mapTripWithStatsFromDatabaseRow(result[0].rows.item(i)));
      }

      return trips;
    } catch (error) {
      console.error('Error getting trips with stats:', error);
      throw new Error(
        `Failed to get trips with stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Update an existing trip
   */
  async updateTrip(model: UpdateTripModel): Promise<Trip> {
    try {
      const db = getDatabase();

      // Check if trip exists
      const existingTrip = await this.getTripById(model.id);
      if (!existingTrip) {
        throw new Error(`Trip with ID ${model.id} not found`);
      }

      // Build dynamic update query
      const updates: string[] = [];
      const params: (string | number)[] = [];

      if (model.name !== undefined) {
        updates.push('trip_name = ?');
        params.push(model.name);
      }
      if (model.start_date !== undefined) {
        updates.push('start_date = ?');
        params.push(model.start_date);
      }
      if (model.end_date !== undefined) {
        updates.push('end_date = ?');
        params.push(model.end_date);
      }
      if (model.destination !== undefined) {
        updates.push('destination = ?');
        params.push(model.destination);
      }
      if (model.purpose !== undefined) {
        updates.push('business_purpose = ?');
        params.push(model.purpose);
      }
      if (model.default_currency !== undefined) {
        updates.push('default_currency = ?');
        params.push(model.default_currency);
      }

      if (updates.length === 0) {
        return existingTrip;
      }

      params.push(model.id);

      await db.executeSql(`UPDATE trip SET ${updates.join(', ')} WHERE trip_id = ?`, params);

      // Fetch and return the updated trip
      const updatedTrip = await this.getTripById(model.id);
      if (!updatedTrip) {
        throw new Error('Failed to retrieve updated trip');
      }

      return updatedTrip;
    } catch (error) {
      console.error('Error updating trip:', error);
      throw new Error(
        `Failed to update trip: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Delete a trip by ID
   * Will fail if there are expenses associated with this trip due to ON DELETE RESTRICT constraint
   * To delete a trip with expenses, either delete the expenses first or reassign them to another trip
   */
  async deleteTrip(id: number): Promise<void> {
    try {
      const db = getDatabase();

      // Check if trip exists
      const existingTrip = await this.getTripById(id);
      if (!existingTrip) {
        throw new Error(`Trip with ID ${id} not found`);
      }

      // Check if there are any expenses associated with this trip
      const expenseCheck = await db.executeSql(
        'SELECT COUNT(*) as count FROM expense WHERE trip_id = ?',
        [id],
      );

      const expenseCount = expenseCheck[0].rows.item(0).count;

      if (expenseCount > 0) {
        throw new Error(
          `Cannot delete trip: ${expenseCount} expense(s) are associated with this trip. ` +
            `Please delete or reassign the expenses first.`,
        );
      }

      await db.executeSql('DELETE FROM trip WHERE trip_id = ?', [id]);
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw new Error(
        `Failed to delete trip: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Helper method to map database row to Trip object
   */
  private mapTripFromDatabaseRow(row: any): Trip {
    return {
      id: row.trip_id,
      name: row.trip_name,
      start_date: row.start_date,
      end_date: row.end_date,
      destination: row.destination,
      purpose: row.business_purpose,
      default_currency: row.default_currency,
      status: row.status,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  /**
   * Helper method to map database row with JOIN data to TripWithStats object
   */
  private mapTripWithStatsFromDatabaseRow(row: any): TripWithStats {
    return {
      id: row.trip_id,
      name: row.trip_name,
      start_date: row.start_date,
      end_date: row.end_date,
      destination: row.destination,
      purpose: row.business_purpose,
      default_currency: row.default_currency,
      status: row.status,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
      // Aggregated statistics
      expense_count: row.expense_count,
      total_amount: parseFloat(row.total_amount) || 0,
    };
  }

  /*
   * Expense Operations
   */

  async createExpense(model: CreateExpenseModel): Promise<Expense> {
    try {
      const db = getDatabase();

      const result = await db.executeSql(
        `INSERT INTO Expense (trip_id, receipt_path, merchant_name, total_amount, tax_amount, tax_type, tax_rate, expense_date, expense_time, category_id, ai_service_used, data_capture_method, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

        [
          model.trip_id,
          model.image_path || '',
          model.merchant || null,
          model.amount,
          model.tax_amount || null,
          model.tax_type || null,
          model.tax_rate || null,
          model.date,
          model.time || null,
          model.category,
          model.ai_service_used || null,
          model.capture_method,
          model.notes || null,
        ],
      );

      const expenseId = result[0].insertId;

      if (!expenseId) {
        throw new Error('Failed to create expense - no ID returned');
      }

      // Fetch and return the created expense
      const createdExpense = await this.getExpenseById(expenseId);
      if (!createdExpense) {
        throw new Error('Failed to retrieve created expense');
      }

      return createdExpense;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw new Error(
        `Failed to create expense: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /*
   * Get a trip by ID
   */
  async getExpenseById(id: number): Promise<Expense | null> {
    try {
      const db = getDatabase();

      const result = await db.executeSql('SELECT * FROM expense WHERE expense_id = ?', [id]);

      if (result[0].rows.length === 0) {
        return null;
      }

      return this.mapExpenseFromDatabaseRow(result[0].rows.item(0));
    } catch (error) {
      console.error('Error getting expense by ID:', error);
      throw new Error(
        `Failed to get expense: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getAllExpenses(trip_id?: number): Promise<Expense[]> {
    try {
      const db = getDatabase();

      let query = 'SELECT * FROM expense';
      const params: string[] = [];

      if (trip_id) {
        query += ' WHERE trip_id = ?';
        params.push(trip_id.toString());
      }

      query += ' ORDER BY expense_date DESC';

      const result = await db.executeSql(query, params);

      const expenses: Expense[] = [];
      for (let i = 0; i < result[0].rows.length; i++) {
        expenses.push(this.mapExpenseFromDatabaseRow(result[0].rows.item(i)));
      }

      return expenses;
    } catch (error) {
      console.error('Error getting all expenses:', error);
      throw new Error(
        `Failed to get expenses: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get all expenses with joined trip and category details
   */
  async getAllExpensesWithDetails(trip_id?: number): Promise<ExpenseWithDetails[]> {
    try {
      const db = getDatabase();

      let query = `
        SELECT
          e.*,
          t.trip_name,
          t.destination as trip_destination,
          t.start_date as trip_start_date,
          t.end_date as trip_end_date,
          c.category_name,
          c.icon_name as category_icon
        FROM expense e
        LEFT JOIN trip t ON e.trip_id = t.trip_id
        INNER JOIN expense_category c ON e.category_id = c.category_id
      `;

      const params: string[] = [];

      if (trip_id) {
        query += ' WHERE e.trip_id = ?';
        params.push(trip_id.toString());
      }

      query += ' ORDER BY e.expense_date DESC';

      const result = await db.executeSql(query, params);

      const expenses: ExpenseWithDetails[] = [];
      for (let i = 0; i < result[0].rows.length; i++) {
        expenses.push(this.mapExpenseWithDetailsFromDatabaseRow(result[0].rows.item(i)));
      }

      return expenses;
    } catch (error) {
      console.error('Error getting expenses with details:', error);
      throw new Error(
        `Failed to get expenses with details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get a single expense with all related details
   * Uses JOIN to fetch trip and category info in one query
   */
  async getExpenseWithDetails(id: number): Promise<ExpenseWithDetails | null> {
    try {
      const db = getDatabase();

      const result = await db.executeSql(
        `SELECT
          e.*,
          t.trip_name,
          t.destination as trip_destination,
          t.start_date as trip_start_date,
          t.end_date as trip_end_date,
          c.category_name,
          c.icon_name as category_icon
        FROM expense e
        LEFT JOIN trip t ON e.trip_id = t.trip_id
        INNER JOIN expense_category c ON e.category_id = c.category_id
        WHERE e.expense_id = ?`,
        [id],
      );

      if (result[0].rows.length === 0) {
        return null;
      }

      return this.mapExpenseWithDetailsFromDatabaseRow(result[0].rows.item(0));
    } catch (error) {
      console.error('Error getting expense with details:', error);
      throw new Error(
        `Failed to get expense with details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Search expenses across merchant name, category, and notes
   * Uses JOIN to enable filtering on related tables
   */
  async searchExpenses(searchTerm: string, tripId?: number): Promise<ExpenseWithDetails[]> {
    try {
      const db = getDatabase();

      let query = `
        SELECT
          e.*,
          t.trip_name,
          t.destination as trip_destination,
          t.start_date as trip_start_date,
          t.end_date as trip_end_date,
          c.category_name,
          c.icon_name as category_icon
        FROM expense e
        LEFT JOIN trip t ON e.trip_id = t.trip_id
        INNER JOIN expense_category c ON e.category_id = c.category_id
        WHERE (
          e.merchant_name LIKE ?
          OR c.category_name LIKE ?
          OR e.notes LIKE ?
        )
      `;

      const params: string[] = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];

      if (tripId) {
        query += ' AND e.trip_id = ?';
        params.push(tripId.toString());
      }

      query += ' ORDER BY e.expense_date DESC';

      const result = await db.executeSql(query, params);

      const expenses: ExpenseWithDetails[] = [];
      for (let i = 0; i < result[0].rows.length; i++) {
        expenses.push(this.mapExpenseWithDetailsFromDatabaseRow(result[0].rows.item(i)));
      }

      return expenses;
    } catch (error) {
      console.error('Error searching expenses:', error);
      throw new Error(
        `Failed to search expenses: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get expense data for export (CSV/PDF)
   * Optimized query with all necessary joined data for export formatting
   */
  async getExpenseDataForExport(tripId: number): Promise<ExpenseWithDetails[]> {
    try {
      const db = getDatabase();

      const result = await db.executeSql(
        `SELECT
          e.*,
          t.trip_name,
          t.destination as trip_destination,
          t.start_date as trip_start_date,
          t.end_date as trip_end_date,
          t.default_currency,
          c.category_name,
          c.icon_name as category_icon
        FROM expense e
        LEFT JOIN trip t ON e.trip_id = t.trip_id
        INNER JOIN expense_category c ON e.category_id = c.category_id
        WHERE e.trip_id = ?
        ORDER BY e.expense_date ASC, e.expense_time ASC`,
        [tripId],
      );

      const expenses: ExpenseWithDetails[] = [];
      for (let i = 0; i < result[0].rows.length; i++) {
        expenses.push(this.mapExpenseWithDetailsFromDatabaseRow(result[0].rows.item(i)));
      }

      return expenses;
    } catch (error) {
      console.error('Error getting expense data for export:', error);
      throw new Error(
        `Failed to get expense data for export: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async updateExpense(model: UpdateExpenseModel): Promise<Expense> {
    try {
      const db = getDatabase();

      // Check if expense exists
      const existingExpense = await this.getExpenseById(model.id);
      if (!existingExpense) {
        throw new Error(`Expense with ID ${model.id} not found`);
      }

      // Build dynamic update query
      const updates: string[] = [];
      const params: (string | number)[] = [];

      if (model.trip_id !== undefined) {
        updates.push('trip_id = ?');
        params.push(model.trip_id);
      }

      if (model.image_path !== undefined) {
        updates.push('receipt_path = ?');
        params.push(model.image_path);
      }

      if (model.merchant !== undefined) {
        updates.push('merchant_name = ?');
        params.push(model.merchant);
      }

      if (model.amount !== undefined) {
        updates.push('total_amount = ?');
        params.push(model.amount);
      }

      if (model.tax_amount !== undefined) {
        updates.push('tax_amount = ?');
        params.push(model.tax_amount);
      }

      if (model.tax_type !== undefined) {
        updates.push('tax_type = ?');
        params.push(model.tax_type);
      }

      if (model.tax_rate !== undefined) {
        updates.push('tax_rate = ?');
        params.push(model.tax_rate);
      }

      if (model.date !== undefined) {
        updates.push('expense_date = ?');
        params.push(model.date);
      }

      if (model.time !== undefined) {
        updates.push('expense_time = ?');
        params.push(model.time);
      }

      if (model.category !== undefined) {
        updates.push('category_id = ?');
        params.push(model.category);
      }

      if (model.ai_service_used !== undefined) {
        updates.push('ai_service_used = ?');
        params.push(model.ai_service_used);
      }

      if (model.capture_method !== undefined) {
        updates.push('data_capture_method = ?');
        params.push(model.capture_method);
      }

      if (model.notes !== undefined) {
        updates.push('notes = ?');
        params.push(model.notes);
      }

      if (updates.length === 0) {
        return existingExpense;
      }

      params.push(model.id);

      await db.executeSql(`UPDATE expense SET ${updates.join(', ')} WHERE expense_id = ?`, params);

      // Fetch and return the updated expense
      const updatedExpense = await this.getExpenseById(model.id);
      if (!updatedExpense) {
        throw new Error('Failed to retrieve updated expense');
      }

      return updatedExpense;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw new Error(
        `Failed to update expense: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async deleteExpense(id: number): Promise<void> {
    try {
      const db = getDatabase();

      // Check if expense exists
      const existingExpense = await this.getExpenseById(id);
      if (!existingExpense) {
        throw new Error(`Expense with ID ${id} not found`);
      }

      await db.executeSql('DELETE FROM expense WHERE expense_id = ?', [id]);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw new Error(
        `Failed to delete expense: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /*
   Helper method to map database row to Trip object
   */
  private mapExpenseFromDatabaseRow(row: any): Expense {
    return {
      id: row.expense_id,
      trip_id: row.trip_id,
      image_path: row.receipt_path,
      merchant: row.merchant_name,
      amount: row.total_amount,
      tax_amount: row.tax_amount,
      tax_type: row.tax_type,
      tax_rate: row.tax_rate,
      date: row.expense_date,
      time: row.expense_time,
      category: row.category_id,
      processed: row.processing_status === 'complete' || row.processed === 1,
      ai_service_used: row.ai_service_used,
      capture_method: row.capture_method,
      notes: row.notes,
      verification_status: row.verification_status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  /**
   * Helper method to map database row with JOIN data to ExpenseWithDetails object
   */
  private mapExpenseWithDetailsFromDatabaseRow(row: any): ExpenseWithDetails {
    return {
      id: row.expense_id,
      trip_id: row.trip_id,
      image_path: row.receipt_path,
      merchant: row.merchant_name,
      amount: row.total_amount,
      tax_amount: row.tax_amount,
      tax_type: row.tax_type,
      tax_rate: row.tax_rate,
      date: row.expense_date,
      time: row.expense_time,
      category: row.category_id,
      processed: row.processing_status === 'complete' || row.processed === 1,
      ai_service_used: row.ai_service_used,
      capture_method: row.capture_method,
      notes: row.notes,
      verification_status: row.verification_status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      // Joined fields from trip table
      trip_name: row.trip_name,
      trip_destination: row.trip_destination,
      trip_start_date: row.trip_start_date,
      trip_end_date: row.trip_end_date,
      // Joined fields from category table
      category_name: row.category_name,
      category_icon: row.category_icon,
    };
  }

  /**
   * Category Operations
   */

  /**
   * Get all active expense categories
   */
  async getAllCategories(): Promise<ExpenseCategory[]> {
    try {
      const db = getDatabase();

      const result = await db.executeSql(
        'SELECT * FROM expense_category WHERE is_active = 1 ORDER BY sort_order ASC',
        [],
      );

      const categories: ExpenseCategory[] = [];
      for (let i = 0; i < result[0].rows.length; i++) {
        categories.push(this.mapCategoryFromDatabaseRow(result[0].rows.item(i)));
      }

      return categories;
    } catch (error) {
      console.error('Error getting all categories:', error);
      throw new Error(
        `Failed to get categories: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get category breakdown with expense statistics for a trip
   * Uses JOIN and GROUP BY to aggregate expense data by category
   */
  async getCategoryBreakdown(tripId: number): Promise<CategoryBreakdown[]> {
    try {
      const db = getDatabase();

      const result = await db.executeSql(
        `SELECT
          c.category_id,
          c.category_name,
          c.icon_name as category_icon,
          COUNT(e.expense_id) as expense_count,
          COALESCE(SUM(e.total_amount), 0) as total_amount,
          COALESCE(AVG(e.total_amount), 0) as avg_amount
        FROM expense_category c
        LEFT JOIN expense e ON c.category_id = e.category_id AND e.trip_id = ?
        WHERE c.is_active = 1
        GROUP BY c.category_id
        HAVING expense_count > 0
        ORDER BY total_amount DESC`,
        [tripId],
      );

      const breakdown: CategoryBreakdown[] = [];
      for (let i = 0; i < result[0].rows.length; i++) {
        breakdown.push(this.mapCategoryBreakdownFromDatabaseRow(result[0].rows.item(i)));
      }

      return breakdown;
    } catch (error) {
      console.error('Error getting category breakdown:', error);
      throw new Error(
        `Failed to get category breakdown: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Helper method to map database row to ExpenseCategory object
   */
  private mapCategoryFromDatabaseRow(row: any): ExpenseCategory {
    return {
      id: row.category_id,
      name: row.category_name,
      type: row.category_type,
      icon_name: row.icon_name,
      sort_order: row.sort_order,
      is_active: row.is_active === 1,
      created_at: row.created_at,
    };
  }

  /**
   * Helper method to map database row with JOIN data to CategoryBreakdown object
   */
  private mapCategoryBreakdownFromDatabaseRow(row: any): CategoryBreakdown {
    return {
      category_id: row.category_id,
      category_name: row.category_name,
      category_icon: row.category_icon,
      expense_count: row.expense_count,
      total_amount: parseFloat(row.total_amount) || 0,
      avg_amount: parseFloat(row.avg_amount) || 0,
    };
  }

  /**
   * Get trip statistics (expense count and total amount)
   */
  async getTripStatistics(tripId: number): Promise<{ expenseCount: number; totalAmount: number }> {
    try {
      const db = getDatabase();

      const result = await db.executeSql(
        `SELECT
          COUNT(*) as expense_count,
          COALESCE(SUM(total_amount), 0) as total_amount
         FROM expense
         WHERE trip_id = ?`,
        [tripId],
      );

      const row = result[0].rows.item(0);

      return {
        expenseCount: row.expense_count,
        totalAmount: parseFloat(row.total_amount) || 0,
      };
    } catch (error) {
      console.error('Error getting trip statistics:', error);
      // Return zeros on error rather than throwing
      return {
        expenseCount: 0,
        totalAmount: 0,
      };
    }
  }

  /**
   * Get statistics for all trips at once (optimized)
   */
  async getAllTripsStatistics(): Promise<
    Map<number, { expenseCount: number; totalAmount: number }>
  > {
    try {
      const db = getDatabase();

      const result = await db.executeSql(
        `SELECT
          trip_id,
          COUNT(*) as expense_count,
          COALESCE(SUM(total_amount), 0) as total_amount
         FROM expense
         GROUP BY trip_id`,
        [],
      );

      const statsMap = new Map<number, { expenseCount: number; totalAmount: number }>();

      for (let i = 0; i < result[0].rows.length; i++) {
        const row = result[0].rows.item(i);
        statsMap.set(row.trip_id, {
          expenseCount: row.expense_count,
          totalAmount: parseFloat(row.total_amount) || 0,
        });
      }

      return statsMap;
    } catch (error) {
      console.error('Error getting all trips statistics:', error);
      return new Map();
    }
  }

  /**
   * Get expenses that need processing with their trip and category details
   * Uses JOIN to avoid N+1 queries when displaying processing queue
   */
  async getProcessingQueueWithDetails(): Promise<ExpenseWithDetails[]> {
    try {
      const db = getDatabase();

      const result = await db.executeSql(
        `SELECT
          e.*,
          t.trip_name,
          t.destination as trip_destination,
          t.start_date as trip_start_date,
          t.end_date as trip_end_date,
          c.category_name,
          c.icon_name as category_icon
        FROM expense e
        LEFT JOIN trip t ON e.trip_id = t.trip_id
        INNER JOIN expense_category c ON e.category_id = c.category_id
        WHERE e.processing_status = 'pending' OR e.verification_status = 'pending'
        ORDER BY e.created_at ASC`,
        [],
      );

      const expenses: ExpenseWithDetails[] = [];
      for (let i = 0; i < result[0].rows.length; i++) {
        expenses.push(this.mapExpenseWithDetailsFromDatabaseRow(result[0].rows.item(i)));
      }

      return expenses;
    } catch (error) {
      console.error('Error getting processing queue with details:', error);
      throw new Error(
        `Failed to get processing queue: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

// Export singleton instance
export default new DatabaseService();
