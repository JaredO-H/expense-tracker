# Story 2.1: AI Service Configuration and Authentication

## Status
Draft

## Story

**As a** business traveler,
**I want** to configure my preferred AI service with secure API key storage,
**so that** I can use AI-powered receipt processing with my chosen provider.

## Acceptance Criteria

1. Settings screen allows selection between OpenAI, Anthropic, and Google Gemini
2. Secure API key entry and storage using Android Keystore
3. API key validation with test connection for each service
4. Service selection persists as user default preference
5. Clear instructions for obtaining API keys from each provider

## Tasks / Subtasks

- [ ] Create AI service configuration settings screen (AC: 1)
  - [ ] Create `src/screens/settings/AIServiceSettings.tsx` configuration interface
  - [ ] Add service selection radio buttons for OpenAI, Anthropic, and Google Gemini
  - [ ] Display service descriptions and capabilities for each provider
  - [ ] Show current selected service with visual confirmation
  - [ ] Add service comparison information (speed, accuracy, cost estimates)
  - [ ] Include service status indicators (configured, testing, error)

- [ ] Implement secure API key storage and management (AC: 2)
  - [ ] Create `src/services/security/credentialService.ts` for secure storage
  - [ ] Integrate react-native-keychain for API key encryption and storage
  - [ ] Add separate secure storage slots for each AI service
  - [ ] Implement API key validation format for each service
  - [ ] Add API key masking in UI (show only last 4 characters)
  - [ ] Create secure key deletion when service changed
  - [ ] Handle keychain access errors gracefully

- [ ] Create API key validation and test connection functionality (AC: 3)
  - [ ] Implement test connection feature for each AI service
  - [ ] Create simple test image processing to validate API functionality
  - [ ] Add connection status feedback (success, failure, timeout)
  - [ ] Display detailed error messages for API key issues
  - [ ] Show service-specific validation requirements
  - [ ] Add retry mechanism for failed validation attempts
  - [ ] Include network connectivity checks before testing

- [ ] Implement service preference persistence and state management (AC: 4)
  - [ ] Create settings store for AI service preferences using Zustand
  - [ ] Persist selected service to AsyncStorage for app restart recovery
  - [ ] Add settings migration support for future service additions
  - [ ] Integrate with global app settings and preferences
  - [ ] Handle service unavailability with fallback options
  - [ ] Update AI service client configurations on preference changes

- [ ] Add comprehensive user guidance and instructions (AC: 5)
  - [ ] Create help screens with API key acquisition instructions for each service
  - [ ] Add step-by-step guides for OpenAI, Anthropic, and Google Cloud setup
  - [ ] Include cost estimation guidance and usage expectations
  - [ ] Add troubleshooting guide for common configuration issues
  - [ ] Provide links to official service documentation
  - [ ] Create onboarding flow for first-time AI service setup

## Dev Notes

### AI Service Architecture

**Service Configuration**: Support for three AI services with extensible architecture for future providers. Each service has distinct authentication methods, API endpoints, and response formats requiring service-specific handling.

**Service Specifications**:
- **OpenAI**: GPT-4 Vision API with Bearer token authentication
- **Anthropic**: Claude 3 Sonnet with API key header authentication  
- **Google Gemini**: Gemini Pro Vision with API key parameter authentication

**Configuration Structure**:
```typescript
interface AIServiceConfig {
  id: 'openai' | 'anthropic' | 'gemini';
  name: string;
  description: string;
  apiKeyFormat: RegExp;
  testEndpoint: string;
  costEstimate: string;
  capabilities: string[];
}
```

### Secure Credential Management

**react-native-keychain Integration**: All API keys stored using device keychain services for maximum security. Separate keychain entries for each service to enable multiple service configurations.

**Security Implementation**:
- API keys never stored in AsyncStorage or plain text
- Automatic keychain access on app launch with biometric protection
- Secure deletion when service configuration changed
- Key rotation support for security best practices

**Access Control**: Keychain access with device authentication (PIN, fingerprint, face recognition). Graceful fallback when biometric authentication unavailable.

### API Key Validation System

**Test Connection Framework**: Lightweight test requests to validate API key functionality without incurring significant costs. Use simple text recognition test rather than full receipt processing.

**Validation Process**:
1. Format validation using service-specific patterns
2. Network connectivity verification
3. API authentication test with minimal request
4. Response parsing validation
5. Error categorization and user feedback

**Error Handling**: Comprehensive error classification including invalid key format, authentication failures, network issues, service unavailability, and rate limiting.

### Service Configuration UI Design

**Settings Interface**: Clean, intuitive interface following Material Design principles. Clear visual hierarchy with service selection, key entry, and validation status.

**User Experience Flow**:
1. Service selection with comparison information
2. API key entry with format validation
3. Test connection with progress feedback
4. Confirmation and save with success indication
5. Optional onboarding for additional services

**Visual Feedback**: Real-time validation indicators, connection test progress, and clear success/error states with actionable guidance.

### Service Comparison and Guidance

**Service Comparison Matrix**:
- Processing speed estimates
- Accuracy expectations for receipt types
- Cost per processing estimate
- Special capabilities (multilingual, handwriting, etc.)

**User Guidance Content**:
- Step-by-step API key acquisition for each service
- Cost management recommendations
- Usage best practices
- Troubleshooting common issues

### Settings Store Integration

**State Management**: Integration with global settings store for AI service preferences. Reactive updates when service configuration changes affecting other app components.

**Persistence Strategy**: AsyncStorage for service selection and non-sensitive preferences. Keychain for API credentials. Settings migration support for app updates.

**Configuration Validation**: Startup validation of stored service configurations. Graceful degradation when configured service unavailable.

### Service Client Factory

**Dynamic Service Creation**: Factory pattern for creating AI service clients based on user configuration. Runtime service switching without app restart.

**Client Configuration**:
```typescript
interface AIServiceClient {
  serviceId: string;
  processReceipt(imageData: string): Promise<ProcessingResult>;
  testConnection(): Promise<boolean>;
  getUsageInfo(): Promise<UsageInfo>;
}
```

**Error Handling**: Consistent error interface across all service implementations. Service-specific error translation to user-friendly messages.

### Cost Management and Transparency

**Usage Tracking**: Basic usage statistics for cost awareness. Processing count and estimated costs per service. Monthly usage summaries for budget planning.

**Cost Education**: Clear guidance on typical processing costs. Recommendations for cost-effective usage patterns. Warnings for high-volume processing scenarios.

### API Service Integration Patterns

**Authentication Headers**:
- OpenAI: `Authorization: Bearer ${apiKey}`
- Anthropic: `x-api-key: ${apiKey}`, `anthropic-version: 2023-06-01`
- Gemini: API key as query parameter or request body

**Request Formats**: Service-specific payload structures for image processing requests. Consistent internal interface with service-specific serialization.

**Response Parsing**: Unified response parsing into common internal format. Service-specific extraction logic for receipt data fields.

### Testing and Validation Strategy

**Connection Testing**: Minimal test requests for each service to validate functionality. Use small test images or text processing to minimize costs during validation.

**Integration Testing**: Comprehensive testing of service switching, credential storage, and error handling across all supported services.

**Security Testing**: Validation of secure credential storage, proper keychain integration, and protection against credential exposure.

### Platform-Specific Considerations

**Android Keystore**: Integration with Android Keystore for hardware-backed security. Proper handling of keystore availability and access permissions.

**iOS Keychain**: iOS Keychain Services integration for secure credential storage. Biometric authentication integration for keychain access.

**Cross-Platform**: Consistent user experience across platforms while leveraging platform-specific security capabilities.

### Error Recovery and Fallback

**Service Unavailability**: Graceful handling when preferred service unavailable. Clear user notification and fallback to offline processing options.

**Credential Issues**: Clear error messages for expired, invalid, or revoked API keys. Guided recovery process for credential problems.

**Network Failures**: Retry logic for temporary network issues. Offline mode activation when persistent connectivity problems detected.

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-15 | 1.0 | Initial story creation from PRD Epic 2 | SM Agent |