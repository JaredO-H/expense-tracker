# Story 1.4: Manual Expense Entry Interface

## Status
Draft

## Story

**As a** business traveler,
**I want** to manually enter expense details when needed,
**so that** I can record expenses even without AI processing.

## Acceptance Criteria

1. Form interface for entering merchant, amount, tax details, date, and category
2. Date picker with default to current date
3. Category dropdown with meal, transport, accommodation, office, other options
4. Form validation for required fields and proper data formats
5. Save expense with associated receipt image to local database

## Tasks / Subtasks

- [ ] Create manual expense entry form component (AC: 1)
  - [ ] Create `src/components/forms/ExpenseForm.tsx` with react-hook-form integration
  - [ ] Add merchant name input field with validation
  - [ ] Add amount input with currency formatting and numeric keypad
  - [ ] Add tax amount input (optional) with currency formatting
  - [ ] Add tax type input (optional) with common options (VAT, GST, Sales Tax, etc.)
  - [ ] Add tax rate input (optional) with percentage formatting
  - [ ] Implement form field styling consistent with app theme
  - [ ] Add form submission and cancel action buttons

- [ ] Implement date picker functionality (AC: 2)
  - [ ] Create date picker component with native date selection
  - [ ] Set default date to current date (today)
  - [ ] Add date validation (no future dates, reasonable past date limits)
  - [ ] Format date display according to user locale preferences
  - [ ] Handle timezone considerations for business travel

- [ ] Create category selection dropdown (AC: 3)
  - [ ] Implement category picker with predefined options
  - [ ] Categories: Meal, Transport, Accommodation, Office Supplies, Other
  - [ ] Add category icons for visual identification
  - [ ] Set default category based on heuristics (time of day, amount ranges)
  - [ ] Allow custom category creation for edge cases

- [ ] Add comprehensive form validation (AC: 4)
  - [ ] Required field validation (merchant, amount, date, category)
  - [ ] Amount validation (positive numbers, decimal places, maximum limits)
  - [ ] Merchant name validation (minimum length, special characters)
  - [ ] Tax calculations validation (tax amount ≤ total amount)
  - [ ] Date validation (not in future, within reasonable business travel range)
  - [ ] Real-time validation feedback with error messages
  - [ ] Form submission prevention when validation errors exist

- [ ] Implement expense saving with database integration (AC: 5)
  - [ ] Create expense object from form data with proper typing
  - [ ] Generate unique expense ID and timestamps
  - [ ] Associate receipt image (from camera capture) with expense record
  - [ ] Save expense to SQLite database using databaseService
  - [ ] Handle save errors with user feedback and retry options
  - [ ] Clear form and navigate to success confirmation
  - [ ] Update expense list in global state

## Dev Notes

### Form Architecture and State Management

**react-hook-form Integration**: Use react-hook-form for efficient form state management, validation, and performance optimization. Minimizes re-renders and provides robust validation patterns.

**Form Schema**: TypeScript interface defining all form fields with proper types:
```typescript
interface ExpenseFormData {
  merchant: string;
  amount: number;
  taxAmount?: number;
  taxType?: string;
  taxRate?: number;
  date: string; // ISO date format
  category: ExpenseCategory;
  notes?: string;
}
```

**Validation Strategy**: Client-side validation with immediate feedback. Server-side validation principles applied to local database operations for data integrity.

### Input Field Specifications

**Merchant Name Field**:
- Text input with autocomplete from previous entries
- Minimum 2 characters, maximum 100 characters
- Trim whitespace and title case formatting
- Validation: Required field with length constraints

**Amount Input**:
- Numeric keypad with decimal support
- Currency symbol display based on user settings
- Automatic formatting with proper decimal places
- Maximum amount: $9,999.99 for reasonable expense limits
- Validation: Positive numbers only, proper decimal format

**Tax Fields (Optional)**:
- Tax amount: Currency input linked to total amount
- Tax type: Dropdown with common types (VAT, GST, Sales Tax, None)
- Tax rate: Percentage input with automatic calculation
- Smart validation: Tax amount cannot exceed total amount

### Date and Time Handling

**Date Picker Implementation**:
- Native date picker for optimal UX on mobile platforms
- Default to current date for immediate expense entry
- Validation: No future dates, reasonable past range (1 year max)
- Timezone awareness for business travel scenarios

**Business Logic**: 
- Expense date should reflect when expense occurred, not when entered
- Support for different time zones during travel
- Date formatting according to user locale preferences

### Category Management

**Predefined Categories**:
- Meal: Restaurant, food delivery, groceries for business
- Transport: Flights, trains, taxis, ride shares, parking, fuel
- Accommodation: Hotels, Airbnb, extended stay
- Office Supplies: Equipment, software, stationery
- Other: Miscellaneous business expenses

**Category Selection**:
- Dropdown with visual icons for quick identification
- Smart defaults based on time of day and amount ranges
- Custom category option for edge cases
- Category statistics for user insights

### Form Validation Implementation

**Real-time Validation**:
- Field-level validation on blur and form-level on submit
- Visual validation indicators (red borders, check marks)
- Error messages displayed below invalid fields
- Form submission disabled until all validation passes

**Validation Rules**:
- Merchant: Required, 2-100 characters, trim whitespace
- Amount: Required, positive number, max $9,999.99
- Date: Required, not future, within 1 year past
- Category: Required, must be valid enum value
- Tax fields: Optional but validated if provided

**Error Handling**: User-friendly error messages with actionable guidance. Network/database error handling with retry mechanisms.

### Database Integration

**Expense Creation Flow**:
1. Validate form data against schema
2. Generate unique expense ID (UUID)
3. Create timestamps (created_at, updated_at)
4. Associate with receipt image if captured
5. Save to SQLite database via databaseService
6. Update global state with new expense
7. Navigate to confirmation or expense list

**Data Persistence**:
- All form data saved to local SQLite database
- Receipt image path stored as reference
- Manual entry flag set to true for non-AI expenses
- Trip assignment deferred to separate flow

### User Experience Design

**Form Layout**:
- Single-screen form with logical field grouping
- Progressive disclosure for optional fields (tax details)
- Clear visual hierarchy with proper spacing
- Mobile-optimized input fields and touch targets

**Input Optimization**:
- Appropriate keyboard types (numeric for amounts, text for merchant)
- Auto-focus progression through form fields
- Smart defaults to minimize user input
- Autocomplete suggestions from previous entries

**Navigation Flow**:
- Save and continue to trip assignment
- Save and add another expense
- Cancel with unsaved changes confirmation
- Back navigation with draft preservation

### Accessibility and Usability

**Accessibility Features**:
- Proper form labels and accessibility hints
- Screen reader support for all form fields
- High contrast mode compatibility
- Touch target size compliance (44pt minimum)

**Usability Enhancements**:
- Field validation feedback without being intrusive
- Clear indication of required vs optional fields
- Helpful placeholder text and formatting examples
- Undo capability for accidental form clears

### Error States and Recovery

**Validation Errors**:
- Clear, actionable error messages
- Visual indicators for problematic fields
- Scroll to first error on form submission attempt
- Preserve valid field data when correcting errors

**System Errors**:
- Database save failures with retry mechanism
- Network issues handled gracefully
- Form data preservation during app backgrounding
- Crash recovery with form state restoration

### Integration Points

**Camera Integration**: Seamless flow from camera capture to manual entry form. Receipt image automatically associated with expense record.

**Database Service**: Integration with databaseService from Story 1.2 for consistent data operations. Transaction support for atomic operations.

**State Management**: Integration with expense store for global state updates. Real-time list updates when expenses created.

**Navigation**: Proper navigation flow to trip assignment, expense list, or confirmation screens based on user choice.

### Testing Strategy

**Form Validation Testing**:
- Test all validation rules with edge cases
- Verify error message accuracy and clarity
- Test form submission prevention with invalid data

**Integration Testing**:
- Test database save operations with various data combinations
- Verify receipt image association
- Test state management updates

**Usability Testing**:
- Test form completion speed and ease
- Verify keyboard navigation and input types
- Test accessibility features with screen readers

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-15 | 1.0 | Initial story creation from PRD Epic 1 | SM Agent |