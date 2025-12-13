/**
 * Database initialization and connection management
 */

import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import { DB_CONFIG, INITIALIZATION_STATEMENTS } from '../../config/database';

// Enable promise-based API for react-native-sqlite-storage
SQLite.enablePromise(true);

// Enable debug mode for development (can be disabled in production)
SQLite.DEBUG(false);

let databaseInstance: SQLiteDatabase | null = null;

/**
 * Initialize the database and create tables if they don't exist
 * @returns Promise<SQLiteDatabase>
 */
export const initializeDatabase = async (): Promise<SQLiteDatabase> => {
  try {
    // If database is already initialized, return the instance
    if (databaseInstance) {
      console.log('Database already initialized');
      return databaseInstance;
    }

    console.log('Initializing database...');

    // Open database connection
    const db = await SQLite.openDatabase({
      name: DB_CONFIG.name,
      location: 'default',
    });

    console.log('Database connection opened');

    // Enable foreign key constraints (must be done for each connection)
    await db.executeSql('PRAGMA foreign_keys = ON;');
    console.log('Foreign key constraints enabled');

    // Execute all initialization SQL statements
    for (let i = 0; i < INITIALIZATION_STATEMENTS.length; i++) {
      const statement = INITIALIZATION_STATEMENTS[i];
      try {
        await db.executeSql(statement);
        console.log(
          `Executed initialization statement ${i + 1}/${INITIALIZATION_STATEMENTS.length}`,
        );
      } catch (statementError) {
        console.error(`Error executing statement ${i + 1}:`, statementError);
        throw new Error(`Database initialization failed at statement ${i + 1}: ${statementError}`);
      }
    }

    // Set database version in metadata
    const versionCheck = await db.executeSql("SELECT value FROM db_metadata WHERE key = 'version'");

    if (versionCheck[0].rows.length === 0) {
      // First time initialization - insert version
      await db.executeSql("INSERT INTO db_metadata (key, value) VALUES ('version', ?)", [
        DB_CONFIG.version.toString(),
      ]);
      console.log(`Database initialized with version ${DB_CONFIG.version}`);
    } else {
      const currentVersion = parseInt(versionCheck[0].rows.item(0).value, 10);
      console.log(`Database version: ${currentVersion}`);

      // Future migration logic would go here
      if (currentVersion < DB_CONFIG.version) {
        console.log(`Migration needed from version ${currentVersion} to ${DB_CONFIG.version}`);
        // This will be implemented in the migrations system
      }
    }

    // Store the database instance
    databaseInstance = db;
    console.log('Database initialization complete');

    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw new Error(`Database initialization failed: ${error}`);
  }
};

/**
 * Get the current database instance
 * Throws error if database is not initialized
 * @returns SQLiteDatabase
 */
export const getDatabase = (): SQLiteDatabase => {
  if (!databaseInstance) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return databaseInstance;
};

/**
 * Close the database connection
 * Should be called when the app is being closed
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    if (databaseInstance) {
      await databaseInstance.close();
      databaseInstance = null;
      console.log('Database connection closed');
    }
  } catch (error) {
    console.error('Error closing database:', error);
    throw error;
  }
};

/**
 * Delete the database (useful for testing or complete reset)
 * WARNING: This will delete all data
 */
export const deleteDatabase = async (): Promise<void> => {
  try {
    // Close database first if it's open
    if (databaseInstance) {
      await closeDatabase();
    }

    // Delete the database file
    await SQLite.deleteDatabase({
      name: DB_CONFIG.name,
      location: 'default',
    });

    console.log('Database deleted');
  } catch (error) {
    console.error('Error deleting database:', error);
    throw error;
  }
};
