# Story 2.4: Sliding Drawer Verification Interface

## Status
Draft

## Story

**As a** business traveler,
**I want** to verify and edit AI-extracted data using a sliding drawer overlay,
**so that** I can ensure accuracy while maintaining full visibility of the receipt image.

## Acceptance Criteria

1. Full-screen receipt image display with sliding drawer overlay for extracted data
2. Draggable drawer interface allowing users to position data fields for optimal receipt viewing
3. Gesture controls for expanding/collapsing drawer with smooth animations
4. Quick edit capabilities for all extracted data within the drawer interface
5. Visual indicators showing data source (AI service, offline OCR, or manual entry) within drawer
6. Save and cancel options with validation for required fields

## Tasks / Subtasks

- [ ] Create full-screen receipt image viewer component (AC: 1)
  - [ ] Create `src/components/verification/ReceiptImageViewer.tsx` with full-screen display
  - [ ] Implement pinch-to-zoom and pan gestures for detailed receipt examination
  - [ ] Add image loading states and error handling for missing/corrupted images
  - [ ] Support multiple image orientations and aspect ratios
  - [ ] Add image brightness/contrast adjustment controls for better visibility
  - [ ] Implement overlay-compatible gesture handling (no conflicts with drawer)
  - [ ] Add image metadata display (resolution, file size, capture time)

- [ ] Implement sliding drawer overlay component (AC: 2)
  - [ ] Create `src/components/verification/SlidingDrawer.tsx` with gesture-based positioning
  - [ ] Add draggable handle with visual feedback and haptic response
  - [ ] Implement smooth spring animations for drawer movement
  - [ ] Add snap points at 25%, 50%, and 90% screen height positions
  - [ ] Create semi-transparent backdrop that doesn't obscure receipt details
  - [ ] Handle drawer positioning persistence within session
  - [ ] Add keyboard-aware behavior for input field focus

- [ ] Create gesture control system with smooth animations (AC: 3)
  - [ ] Integrate react-native-gesture-handler for drawer positioning
  - [ ] Implement drag gesture with momentum and velocity calculations
  - [ ] Add spring animation system using react-native-reanimated
  - [ ] Create magnetic snap zones for intuitive drawer positioning
  - [ ] Add tap-to-collapse/expand functionality for quick adjustments
  - [ ] Implement gesture conflict resolution between image zoom and drawer drag
  - [ ] Add accessibility support for users with motor impairments

- [ ] Build comprehensive data editing interface within drawer (AC: 4)
  - [ ] Create editable form fields for all extracted data (merchant, amount, tax, date, category)
  - [ ] Add real-time validation with visual feedback for each field
  - [ ] Implement smart input types (numeric keypad for amounts, date picker for dates)
  - [ ] Add autocomplete suggestions for merchant names based on history
  - [ ] Create category picker with visual icons and quick selection
  - [ ] Implement field-level undo/redo functionality for corrections
  - [ ] Add bulk edit mode for rapid corrections across multiple fields

- [ ] Add data source indicators and confidence visualization (AC: 5)
  - [ ] Create visual badges showing extraction method (AI/OCR/Manual)
  - [ ] Add confidence indicators with color-coded system (green/yellow/red)
  - [ ] Display field-level confidence scores for individual data points
  - [ ] Show processing time and service used for transparency
  - [ ] Add confidence-based recommendations (e.g., "Review recommended")
  - [ ] Create data source legend and help tooltips
  - [ ] Implement confidence threshold customization in settings

- [ ] Implement save/cancel workflow with comprehensive validation (AC: 6)
  - [ ] Add prominent save and cancel buttons with clear visual hierarchy
  - [ ] Implement form validation preventing save with invalid data
  - [ ] Create confirmation dialog for canceling with unsaved changes
  - [ ] Add autosave functionality for prevention of data loss
  - [ ] Implement optimistic updates with rollback capability
  - [ ] Create success/error feedback with specific validation messages
  - [ ] Add keyboard shortcuts for power users (Ctrl+S, Escape)

## Dev Notes

### Sliding Drawer Architecture

**Gesture-Based Positioning**: Advanced gesture system using react-native-gesture-handler and react-native-reanimated for smooth, responsive drawer positioning. Drawer responds to user drag gestures with momentum and magnetic snap points.

**Animation System**: Spring-based animations provide natural feel for drawer movement. Animation curves tuned for mobile interaction patterns with appropriate damping and stiffness values.

**Snap Point System**:
- Collapsed (25%): Shows summary info (total amount, merchant)
- Partial (50%): Shows key fields with minimal scrolling
- Expanded (90%): Full form with all fields and advanced options

### Receipt Image Integration

**Full-Screen Display**: Receipt image serves as background with drawer overlay. Image viewer supports zoom and pan gestures that don't conflict with drawer positioning.

**Image Enhancement**: Optional image enhancement controls (brightness, contrast) to improve receipt visibility when reviewing extraction accuracy.

**Gesture Conflict Resolution**: Sophisticated gesture handling prevents conflicts between image zoom/pan and drawer positioning. Gesture priority system based on touch location and current drawer state.

### Data Editing Interface Design

**Form Architecture**: Comprehensive form system within drawer supporting all expense data fields. Field types optimized for mobile input (numeric keypads, date pickers, dropdowns).

**Validation System**:
```typescript
interface ValidationRule {
  field: string;
  validator: (value: any) => boolean;
  message: string;
  severity: 'error' | 'warning';
}

const validationRules: ValidationRule[] = [
  {
    field: 'merchant',
    validator: (value) => value && value.length >= 2,
    message: 'Merchant name is required',
    severity: 'error'
  },
  {
    field: 'amount',
    validator: (value) => value > 0 && value <= 10000,
    message: 'Amount must be between $0.01 and $10,000',
    severity: 'error'
  }
];
```

**Smart Input Features**:
- Autocomplete for merchant names from expense history
- Currency formatting with automatic decimal placement
- Date picker with business travel context (no future dates)
- Category selection with merchant-based suggestions

### Confidence Visualization System

**Confidence Indicators**: Multi-level confidence system with visual and textual feedback:
- High Confidence (80-100%): Green badge, minimal review needed
- Medium Confidence (60-79%): Yellow badge, quick review recommended
- Low Confidence (40-59%): Orange badge, careful review needed
- Very Low (<40%): Red badge, manual verification required

**Data Source Badges**:
- AI Service: "AI" badge with service name (GPT-4, Claude, Gemini)
- Offline OCR: "OCR" badge with accuracy disclaimer
- Manual Entry: "Manual" badge with user input indicator

**Field-Level Feedback**: Individual confidence scores for each extracted field help users focus review efforts on uncertain extractions.

### Gesture and Animation Implementation

**Drawer Gesture Handler**:
```typescript
const gestureHandler = useCallback(
  Gesture.Pan()
    .onStart(() => {
      startY.value = drawerY.value;
    })
    .onUpdate((event) => {
      drawerY.value = Math.max(
        minHeight,
        Math.min(maxHeight, startY.value + event.translationY)
      );
    })
    .onEnd((event) => {
      const velocity = event.velocityY;
      const snapPoint = getClosestSnapPoint(drawerY.value, velocity);
      drawerY.value = withSpring(snapPoint, springConfig);
    }),
  []
);
```

**Animation Configuration**:
```typescript
const springConfig = {
  damping: 20,
  stiffness: 200,
  mass: 1,
  restSpeedThreshold: 0.001,
  restDisplacementThreshold: 0.001,
};
```

### User Experience Optimization

**Haptic Feedback**: Subtle haptic feedback for drawer snapping, successful saves, and validation errors. Platform-specific haptic patterns for Android and iOS.

**Keyboard Handling**: Drawer automatically adjusts position when keyboard appears to prevent field obscuring. Smart focus management for sequential field entry.

**Performance Optimization**: Optimized rendering for smooth 60fps animations. Gesture debouncing prevents excessive state updates during rapid movements.

### Accessibility Implementation

**Screen Reader Support**: Comprehensive VoiceOver/TalkBack support with semantic labels and navigation hints. Audio feedback for drawer position changes.

**Motor Accessibility**: Alternative interaction methods for users with limited motor control including tap-to-position and voice control integration.

**Visual Accessibility**: High contrast mode support, customizable font sizes, and color-blind friendly confidence indicators.

### Integration with Processing Pipeline

**Data Flow**: Drawer receives extracted data from AI services, offline OCR, or manual entry. Unified data structure ensures consistent editing experience regardless of source.

**State Management**: Integration with expense store for real-time updates. Optimistic updates provide immediate feedback while background saving ensures data persistence.

**Error Handling**: Comprehensive error handling for save failures, validation errors, and network issues with clear user feedback and recovery options.

### Platform-Specific Considerations

**Android Implementation**:
- Material Design drawer styling with platform-appropriate shadows
- Android-specific gesture patterns and haptic feedback
- Keyboard behavior optimization for Android input methods

**iOS Implementation**:
- iOS design language with native feel and animations
- iOS-specific gesture recognizers and haptic patterns
- Integration with iOS accessibility features

### Advanced Features

**Bulk Edit Mode**: Advanced editing mode for power users making multiple corrections efficiently. Field navigation shortcuts and batch validation.

**Comparison Mode**: Side-by-side view of original extraction vs user edits for verification. Highlight changed fields for audit purposes.

**Learning System**: Track user corrections to improve future extraction accuracy. Pattern recognition for common correction types.

### Testing Strategy

**Gesture Testing**: Comprehensive testing of drawer positioning across different device sizes and orientations. Gesture conflict resolution validation.

**Animation Performance**: Frame rate monitoring during intensive animations. Memory usage validation for complex gesture interactions.

**Accessibility Testing**: Full accessibility compliance testing with screen readers and assistive technologies. Motor accessibility validation with alternative input methods.

**Integration Testing**: End-to-end testing of verification workflow with various data sources and extraction confidence levels.

### Error States and Recovery

**Image Loading Failures**: Graceful handling of missing or corrupted receipt images with placeholder content and retry mechanisms.

**Gesture Failures**: Fallback interaction methods when gesture recognition fails. Clear error messages and alternative navigation options.

**Save Failures**: Robust error handling for save operations with automatic retry, manual retry options, and data preservation during failures.

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-15 | 1.0 | Initial story creation from PRD Epic 2 | SM Agent |