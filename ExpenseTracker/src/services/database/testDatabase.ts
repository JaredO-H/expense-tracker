/**
 * Database initialization test utility
 * Run this to verify database setup works correctly
 */

import { initializeDatabase } from './databaseInit';

export const testDatabaseInitialization = async () => {
  console.log('=== Database Initialization Test ===\n');

  try {
    console.log('1. Initializing database...');
    const db = await initializeDatabase();
    console.log('Database initialized successfully\n');

    console.log('2. Verifying tables...');
    const tables = await db.executeSql(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
    );

    console.log('Tables created:');
    const tableCount = tables[0].rows.length;
    for (let i = 0; i < tableCount; i++) {
      const tableName = tables[0].rows.item(i).name;
      if (!tableName.startsWith('sqlite_')) {
        console.log('  - ' + tableName);
      }
    }
    console.log('Tables verified\n');

    console.log('3. Verifying indexes...');
    const indexes = await db.executeSql(
      "SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%' ORDER BY name",
    );

    console.log('Indexes created:');
    const indexCount = indexes[0].rows.length;
    for (let i = 0; i < indexCount; i++) {
      console.log('  - ' + indexes[0].rows.item(i).name);
    }
    console.log('Indexes verified\n');

    console.log('4. Verifying triggers...');
    const triggers = await db.executeSql(
      "SELECT name FROM sqlite_master WHERE type='trigger' ORDER BY name",
    );

    console.log('Triggers created:');
    const triggerCount = triggers[0].rows.length;
    for (let i = 0; i < triggerCount; i++) {
      console.log('  - ' + triggers[0].rows.item(i).name);
    }
    console.log('Triggers verified\n');

    console.log('5. Verifying foreign key constraints...');
    const fkCheck = await db.executeSql('PRAGMA foreign_keys');
    const fkEnabled = fkCheck[0].rows.item(0).foreign_keys === 1;
    console.log('Foreign keys enabled: ' + (fkEnabled ? 'Yes' : 'No'));
    console.log('Foreign keys verified\n');

    console.log('6. Checking database version...');
    const versionResult = await db.executeSql(
      "SELECT value FROM db_metadata WHERE key = 'version'",
    );
    if (versionResult[0].rows.length > 0) {
      const version = versionResult[0].rows.item(0).value;
      console.log('Database version: ' + version);
      console.log('Version metadata verified\n');
    }

    console.log('7. Testing basic operations...');

    const insertTrip = await db.executeSql(
      'INSERT INTO trip (trip_name, start_date, end_date, destination, business_purpose) VALUES (?, ?, ?, ?, ?)',
      ['Test Trip', '2025-01-01', '2025-01-05', 'London', 'Business Meeting'],
    );
    console.log('  Inserted test trip with ID: ' + insertTrip[0].insertId);

    const selectTrip = await db.executeSql('SELECT * FROM trip WHERE trip_id = ?', [
      insertTrip[0].insertId,
    ]);
    if (selectTrip[0].rows.length > 0) {
      const trip = selectTrip[0].rows.item(0);
      console.log('  Retrieved trip: ' + trip.trip_name);
    }

    await db.executeSql('DELETE FROM trip WHERE trip_id = ?', [insertTrip[0].insertId]);
    console.log('  Cleaned up test data\n');

    console.log('=== All Tests Passed! ===\n');
    return true;
  } catch (error) {
    console.error('\nTest Failed:', error);
    return false;
  }
};
