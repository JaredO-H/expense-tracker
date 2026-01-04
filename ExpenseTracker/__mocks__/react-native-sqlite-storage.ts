// Mock database storage
const mockTables: Record<string, any[]> = {};

const mockTransaction = {
  executeSql: jest.fn(
    (sql: string, params: any[] = [], successCallback?: Function, errorCallback?: Function) => {
      try {
        // Simple SQL parsing for mock behavior
        const sqlLower = sql.toLowerCase();

        if (sqlLower.includes('create table')) {
          // Extract table name
          const match = sql.match(/create table (?:if not exists )?(\w+)/i);
          if (match) {
            const tableName = match[1];
            if (!mockTables[tableName]) {
              mockTables[tableName] = [];
            }
          }
          successCallback?.(mockTransaction, {
            rows: { length: 0, item: () => null, raw: () => [] },
          });
        } else if (sqlLower.includes('insert into')) {
          // Mock insert
          const match = sql.match(/insert into (\w+)/i);
          if (match) {
            const tableName = match[1];
            if (!mockTables[tableName]) mockTables[tableName] = [];
            const id = mockTables[tableName].length + 1;
            mockTables[tableName].push({ id, ...params });
            successCallback?.(mockTransaction, {
              insertId: id,
              rowsAffected: 1,
              rows: { length: 0, item: () => null, raw: () => [] },
            });
          }
        } else if (sqlLower.includes('select')) {
          // Mock select
          const match = sql.match(/from (\w+)/i);
          if (match) {
            const tableName = match[1];
            const results = mockTables[tableName] || [];
            successCallback?.(mockTransaction, {
              rows: {
                length: results.length,
                item: (index: number) => results[index],
                raw: () => results,
              },
            });
          }
        } else if (sqlLower.includes('update')) {
          // Mock update
          const match = sql.match(/update (\w+)/i);
          if (match) {
            successCallback?.(mockTransaction, {
              rowsAffected: 1,
              rows: { length: 0, item: () => null, raw: () => [] },
            });
          }
        } else if (sqlLower.includes('delete')) {
          // Mock delete
          const match = sql.match(/from (\w+)/i);
          if (match) {
            successCallback?.(mockTransaction, {
              rowsAffected: 1,
              rows: { length: 0, item: () => null, raw: () => [] },
            });
          }
        } else {
          successCallback?.(mockTransaction, {
            rows: { length: 0, item: () => null, raw: () => [] },
          });
        }
      } catch (error) {
        errorCallback?.(mockTransaction, error);
      }
    },
  ),
};

const mockDatabase = {
  transaction: jest.fn((callback: Function) => {
    callback(mockTransaction);
    return Promise.resolve();
  }),

  executeSql: jest.fn((sql: string, params: any[] = []) => {
    return new Promise((resolve, reject) => {
      mockTransaction.executeSql(
        sql,
        params,
        (tx: any, results: any) => resolve([results]),
        (tx: any, error: any) => reject(error),
      );
    });
  }),

  close: jest.fn(() => Promise.resolve()),
};

const SQLite = {
  openDatabase: jest.fn(() => mockDatabase),

  enablePromise: jest.fn((enable: boolean) => {
    // No-op for mock
  }),

  DEBUG: jest.fn((debug: boolean) => {
    // No-op for mock
  }),

  // Helper for tests to clear mock tables
  __clearMockTables: () => {
    Object.keys(mockTables).forEach(key => delete mockTables[key]);
  },

  // Helper for tests to get mock tables
  __getMockTables: () => mockTables,
};

export default SQLite;
