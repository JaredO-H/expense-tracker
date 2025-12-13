/**
 * Database Service Layer
 * Provides CRUD operations for trips and expenses with proper error handling
 */

import { getDatabase } from './databaseInit';
import { Trip, CreateTripModel, UpdateTripModel } from '../../types/database';

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
        `INSERT INTO trip (trip_name, start_date, end_date, destination, business_purpose)
         VALUES (?, ?, ?, ?, ?)`,
        [
          model.name,
          model.start_date,
          model.end_date,
          model.destination || null,
          model.purpose || null,
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
   * Note: Will fail if there are expenses associated with this trip due to ON DELETE RESTRICT constraint
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
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }




  /*
   * Expense Operations
   */

  async createExpense(model: CreateExpenseModel): Promise<Expense> {
    try {
      const db = getDatabase();

      const result = await db.executeSql(
        `INSERT INTO Expense (trip_id, image_path, merchant, amount, tax_amount, tax_type, tax_rate, date, category, processed, ai_service_used, manual_entry)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

        [
          model.trip_id,
          model.image_path || null,
          model.merchant || null,
          model.amount,
          model.tax_amount || null,
          model.tax_type || null,
          model.tax_rate || null,
          model.date,
          model.category,
          model.processed || null,
          model.ai_service_used || null,
          model.manual_entry,
        ],
      );

      const expenseId = result[0].insertId;

      if (!expenseId) {
        throw new Error('Failed to create expense - no ID returned');
      }

      // Fetch and return the created expense
      const createdExpense = await this.getExpenseById(tripId);
      if (!createdExpense) {
        throw new Error('Failed to retrieve created expense');
      }

      return createdExpense;
    }
    catch (error) {
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

  async getAllExpenses(trip_id? : number): Promise<Expense[]> {

    try {
      const db = getDatabase();

      let query = 'SELECT * FROM expense';
      const params: string[] = [];

      if (trip_id) {
        query += ' WHERE trip_id = ?';
        params.push(trip_id.toString());
      }

      //query += ` ORDER BY date DESC`;

      const result = await db.executeSql(query, params);

      const expenses: Expense[] = [];
      for (let i = 0; i < result[0].rows.length; i++) {
        expenses.push(this.mapExpenseFromDatabaseRow(result[0].rows.item(i)));
      }

      return expenses;
    }
    catch (error) {
      console.error('Error getting all expenses:', error);
      throw new Error(
        `Failed to get expenses: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
        updates.push('image_path = ?');
        params.push(model.image_path);
      }

      if (model.merchant !== undefined) {
        updates.push('merchant = ?');
        params.push(model.merchant);
      }

      if (model.amount !== undefined) {
        updates.push('amount = ?');
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
        updates.push('date = ?');
        params.push(model.date);
      }

      if (model.category !== undefined) {
        updates.push('category = ?');
        params.push(model.category);
      }

      if (model.processed !== undefined) {
        updates.push('processed = ?');
        params.push(model.processed);
      }

      if (model.ai_service_used !== undefined) {
        updates.push('ai_service_used = ?');
        params.push(model.ai_service_used);
      }

      if (model.manual_entry !== undefined) {
        updates.push('manual_entry = ?');
        params.push(model.manual_entry);
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
    }
    catch (error) {
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
    }
      catch (error) {
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
       image_path: row.image_path,
       merchant: row.merchant,
       amount: row.amount,
       tax_amount: row.tax_amount,
       tax_type: row.tax_type,
       tax_rate: row.tax_rate,
       date: row.date,
       category: row.category,
       processed: row.processed,
       ai_service_used: row.ai_service_used,
       manual_entry: row.manual_entry,
       created_at: row.created_at,
       updated_at: row.updated_at,
     };
   }


}


// Export singleton instance
export default new DatabaseService();
