# Story 2.5: Processing Status and Error Handling

## Status
Draft

## Story

**As a** business traveler,
**I want** clear feedback about receipt processing status and any errors,
**so that** I understand what's happening and can take appropriate action.

## Acceptance Criteria

1. Loading indicators during AI service processing with estimated time
2. Success/failure status with specific error messages for each failure type
3. Retry mechanisms for temporary failures (network, rate limits)
4. User-friendly error messages explaining next steps for each error condition
5. Processing history showing which service was used for each expense

## Tasks / Subtasks

- [ ] Create comprehensive loading and progress indicators (AC: 1)
  - [ ] Create `src/components/ui/ProcessingIndicator.tsx` with animated progress states
  - [ ] Add processing stage indicators (uploading, analyzing, extracting, validating)
  - [ ] Implement estimated time calculation based on service and image size
  - [ ] Create service-specific loading animations (AI service logos/indicators)
  - [ ] Add progress percentage for longer operations with detailed status
  - [ ] Implement cancellation capability for long-running processes
  - [ ] Add background processing indicators when app is in use

- [ ] Implement success/failure status system with detailed messaging (AC: 2)
  - [ ] Create `src/services/ai/statusManager.ts` for centralized status handling
  - [ ] Add success indicators with extraction summary and confidence scores
  - [ ] Implement failure categorization (network, auth, rate limit, service error, parsing)
  - [ ] Create error message templates for each failure type with actionable guidance
  - [ ] Add detailed error logging for debugging while preserving user privacy
  - [ ] Implement status persistence for processing history and audit trails
  - [ ] Create visual status indicators for expense list items

- [ ] Build retry mechanisms for recoverable failures (AC: 3)
  - [ ] Implement exponential backoff for rate limit and temporary service errors
  - [ ] Add manual retry options with clear retry button placement
  - [ ] Create automatic retry logic for network connectivity issues
  - [ ] Implement service fallback (try alternate AI service if primary fails)
  - [ ] Add retry limit enforcement to prevent infinite retry loops
  - [ ] Create retry queue management with priority handling
  - [ ] Store retry attempts and reasons for user transparency

- [ ] Create user-friendly error communication system (AC: 4)
  - [ ] Design error message templates with clear language and next steps
  - [ ] Add contextual help for common error scenarios with troubleshooting guides
  - [ ] Implement progressive error disclosure (summary first, details on request)
  - [ ] Create error categorization for user understanding (temporary vs permanent)
  - [ ] Add contact/support options for persistent technical issues
  - [ ] Implement error reporting functionality for debugging assistance
  - [ ] Create offline error handling with queued processing explanations

- [ ] Build processing history and audit trail system (AC: 5)
  - [ ] Create processing history data model with service, timing, and outcome details
  - [ ] Add processing method badges to expense list items and details
  - [ ] Implement processing statistics dashboard for user insights
  - [ ] Create detailed processing log accessible from expense details
  - [ ] Add service performance metrics and reliability indicators
  - [ ] Store processing metadata for debugging and improvement purposes
  - [ ] Create export functionality for processing history if needed

## Dev Notes

### Processing Status Architecture

**Status State Management**: Centralized status management system tracking processing lifecycle from initiation through completion or failure. Real-time status updates across UI components.

**Status Categories**:
- Queued: Waiting for processing capacity or network connectivity
- Uploading: Image upload in progress
- Processing: AI service analyzing receipt
- Extracting: Data extraction and parsing
- Validating: Data validation and confidence scoring
- Completed: Successfully processed with extracted data
- Failed: Processing failed with specific error categorization

**Progress Tracking**: Granular progress tracking for user feedback including upload progress, processing stages, and estimated completion times based on historical data.

### Error Classification System

**Error Categories with User-Friendly Messages**:

**Network Errors**:
- Connection timeout: "Network connection slow. Trying again..."
- No connectivity: "No internet connection. Will process when online."
- DNS/Server unreachable: "Service temporarily unavailable. Retrying shortly."

**Authentication Errors**:
- Invalid API key: "API key invalid. Please check your settings."
- Expired key: "API key expired. Please update in settings."
- Rate limited: "Too many requests. Waiting 60 seconds before retry."

**Service Errors**:
- Service unavailable: "AI service temporarily down. Trying offline processing."
- Quota exceeded: "Monthly quota reached. Consider upgrading or use offline mode."
- Request rejected: "Image couldn't be processed. Try with better lighting."

**Processing Errors**:
- Parse failure: "Couldn't read receipt clearly. Please review and edit."
- Invalid response: "Processing incomplete. Some data may need manual entry."
- Confidence too low: "Low confidence in extraction. Please verify all fields."

### Retry Logic Implementation

**Exponential Backoff Strategy**:
```typescript
interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,      // 1 second
  maxDelay: 30000,      // 30 seconds
  backoffMultiplier: 2
};

const calculateDelay = (attempt: number, config: RetryConfig): number => {
  const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelay);
};
```

**Retry Decision Matrix**:
- Network errors: Automatic retry with exponential backoff
- Rate limiting: Automatic retry with service-specified delay
- Authentication errors: No automatic retry, require user intervention
- Service errors: Try alternative service if available, then manual retry
- Parse errors: No retry, direct to manual review

### User Interface Design

**Loading States**: Progressive loading indicators showing current processing stage. Estimated time remaining based on historical processing times for similar images and services.

**Status Feedback**: Clear visual hierarchy for status communication:
- Primary: Current status (processing, complete, failed)
- Secondary: Progress details (stage, time remaining)
- Tertiary: Technical details (service used, attempt number)

**Error Communication**: Layered error presentation:
1. Simple status: "Processing failed"
2. User action: "Try offline processing or enter manually"
3. Technical details: Available on tap for debugging

### Processing History Implementation

**History Data Model**:
```typescript
interface ProcessingRecord {
  id: string;
  expenseId: string;
  timestamp: Date;
  service: 'openai' | 'anthropic' | 'gemini' | 'offline' | 'manual';
  status: 'completed' | 'failed' | 'cancelled';
  duration: number; // milliseconds
  attempts: number;
  confidence?: number;
  errorType?: string;
  errorMessage?: string;
}
```

**History Presentation**: Processing method badges in expense lists, detailed processing log in expense details, aggregated statistics for service reliability assessment.

### Real-Time Status Updates

**WebSocket Alternative**: Since this is device-only storage, use local state management with proper loading states and optimistic updates. No real-time server communication required.

**Progress Broadcasting**: Event-driven progress updates across components using global state management. Status changes immediately reflected in all relevant UI elements.

### Error Recovery Workflows

**Graceful Degradation Path**:
1. Primary AI service fails → Try configured backup service
2. All AI services fail → Offer offline OCR processing
3. Offline processing fails → Direct to manual entry
4. Manual entry → Always available as final fallback

**User Choice Integration**: When automatic retry fails, present user with clear choices and expected outcomes for each option.

### Performance Monitoring

**Processing Metrics**: Track processing times, success rates, and error frequencies by service for user insights and system optimization.

**Service Health Indicators**: Real-time service availability status in settings. Historical reliability data for service selection guidance.

### Accessibility and User Experience

**Screen Reader Support**: Comprehensive status announcements for visually impaired users. Progress updates and error messages properly announced.

**Visual Indicators**: Color-blind friendly status indicators using shapes and patterns in addition to colors. High contrast mode support.

**Interruption Handling**: Graceful handling of app backgrounding during processing. Proper state restoration when app returns to foreground.

### Testing Strategy

**Error Simulation**: Comprehensive testing with simulated network failures, rate limiting, and service unavailability. Validation of retry logic and user communication.

**Progress Accuracy**: Validation of progress indicators and estimated time accuracy across different scenarios and device capabilities.

**Status Consistency**: Testing status synchronization across multiple app screens and state management edge cases.

### Integration Points

**Queue Integration**: Seamless integration with processing queue from Story 2.2. Status updates properly reflected in queue management.

**Service Integration**: Consistent error handling across all AI services. Service-specific error translation and retry behavior.

**Verification Integration**: Processing status and history available in verification drawer for user transparency and debugging.

### Platform Considerations

**Android Notifications**: Background processing status through Android notifications when app is not in foreground. Respect user notification preferences.

**iOS Background**: Proper iOS background processing limits handling. Clear communication when processing is paused due to system limitations.

### Security and Privacy

**Error Logging**: Detailed error logging for debugging while ensuring no sensitive data (API keys, image content) is logged. Privacy-compliant error reporting.

**Processing Metadata**: Store processing history and metadata securely. Option to clear processing history for privacy-conscious users.

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-15 | 1.0 | Initial story creation from PRD Epic 2 | SM Agent |