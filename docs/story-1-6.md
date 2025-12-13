# Story 1.6: Expense List and Management

## Status
Draft

## Story

**As a** business traveler,
**I want** to view and manage my captured expenses,
**so that** I can review my spending and make corrections.

## Acceptance Criteria

1. Display list of all expenses with merchant, amount, date, and category
2. Filter expenses by trip assignment
3. Edit existing expense details
4. Delete expenses with confirmation dialog
5. View receipt image associated with each expense

## Tasks / Subtasks

- [ ] Create expense list interface with comprehensive display (AC: 1)
  - [ ] Create `src/screens/expenses/ExpensesScreen.tsx` main expense interface
  - [ ] Display expense cards with merchant name, amount, date, and category
  - [ ] Show trip assignment status and processing method (AI/manual/offline)
  - [ ] Implement FlatList with optimal performance for large datasets
  - [ ] Add expense status indicators (processed, pending, manual entry)
  - [ ] Include total amount calculation and display
  - [ ] Sort expenses by date (most recent first) with alternative sort options

- [ ] Implement trip-based filtering and search functionality (AC: 2)
  - [ ] Add filter controls for trip selection (all trips, specific trip, unassigned)
  - [ ] Create search functionality for merchant names and amounts
  - [ ] Add date range filtering for expense period selection
  - [ ] Implement category filtering with multi-select capability
  - [ ] Show active filter indicators and clear filter options
  - [ ] Persist filter preferences using AsyncStorage
  - [ ] Add quick filter shortcuts for common views (this week, this month)

- [ ] Create expense editing interface and workflow (AC: 3)
  - [ ] Navigate to expense detail screen from list item tap
  - [ ] Reuse ExpenseForm component from Story 1.4 for editing
  - [ ] Pre-populate form fields with existing expense data
  - [ ] Add validation for expense editing with trip date constraints
  - [ ] Update expense in database with optimistic UI updates
  - [ ] Handle concurrent edit conflicts gracefully
  - [ ] Track expense modification history for audit purposes

- [ ] Implement expense deletion with data integrity safeguards (AC: 4)
  - [ ] Add swipe-to-delete action on expense list items
  - [ ] Create confirmation dialog with expense details preview
  - [ ] Delete associated receipt image from file system
  - [ ] Remove expense record from database using transaction
  - [ ] Update trip totals and expense counts after deletion
  - [ ] Provide undo functionality within current session
  - [ ] Handle deletion errors with user feedback and retry options

- [ ] Add receipt image viewing and management (AC: 5)
  - [ ] Create receipt image viewer with full-screen display capability
  - [ ] Add zoom and pan functionality for detailed receipt examination
  - [ ] Display image metadata (file size, capture date, processing status)
  - [ ] Handle missing or corrupted image files gracefully
  - [ ] Add image replacement functionality for better quality receipts
  - [ ] Implement image sharing options for external use
  - [ ] Show image compression details and original vs compressed size

## Dev Notes

### Expense List Architecture

**Performance Optimization**: FlatList implementation with proper keyExtractor, getItemLayout, and windowSize optimization for smooth scrolling with large expense datasets. Virtual scrolling prevents memory issues with hundreds of expenses.

**Data Management**: Integration with expenseStore (Zustand) for global state management. Real-time updates when expenses modified from other screens. Optimistic updates with rollback capability for edit operations.

**List Item Design**: Material Design inspired expense cards with clear visual hierarchy:
- Primary: Merchant name and amount (largest, most prominent)
- Secondary: Date and category with visual icons
- Tertiary: Trip assignment and processing status
- Status indicators for processing state and data completeness

### Filtering and Search Implementation

**Filter Architecture**: Multi-dimensional filtering supporting trip assignment, date ranges, categories, and processing status. Filter state managed separately from main expense list state.

**Search Functionality**:
- Real-time search across merchant names with fuzzy matching
- Amount-based search supporting various formats ($50, 50.00, etc.)
- Search history persistence for frequently used terms
- Clear search with quick return to filtered list

**Filter Persistence**: User filter preferences saved to AsyncStorage for consistent experience across app sessions. Filter state restoration on app launch.

**Performance**: Debounced search input to prevent excessive filtering operations. Efficient filtering algorithms for large datasets. Memoized filter results to prevent unnecessary recalculations.

### Expense Editing Integration

**Form Reusability**: ExpenseForm component from Story 1.4 used in edit mode with pre-populated data. Form state management handles both creation and editing scenarios seamlessly.

**Data Validation**: Enhanced validation for editing scenarios including trip date constraints (expense date should fall within trip date range). Concurrent edit detection and resolution.

**State Synchronization**: Optimistic updates in expense list during editing. Real-time reflection of changes across all screens displaying expense data. Error handling with rollback capability for failed updates.

### Expense Deletion and Data Integrity

**Cascading Deletion**: When expense deleted, associated receipt image removed from file system. Database transaction ensures atomic operation - if image deletion fails, database deletion rollback.

**Safety Measures**:
- Confirmation dialog showing expense details for verification
- Undo functionality available within current session
- Clear explanation of what will be deleted (expense + receipt image)
- Trip total recalculation after successful deletion

**Error Handling**: Graceful handling of deletion failures. User feedback for various error scenarios (file system issues, database conflicts). Retry mechanisms for recoverable errors.

### Receipt Image Viewing

**Image Viewer Component**: Full-screen modal with gesture support for zoom, pan, and dismiss. High-performance image rendering with loading states and error handling for missing files.

**Image Management**:
- Display original capture metadata (timestamp, file size, compression ratio)
- Handle various image orientations and aspect ratios
- Graceful degradation for corrupted or missing image files
- Image replacement workflow for capturing better quality receipts

**Performance**: Lazy loading of receipt images in list view. Image caching for frequently viewed receipts. Memory management for large image files.

### Trip Integration and Context

**Trip Assignment Display**: Clear visual indicators for trip assignment status. Quick trip reassignment actions from expense list. "Unassigned" status handling with suggestions for trip assignment.

**Trip Totals**: Real-time calculation of trip totals when expenses modified. Trip-based expense summaries and analytics. Integration with trip management from Story 1.5.

### User Experience Enhancements

**Gesture Support**:
- Swipe actions for quick edit/delete operations
- Pull-to-refresh for manual data synchronization
- Long press for contextual action menus
- Pinch-to-zoom in receipt image viewer

**Visual Feedback**:
- Loading states for data operations
- Success/error feedback for user actions
- Progress indicators for batch operations
- Empty state guidance for new users

**Quick Actions**:
- Floating action button for quick expense creation
- Bulk selection for multiple expense operations
- Quick filter toggles for common views
- Share functionality for individual expenses

### Data Consistency and Synchronization

**State Management**: Comprehensive integration with global expense and trip stores. Real-time updates when data modified from other screens. Consistent state across navigation stack.

**Database Operations**: All operations through databaseService from Story 1.2. Transaction support for complex operations involving multiple data entities. Error recovery and retry mechanisms.

**Audit Trail**: Track expense modifications with timestamps and change history. Display processing method (AI service, offline OCR, manual entry) for user transparency.

### Accessibility and Platform Support

**Accessibility Features**:
- Screen reader support for all list items and actions
- High contrast mode compatibility
- Touch target size compliance for swipe actions
- Keyboard navigation support for external keyboards

**Platform Optimization**:
- Android: Material Design components and gesture patterns
- iOS: Native design language and interaction patterns
- Cross-platform gesture handling through react-native-gesture-handler

### Search and Filter Performance

**Optimization Strategies**:
- Debounced search input (300ms delay) to prevent excessive operations
- Indexed searching for large datasets
- Efficient filter algorithms with early termination
- Memoized results for repeated filter combinations

**Memory Management**: Proper cleanup of filtered results. Pagination support for very large expense lists. Virtual scrolling with proper item recycling.

### Integration Points

**Camera Integration**: Direct navigation to camera capture from expense list. Seamless flow from list management to receipt capture for new expenses.

**Trip Management**: Bi-directional integration with trip management screens. Consistent expense totals and counts across trip and expense views.

**Export Preparation**: Expense list provides foundation for export functionality in Epic 4. Selection state management for export operations.

### Testing Strategy

**Performance Testing**:
- Load testing with large expense datasets (1000+ items)
- Scroll performance validation with FlatList optimization
- Memory usage monitoring for image-heavy lists

**User Interaction Testing**:
- Swipe gesture reliability across different devices
- Search and filter responsiveness testing
- Image viewer gesture handling validation

**Data Integrity Testing**:
- Concurrent modification handling
- Database transaction validation for deletion operations
- State synchronization testing across screens

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-15 | 1.0 | Initial story creation from PRD Epic 1 | SM Agent |