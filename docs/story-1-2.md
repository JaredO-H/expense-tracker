# Story 1.2: Database Schema and Local Storage

## Status
Draft

## Story

**As a** developer,
**I want** to implement the SQLite database schema and file management,
**so that** expense and trip data can be stored locally on the device.

## Acceptance Criteria

1. SQLite database created with trips and expenses tables per schema specification
2. Database service layer implemented with CRUD operations for trips and expenses
3. File system service for receipt image storage and retrieval
4. Database migrations system for future schema updates
5. Local storage capacity monitoring (warn when approaching storage limits)

## Tasks / Subtasks

- [ ] Create database schema and initialization (AC: 1)
  - [ ] Create `src/config/database.ts` with database configuration
  - [ ] Define trips table schema with id, name, start_date, end_date, destination, purpose, timestamps
  - [ ] Define expenses table schema with id, trip_id, image_path, merchant, amount, tax_amount, tax_type, tax_rate, date, category, processed, ai_service_used, manual_entry, timestamps
  - [ ] Add foreign key relationship between expenses.trip_id and trips.id
  - [ ] Create database initialization function with error handling
  - [ ] Test database creation on both Android and iOS platforms

- [ ] Implement database service layer with CRUD operations (AC: 2)
  - [ ] Create `src/services/database/databaseService.ts` as main service class
  - [ ] Implement trip operations: createTrip, getTripById, getAllTrips, updateTrip, deleteTrip
  - [ ] Implement expense operations: createExpense, getExpenseById, getExpensesByTrip, getAllExpenses, updateExpense, deleteExpense
  - [ ] Add bulk operations: getExpensesByDateRange, getExpensesByCategory
  - [ ] Implement transaction support for data consistency
  - [ ] Add comprehensive error handling with user-friendly messages
  - [ ] Create TypeScript interfaces for database models in `src/types/database.ts`

- [ ] Create file system service for receipt image management (AC: 3)
  - [ ] Create `src/services/storage/fileService.ts` for image operations
  - [ ] Implement saveReceiptImage function with unique filename generation
  - [ ] Implement getReceiptImage function for image retrieval
  - [ ] Implement deleteReceiptImage function with cleanup verification
  - [ ] Add image compression before storage (using react-native-image-resizer)
  - [ ] Create receipt storage directory management with proper permissions
  - [ ] Implement image validation (format, size limits)

- [ ] Implement database migration system (AC: 4)
  - [ ] Create `src/services/database/migrations.ts` migration framework
  - [ ] Implement version tracking in database metadata
  - [ ] Create migration runner with rollback capability
  - [ ] Add initial migration (v1) for trips and expenses tables
  - [ ] Test migration system with version upgrades
  - [ ] Document migration creation process for future schema changes

- [ ] Add storage capacity monitoring and alerts (AC: 5)
  - [ ] Create `src/services/storage/storageMonitor.ts` for capacity tracking
  - [ ] Implement getStorageUsage function for receipt images
  - [ ] Implement getDatabaseSize function for SQLite database
  - [ ] Add storage warning thresholds (80% and 95% capacity)
  - [ ] Create cleanup suggestions for users approaching limits
  - [ ] Integrate storage monitoring with app settings

## Dev Notes

### Database Architecture

**SQLite Configuration**: Database file stored in app's Documents directory for persistence across app updates. Database name: `ExpenseTracker.db` with version tracking for future migrations.

**Schema Design**: Follows normalized design with trips as parent entities and expenses as children. Foreign key constraints ensure data integrity. All tables include created_at and updated_at timestamps for audit trails.

**Data Types**: Using appropriate SQLite types - TEXT for strings, INTEGER for IDs and booleans, REAL for decimal amounts, DATE for date fields. Amount fields store values as cents (INTEGER) to avoid floating point precision issues.

### Database Service Layer

**Service Pattern**: DatabaseService class encapsulates all SQL operations. Singleton pattern ensures single database connection. All methods return Promises for async operation compatibility.

**Error Handling**: Comprehensive try-catch blocks with specific error types. Database errors translated to user-friendly messages. Connection failures handled with retry logic.

**Transaction Support**: Critical operations (expense creation with image save) wrapped in database transactions. Rollback capability for failed operations.

**Type Safety**: All database operations use TypeScript interfaces. Database row mapping to TypeScript objects with proper type conversion.

### File System Management

**Image Storage Strategy**: Receipt images stored in app's Documents/receipts directory. Unique filenames prevent conflicts: `receipt_${timestamp}_${randomId}.jpg`.

**Image Compression**: All images compressed before storage using react-native-image-resizer. Target: max 1024x1024 pixels, 80% quality, JPEG format.

**Storage Permissions**: Proper file system permissions for Android. iOS automatically handles app sandbox permissions.

**Cleanup Strategy**: Orphaned image cleanup when expenses deleted. Batch cleanup operations for storage management.

### Storage Monitoring

**Capacity Tracking**: Monitor both database size and image storage size. Device storage API to check available space.

**Warning System**: Progressive warnings at 80% (suggest cleanup) and 95% (block new receipts) capacity. User-friendly storage management interface.

**Cleanup Recommendations**: Identify oldest completed trips, largest image files, and expenses without trips for cleanup suggestions.

### Migration System

**Version Control**: Database schema version stored in metadata table. Automatic detection of required migrations on app start.

**Migration Framework**: Sequential migration files with up/down methods. Safe migration execution with backup creation.

**Rollback Support**: Each migration includes rollback instructions. Emergency rollback capability for failed migrations.

### Data Models

**Trip Model**: Core fields for business trip tracking. Optional fields for destination and purpose. Date validation for logical trip periods.

**Expense Model**: Comprehensive expense tracking with tax details. Category enumeration for consistent classification. Processing status tracking for AI workflow.

**Relationship Management**: Proper foreign key relationships with cascade options. Unassigned expenses (null trip_id) supported for orphaned expenses.

### Performance Considerations

**Indexing**: Database indexes on frequently queried fields (trip_id, date, category). Composite indexes for common query patterns.

**Query Optimization**: Efficient queries with proper WHERE clauses and LIMIT/OFFSET for pagination. Prepared statements for repeated operations.

**Memory Management**: Proper disposal of database cursors and file handles. Batch operations for large data sets.

### Testing Strategy

**Unit Tests**: Mock SQLite operations for service layer testing. Test data integrity and error handling.

**Integration Tests**: Real database operations on test devices. Migration testing with various schema versions.

**Data Validation**: Test foreign key constraints, data type validation, and business rule enforcement.

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-15 | 1.0 | Initial story creation from PRD Epic 1 | SM Agent |