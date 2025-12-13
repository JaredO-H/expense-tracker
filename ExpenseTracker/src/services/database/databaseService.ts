/**
 * Database Service Layer
 * Provides CRUD operations for trips and expenses with proper error handling
 */

import { getDatabase } from './databaseInit';
import {
  Trip,
  Expense,
  CreateTripModel,
  CreateExpenseModel,
  UpdateTripModel,
  UpdateExpenseModel,
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
}

// Export singleton instance
export default new DatabaseService();
