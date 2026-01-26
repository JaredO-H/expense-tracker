/**
 * Tests for Database Service
 * Validates CRUD operations for trips and expenses
 */

import databaseService from '../../../src/services/database/databaseService';
import { getDatabase } from '../../../src/services/database/databaseInit';
import { CreateTripModel, UpdateTripModel, CreateExpenseModel } from '../../../src/types/database';

// Mock database init
jest.mock('../../../src/services/database/databaseInit');

const mockGetDatabase = getDatabase as jest.MockedFunction<typeof getDatabase>;

describe('Database Service', () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock database
    mockDb = {
      executeSql: jest.fn(),
    };

    mockGetDatabase.mockReturnValue(mockDb);
  });

  describe('Trip Operations', () => {
    describe('createTrip', () => {
      const validTripModel: CreateTripModel = {
        name: 'Business Trip to NYC',
        start_date: '2024-03-01',
        end_date: '2024-03-05',
        destination: 'New York',
        purpose: 'Client Meeting',
      };

      it('should create a new trip successfully', async () => {
        // Mock insert result
        mockDb.executeSql
          .mockResolvedValueOnce([{ insertId: 1 }]) // Insert
          .mockResolvedValueOnce([
            {
              // Select created trip
              rows: {
                length: 1,
                item: (_i: number) => ({
                  trip_id: 1,
                  trip_name: 'Business Trip to NYC',
                  start_date: '2024-03-01',
                  end_date: '2024-03-05',
                  destination: 'New York',
                  business_purpose: 'Client Meeting',
                  created_at: '2024-03-01T00:00:00Z',
                  updated_at: '2024-03-01T00:00:00Z',
                }),
              },
            },
          ]);

        const trip = await databaseService.createTrip(validTripModel);

        expect(trip.id).toBe(1);
        expect(trip.name).toBe('Business Trip to NYC');
        expect(trip.destination).toBe('New York');
      });

      it('should throw error if end date is before start date', async () => {
        const invalidModel: CreateTripModel = {
          ...validTripModel,
          start_date: '2024-03-05',
          end_date: '2024-03-01',
        };

        await expect(databaseService.createTrip(invalidModel)).rejects.toThrow(
          'End date cannot be before start date',
        );
      });

      it('should handle optional fields', async () => {
        const minimalModel: CreateTripModel = {
          name: 'Quick Trip',
          start_date: '2024-03-01',
          end_date: '2024-03-02',
        };

        mockDb.executeSql.mockResolvedValueOnce([{ insertId: 2 }]).mockResolvedValueOnce([
          {
            rows: {
              length: 1,
              item: () => ({
                trip_id: 2,
                trip_name: 'Quick Trip',
                start_date: '2024-03-01',
                end_date: '2024-03-02',
                destination: null,
                business_purpose: null,
                created_at: '2024-03-01T00:00:00Z',
                updated_at: '2024-03-01T00:00:00Z',
              }),
            },
          },
        ]);

        const trip = await databaseService.createTrip(minimalModel);

        expect(trip.id).toBe(2);
        expect(trip.destination).toBeNull();
        expect(trip.purpose).toBeNull();
      });

      it('should throw error if insert fails', async () => {
        mockDb.executeSql.mockRejectedValue(new Error('Database error'));

        await expect(databaseService.createTrip(validTripModel)).rejects.toThrow();
      });

      it('should throw error if no insertId returned', async () => {
        mockDb.executeSql.mockResolvedValueOnce([{}]); // No insertId

        await expect(databaseService.createTrip(validTripModel)).rejects.toThrow(
          'Failed to create trip - no ID returned',
        );
      });
    });

    describe('getTripById', () => {
      it('should return trip when found', async () => {
        mockDb.executeSql.mockResolvedValue([
          {
            rows: {
              length: 1,
              item: () => ({
                trip_id: 1,
                trip_name: 'Test Trip',
                start_date: '2024-03-01',
                end_date: '2024-03-05',
                destination: 'NYC',
                business_purpose: 'Meeting',
                created_at: '2024-03-01T00:00:00Z',
                updated_at: '2024-03-01T00:00:00Z',
              }),
            },
          },
        ]);

        const trip = await databaseService.getTripById(1);

        expect(trip).not.toBeNull();
        expect(trip?.id).toBe(1);
        expect(trip?.name).toBe('Test Trip');
      });

      it('should return null when trip not found', async () => {
        mockDb.executeSql.mockResolvedValue([
          {
            rows: { length: 0 },
          },
        ]);

        const trip = await databaseService.getTripById(999);

        expect(trip).toBeNull();
      });

      it('should throw error on database failure', async () => {
        mockDb.executeSql.mockRejectedValue(new Error('Database error'));

        await expect(databaseService.getTripById(1)).rejects.toThrow();
      });
    });

    describe('getAllTrips', () => {
      it('should return all trips without filter', async () => {
        mockDb.executeSql.mockResolvedValue([
          {
            rows: {
              length: 2,
              item: (i: number) =>
                [
                  {
                    trip_id: 1,
                    trip_name: 'Trip 1',
                    start_date: '2024-03-01',
                    end_date: '2024-03-05',
                    destination: 'NYC',
                    business_purpose: 'Meeting',
                    created_at: '2024-03-01T00:00:00Z',
                    updated_at: '2024-03-01T00:00:00Z',
                  },
                  {
                    trip_id: 2,
                    trip_name: 'Trip 2',
                    start_date: '2024-04-01',
                    end_date: '2024-04-05',
                    destination: 'LA',
                    business_purpose: 'Conference',
                    created_at: '2024-04-01T00:00:00Z',
                    updated_at: '2024-04-01T00:00:00Z',
                  },
                ][i],
            },
          },
        ]);

        const trips = await databaseService.getAllTrips();

        expect(trips).toHaveLength(2);
        expect(trips[0].name).toBe('Trip 1');
        expect(trips[1].name).toBe('Trip 2');
      });

      it('should filter by status', async () => {
        mockDb.executeSql.mockResolvedValue([
          {
            rows: {
              length: 1,
              item: () => ({
                trip_id: 1,
                trip_name: 'Active Trip',
                start_date: '2024-03-01',
                end_date: '2024-03-05',
                destination: 'NYC',
                business_purpose: 'Meeting',
                created_at: '2024-03-01T00:00:00Z',
                updated_at: '2024-03-01T00:00:00Z',
              }),
            },
          },
        ]);

        const trips = await databaseService.getAllTrips('active');

        expect(mockDb.executeSql).toHaveBeenCalledWith(
          expect.stringContaining('WHERE status = ?'),
          ['active'],
        );
        expect(trips).toHaveLength(1);
      });

      it('should return empty array when no trips', async () => {
        mockDb.executeSql.mockResolvedValue([
          {
            rows: { length: 0 },
          },
        ]);

        const trips = await databaseService.getAllTrips();

        expect(trips).toEqual([]);
      });
    });

    describe('updateTrip', () => {
      const updateModel: UpdateTripModel = {
        id: 1,
        name: 'Updated Trip',
        destination: 'San Francisco',
      };

      it('should update trip successfully', async () => {
        mockDb.executeSql
          .mockResolvedValueOnce([
            {
              // getTripById - existing trip
              rows: {
                length: 1,
                item: () => ({
                  trip_id: 1,
                  trip_name: 'Old Trip',
                  start_date: '2024-03-01',
                  end_date: '2024-03-05',
                  destination: 'NYC',
                  business_purpose: 'Meeting',
                  created_at: '2024-03-01T00:00:00Z',
                  updated_at: '2024-03-01T00:00:00Z',
                }),
              },
            },
          ])
          .mockResolvedValueOnce([{ rowsAffected: 1 }]) // Update
          .mockResolvedValueOnce([
            {
              // getTripById - updated trip
              rows: {
                length: 1,
                item: () => ({
                  trip_id: 1,
                  trip_name: 'Updated Trip',
                  start_date: '2024-03-01',
                  end_date: '2024-03-05',
                  destination: 'San Francisco',
                  business_purpose: 'Meeting',
                  created_at: '2024-03-01T00:00:00Z',
                  updated_at: '2024-03-02T00:00:00Z',
                }),
              },
            },
          ]);

        const trip = await databaseService.updateTrip(updateModel);

        expect(trip.name).toBe('Updated Trip');
        expect(trip.destination).toBe('San Francisco');
      });

      it('should throw error if trip not found', async () => {
        mockDb.executeSql.mockResolvedValue([
          {
            rows: { length: 0 },
          },
        ]);

        await expect(databaseService.updateTrip(updateModel)).rejects.toThrow('not found');
      });

      it('should return existing trip if no updates provided', async () => {
        mockDb.executeSql.mockResolvedValue([
          {
            rows: {
              length: 1,
              item: () => ({
                trip_id: 1,
                trip_name: 'Test Trip',
                start_date: '2024-03-01',
                end_date: '2024-03-05',
                destination: 'NYC',
                business_purpose: 'Meeting',
                created_at: '2024-03-01T00:00:00Z',
                updated_at: '2024-03-01T00:00:00Z',
              }),
            },
          },
        ]);

        const trip = await databaseService.updateTrip({ id: 1 });

        expect(trip.name).toBe('Test Trip');
        // Should not execute UPDATE query
        expect(mockDb.executeSql).toHaveBeenCalledTimes(1); // Only getTripById
      });
    });

    describe('deleteTrip', () => {
      it('should delete trip with no expenses', async () => {
        mockDb.executeSql
          .mockResolvedValueOnce([
            {
              // getTripById
              rows: {
                length: 1,
                item: () => ({
                  trip_id: 1,
                  trip_name: 'Test Trip',
                  start_date: '2024-03-01',
                  end_date: '2024-03-05',
                }),
              },
            },
          ])
          .mockResolvedValueOnce([
            {
              // Check expense count
              rows: {
                item: () => ({ count: 0 }),
              },
            },
          ])
          .mockResolvedValueOnce([{ rowsAffected: 1 }]); // Delete

        await databaseService.deleteTrip(1);

        expect(mockDb.executeSql).toHaveBeenCalledWith('DELETE FROM trip WHERE trip_id = ?', [1]);
      });

      it('should throw error if trip not found', async () => {
        mockDb.executeSql.mockResolvedValue([
          {
            rows: { length: 0 },
          },
        ]);

        await expect(databaseService.deleteTrip(999)).rejects.toThrow('not found');
      });

      it('should throw error if trip has expenses', async () => {
        mockDb.executeSql
          .mockResolvedValueOnce([
            {
              // getTripById
              rows: {
                length: 1,
                item: () => ({ trip_id: 1 }),
              },
            },
          ])
          .mockResolvedValueOnce([
            {
              // Check expense count
              rows: {
                item: () => ({ count: 5 }),
              },
            },
          ]);

        await expect(databaseService.deleteTrip(1)).rejects.toThrow('Cannot delete trip');
      });
    });
  });

  describe('Expense Operations', () => {
    describe('createExpense', () => {
      const validExpenseModel: CreateExpenseModel = {
        trip_id: 1,
        merchant: 'Starbucks',
        amount: 15.5,
        date: '2024-03-02',
        category: 4, // Food
        capture_method: 'ai_service',
      };

      it('should create expense successfully', async () => {
        mockDb.executeSql
          .mockResolvedValueOnce([{ insertId: 1 }]) // Insert
          .mockResolvedValueOnce([
            {
              // Select created expense
              rows: {
                length: 1,
                item: () => ({
                  expense_id: 1,
                  trip_id: 1,
                  merchant_name: 'Starbucks',
                  total_amount: 15.5,
                  expense_date: '2024-03-02',
                  category_id: 4,
                  data_capture_method: 'ai_service',
                  created_at: '2024-03-02T00:00:00Z',
                  updated_at: '2024-03-02T00:00:00Z',
                }),
              },
            },
          ]);

        const expense = await databaseService.createExpense(validExpenseModel);

        expect(expense.id).toBe(1);
        expect(expense.merchant).toBe('Starbucks');
        expect(expense.amount).toBeGreaterThan(0);
      });

      it('should handle optional fields', async () => {
        const minimalModel: CreateExpenseModel = {
          trip_id: 1,
          amount: 10.0,
          date: '2024-03-02',
          category: 8,
          capture_method: 'manual',
        };

        mockDb.executeSql.mockResolvedValueOnce([{ insertId: 2 }]).mockResolvedValueOnce([
          {
            rows: {
              length: 1,
              item: () => ({
                expense_id: 2,
                trip_id: 1,
                total_amount: 10.0,
                expense_date: '2024-03-02',
                category_id: 8,
                data_capture_method: 'manual',
                created_at: '2024-03-02T00:00:00Z',
                updated_at: '2024-03-02T00:00:00Z',
              }),
            },
          },
        ]);

        const expense = await databaseService.createExpense(minimalModel);

        expect(expense.id).toBe(2);
      });

      it('should throw error if insert fails', async () => {
        mockDb.executeSql.mockRejectedValue(new Error('Database error'));

        await expect(databaseService.createExpense(validExpenseModel)).rejects.toThrow();
      });
    });

    describe('getExpenseById', () => {
      it('should return expense when found', async () => {
        mockDb.executeSql.mockResolvedValue([
          {
            rows: {
              length: 1,
              item: () => ({
                expense_id: 1,
                trip_id: 1,
                merchant_name: 'Starbucks',
                total_amount: 15.5,
                expense_date: '2024-03-02',
                category_id: 4,
                created_at: '2024-03-02T00:00:00Z',
                updated_at: '2024-03-02T00:00:00Z',
              }),
            },
          },
        ]);

        const expense = await databaseService.getExpenseById(1);

        expect(expense).not.toBeNull();
        expect(expense?.id).toBe(1);
      });

      it('should return null when not found', async () => {
        mockDb.executeSql.mockResolvedValue([
          {
            rows: { length: 0 },
          },
        ]);

        const expense = await databaseService.getExpenseById(999);

        expect(expense).toBeNull();
      });
    });

    describe('getAllExpenses', () => {
      it('should return all expenses without filter', async () => {
        mockDb.executeSql.mockResolvedValue([
          {
            rows: {
              length: 2,
              item: (i: number) =>
                [
                  {
                    expense_id: 1,
                    trip_id: 1,
                    merchant_name: 'Starbucks',
                    total_amount: 15.5,
                    expense_date: '2024-03-02',
                  },
                  {
                    expense_id: 2,
                    trip_id: 1,
                    merchant_name: 'Walmart',
                    total_amount: 45.0,
                    expense_date: '2024-03-03',
                  },
                ][i],
            },
          },
        ]);

        const expenses = await databaseService.getAllExpenses();

        expect(expenses).toHaveLength(2);
      });

      it('should filter by trip_id', async () => {
        mockDb.executeSql.mockResolvedValue([
          {
            rows: {
              length: 1,
              item: () => ({
                expense_id: 1,
                trip_id: 1,
                merchant_name: 'Starbucks',
                total_amount: 15.5,
                expense_date: '2024-03-02',
              }),
            },
          },
        ]);

        await databaseService.getAllExpenses(1);

        expect(mockDb.executeSql).toHaveBeenCalledWith(
          expect.stringContaining('WHERE trip_id = ?'),
          ['1'],
        );
      });
    });

    describe('deleteExpense', () => {
      it('should delete expense successfully', async () => {
        mockDb.executeSql
          .mockResolvedValueOnce([
            {
              // getExpenseById
              rows: {
                length: 1,
                item: () => ({ expense_id: 1 }),
              },
            },
          ])
          .mockResolvedValueOnce([{ rowsAffected: 1 }]); // Delete

        await databaseService.deleteExpense(1);

        expect(mockDb.executeSql).toHaveBeenCalledWith(
          'DELETE FROM expense WHERE expense_id = ?',
          [1],
        );
      });

      it('should throw error if expense not found', async () => {
        mockDb.executeSql.mockResolvedValue([
          {
            rows: { length: 0 },
          },
        ]);

        await expect(databaseService.deleteExpense(999)).rejects.toThrow('not found');
      });
    });
  });
});
