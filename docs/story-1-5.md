# Story 1.5: Basic Trip Management

## Status
Draft

## Story

**As a** business traveler,
**I want** to create and manage business trips,
**so that** I can organize my expenses by travel purpose.

## Acceptance Criteria

1. Create new trip with name, start date, and end date
2. View list of all trips with basic trip information
3. Edit existing trip details
4. Delete trips with confirmation dialog
5. Assign expenses to trips during manual entry process

## Tasks / Subtasks

- [ ] Create trip creation form and component (AC: 1)
  - [ ] Create `src/components/forms/TripForm.tsx` with trip-specific fields
  - [ ] Add trip name input field with validation (required, 2-100 characters)
  - [ ] Add start date picker with date validation
  - [ ] Add end date picker with validation (must be >= start date)
  - [ ] Add optional destination field for travel location
  - [ ] Add optional purpose field for business justification
  - [ ] Implement form validation with real-time feedback
  - [ ] Save trip to database using databaseService

- [ ] Implement trip list view with overview information (AC: 2)
  - [ ] Create `src/screens/trips/TripsScreen.tsx` main trips interface
  - [ ] Display all trips in chronological order (most recent first)
  - [ ] Show trip cards with name, dates, destination, and expense count
  - [ ] Add trip status indicators (upcoming, active, completed)
  - [ ] Implement pull-to-refresh for trip list updates
  - [ ] Add search functionality for trip names and destinations
  - [ ] Include floating action button for creating new trips

- [ ] Create trip editing functionality (AC: 3)
  - [ ] Create trip detail screen with edit capability
  - [ ] Reuse TripForm component for editing with pre-populated data
  - [ ] Add validation for date changes affecting existing expenses
  - [ ] Update trip in database with optimistic UI updates
  - [ ] Handle edit conflicts and validation errors gracefully
  - [ ] Show trip modification history for audit purposes

- [ ] Implement trip deletion with safety measures (AC: 4)
  - [ ] Add delete action in trip detail screen and list swipe actions
  - [ ] Create confirmation dialog warning about expense reassignment
  - [ ] Implement expense handling options (reassign to "Unassigned" or delete all)
  - [ ] Execute deletion with database transaction for consistency
  - [ ] Provide undo functionality for accidental deletions (within session)
  - [ ] Update global state and refresh UI after deletion

- [ ] Add expense assignment during trip and expense creation (AC: 5)
  - [ ] Integrate trip selection into expense entry form
  - [ ] Create trip picker component with search and filtering
  - [ ] Add "Create New Trip" option during expense entry
  - [ ] Update expense records with trip association in database
  - [ ] Display trip assignment status in expense lists
  - [ ] Enable expense reassignment between trips

## Dev Notes

### Trip Data Model and Validation

**Trip Schema**: Based on database schema from Story 1.2, trips contain core identification (id, name), date range (start_date, end_date), optional metadata (destination, purpose), and audit timestamps.

**Business Rules**:
- Trip name required, 2-100 characters, unique per user
- Start date cannot be in the future beyond 30 days (planning buffer)
- End date must be >= start date
- Maximum trip duration: 90 days for reasonable business travel
- Destination and purpose optional for basic MVP functionality

**Data Validation**: Server-side validation principles applied to local operations. Date validation ensures logical trip periods. Name uniqueness checked against existing trips.

### Trip Management Architecture

**State Management**: Integration with tripStore (Zustand) for global trip state. Local component state for form editing. Optimistic updates with rollback capability on errors.

**Database Operations**: All CRUD operations through databaseService established in Story 1.2. Transaction support for trip deletion with expense handling. Foreign key relationships maintained for data integrity.

**Navigation Flow**: Bottom tab navigation to trips section. Stack navigation for trip details and editing. Modal presentation for trip creation form.

### Trip List Interface Design

**Trip Cards**: Material Design inspired cards with clear visual hierarchy:
- Trip name as primary text (large, bold)
- Date range as secondary text
- Destination and purpose as tertiary information
- Expense count and total amount as summary metrics
- Status indicators for trip phase (upcoming/active/completed)

**List Management**:
- Chronological sorting with most recent trips first
- Pull-to-refresh for manual data synchronization
- Search functionality filtering by name and destination
- Empty state guidance for users with no trips

**Performance**: Virtual scrolling for large trip lists. Image lazy loading for any trip photos. Pagination support for users with extensive travel history.

### Trip Status Logic

**Status Calculation**:
- Upcoming: Start date > current date
- Active: Current date between start and end dates
- Completed: End date < current date

**Visual Indicators**: Color-coded status badges, progress indicators for active trips, and completion checkmarks for finished trips.

### Trip Creation and Editing

**Form Reusability**: Single TripForm component used for both creation and editing modes. Pre-population of fields for editing with clear modification indicators.

**Date Picker Integration**: Native date pickers optimized for mobile interaction. Smart defaults (today for start date, tomorrow for end date). Business travel context awareness.

**Validation Feedback**: Real-time validation with clear error messaging. Form submission prevention until all validation criteria met. Autocomplete suggestions for frequently used destinations.

### Trip Deletion and Data Integrity

**Cascading Deletion Options**:
1. Move expenses to "Unassigned" status (recommended default)
2. Delete all associated expenses (with additional confirmation)
3. Cancel deletion if user wants to reassign expenses first

**Safety Measures**:
- Multi-step confirmation process for destructive actions
- Clear explanation of consequences before deletion
- Undo functionality available within current session
- Database transaction support for atomic operations

### Expense Assignment Integration

**Trip Selection Interface**: Searchable dropdown in expense forms. Recent trips shown first for convenience. "Create New Trip" option for immediate trip creation during expense entry.

**Assignment Logic**: Expenses can exist without trip assignment (unassigned status). Trip assignment updates expense records with foreign key relationship. Bulk assignment operations for multiple expenses.

**Validation**: Expense date should fall within trip date range (warning, not error). Multiple expenses per trip supported. Trip deletion handling for assigned expenses.

### User Experience Enhancements

**Smart Defaults**:
- Trip name suggestions based on destination
- Date range suggestions based on travel patterns
- Purpose suggestions from previous trips
- Category defaults based on trip purpose

**Quick Actions**:
- Swipe actions on trip cards for edit/delete
- Long press for contextual menus
- Quick add expense from trip detail screen
- Duplicate trip functionality for recurring travel

### Search and Filtering

**Search Functionality**:
- Real-time search across trip names and destinations
- Search history for frequently accessed trips
- Fuzzy matching for typo tolerance
- Clear search with quick return to full list

**Filter Options** (future enhancement):
- Filter by date range
- Filter by trip status
- Filter by destination
- Filter by expense count or amount

### Trip Analytics and Insights

**Basic Metrics**: Trip duration calculation, expense count per trip, total spending per trip, average daily spending, most common destinations.

**Display Integration**: Summary cards showing key metrics. Visual indicators for spending patterns. Comparison between trips for insights.

### Integration Points

**Expense Management**: Seamless integration with expense creation and editing flows. Trip context available throughout expense workflows.

**Database Service**: Consistent use of databaseService for all trip operations. Transaction support for complex operations involving both trips and expenses.

**Navigation**: Integration with React Navigation stack. Deep linking support for specific trip views. Back navigation handling with proper state management.

### Platform Considerations

**Android Implementation**:
- Material Design components for native feel
- Date picker styling consistent with platform
- Swipe gesture handling for list actions

**iOS Implementation**:
- iOS design language for native appearance
- Native date picker presentation
- iOS-specific navigation patterns

### Testing Strategy

**Unit Testing**:
- Trip form validation logic
- Date calculation and comparison functions
- Trip status determination algorithms

**Integration Testing**:
- Database CRUD operations for trips
- Expense assignment and reassignment
- Trip deletion with expense handling

**User Experience Testing**:
- Trip creation and editing workflows
- Search and filtering functionality
- Accessibility compliance with screen readers

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-15 | 1.0 | Initial story creation from PRD Epic 1 | SM Agent |