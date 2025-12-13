# Story 2.2: Receipt Image Processing Pipeline

## Status
Draft

## Story

**As a** business traveler,
**I want** the app to automatically process my receipt photos with AI,
**so that** expense data is extracted without manual typing.

## Acceptance Criteria

1. Processing queue manages receipt images for AI service calls
2. Image preprocessing (compression, rotation correction) before API transmission
3. Service-specific API integration for OpenAI Vision, Claude, and Gemini APIs
4. Structured prompt engineering to extract merchant, amount, tax details, date, category
5. JSON response parsing with validation and error handling for malformed responses

## Tasks / Subtasks

- [ ] Create receipt processing queue system (AC: 1)
  - [ ] Create `src/services/queue/processingQueue.ts` for async processing management
  - [ ] Implement queue data structure with priority and retry logic
  - [ ] Add queue item status tracking (pending, processing, completed, failed)
  - [ ] Create background processing with network connectivity awareness
  - [ ] Implement queue persistence using AsyncStorage for app restart recovery
  - [ ] Add queue monitoring and status reporting for user feedback
  - [ ] Handle concurrent processing limits to prevent API rate limiting

- [ ] Implement image preprocessing pipeline (AC: 2)
  - [ ] Create `src/services/ai/imageProcessor.ts` for image preparation
  - [ ] Add automatic image rotation detection and correction using EXIF data
  - [ ] Implement image compression optimization for API transmission (max 1MB)
  - [ ] Add image format conversion to JPEG if needed
  - [ ] Create image quality validation to ensure processable images
  - [ ] Implement base64 encoding for API payload preparation
  - [ ] Add image enhancement filters for better OCR results (contrast, sharpening)

- [ ] Build AI service API integration layer (AC: 3)
  - [ ] Create `src/services/ai/aiServiceClient.ts` with service factory pattern
  - [ ] Implement OpenAI GPT-4 Vision API integration with proper payload structure
  - [ ] Implement Anthropic Claude 3 Vision API integration with message format
  - [ ] Implement Google Gemini Pro Vision API integration with content format
  - [ ] Add service-specific error handling and rate limit management
  - [ ] Create unified service interface for consistent processing workflow
  - [ ] Add request timeout handling and retry logic for each service

- [ ] Design structured prompts for receipt data extraction (AC: 4)
  - [ ] Create comprehensive receipt analysis prompt template
  - [ ] Define JSON schema for consistent response format across services
  - [ ] Add prompt instructions for merchant name, amount, tax details extraction
  - [ ] Include date parsing instructions with multiple format support
  - [ ] Add category classification guidance (meal, transport, accommodation, office, other)
  - [ ] Create confidence scoring instructions for data reliability assessment
  - [ ] Add special handling instructions for foreign receipts and currencies

- [ ] Implement response parsing and validation system (AC: 5)
  - [ ] Create `src/services/ai/responseParser.ts` for unified response handling
  - [ ] Add JSON extraction from AI service responses with error recovery
  - [ ] Implement data validation for all extracted fields (merchant, amount, date, etc.)
  - [ ] Add confidence scoring and data quality assessment
  - [ ] Create fallback parsing for partial or malformed responses
  - [ ] Implement response caching to avoid duplicate processing
  - [ ] Add extracted data sanitization and normalization

## Dev Notes

### Processing Queue Architecture

**Queue Implementation**: Asynchronous processing queue using a priority-based system. Higher priority for recent captures, lower priority for retries. Queue persistence ensures processing continues after app restart.

**Queue Management**:
- Maximum concurrent processing: 2 requests to prevent rate limiting
- Automatic retry logic: 3 attempts with exponential backoff
- Network awareness: Pause processing when offline, resume when connected
- Priority levels: Immediate (user waiting), Normal (background), Retry (failed items)

**Status Tracking**: Comprehensive status tracking for user feedback including processing progress, estimated completion time, and detailed error information for failed items.

### Image Preprocessing Pipeline

**Image Optimization Strategy**:
- Target size: Under 1MB for optimal API transmission speed
- Quality preservation: Maintain text readability while reducing file size
- Format standardization: Convert all images to JPEG for consistent processing
- EXIF data handling: Extract and apply rotation information automatically

**Preprocessing Steps**:
1. Load image and extract EXIF metadata
2. Apply rotation correction based on EXIF orientation
3. Resize if larger than 2048x2048 pixels while maintaining aspect ratio
4. Apply image enhancement (contrast adjustment, sharpening for text clarity)
5. Compress to target file size with quality optimization
6. Convert to base64 encoding for API transmission

**Quality Validation**: Pre-processing validation to ensure images are suitable for OCR processing. Reject images that are too blurry, dark, or low resolution with user feedback.

### AI Service Integration Architecture

**Service Factory Pattern**: Unified interface for all AI services with service-specific implementations. Runtime service selection based on user configuration from Story 2.1.

**API Integration Specifications**:

**OpenAI GPT-4 Vision**:
```typescript
{
  model: "gpt-4-vision-preview",
  messages: [{
    role: "user", 
    content: [
      { type: "text", text: promptText },
      { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` }}
    ]
  }],
  max_tokens: 1000,
  temperature: 0.1
}
```

**Anthropic Claude 3**:
```typescript
{
  model: "claude-3-sonnet-20240229",
  max_tokens: 1000,
  messages: [{
    role: "user",
    content: [
      { type: "text", text: promptText },
      { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 }}
    ]
  }]
}
```

**Google Gemini Pro Vision**:
```typescript
{
  contents: [{
    parts: [
      { text: promptText },
      { inline_data: { mime_type: "image/jpeg", data: imageBase64 }}
    ]
  }],
  generationConfig: { temperature: 0.1, maxOutputTokens: 1000 }
}
```

### Prompt Engineering for Receipt Processing

**Structured Prompt Template**:
```
Analyze this receipt image and extract expense information. Return ONLY valid JSON with this exact structure:

{
  "merchant": "business name from receipt",
  "amount": 25.99,
  "tax_amount": 2.50,
  "tax_type": "VAT" | "GST" | "Sales Tax" | "Service Tax" | null,
  "tax_rate": 10.5,
  "date": "2024-01-15",
  "category": "meal" | "transport" | "accommodation" | "office" | "other",
  "confidence": 0.95,
  "currency": "USD",
  "notes": "any additional relevant information"
}

Requirements:
- Extract merchant name exactly as printed
- Parse total amount as number (no currency symbols)
- Identify tax information if present
- Date in YYYY-MM-DD format
- Classify expense category based on merchant type
- Confidence score 0.0-1.0 for extraction quality
- Return "null" for missing information
```

**Category Classification Guidelines**:
- Meal: Restaurants, cafes, food delivery, grocery stores
- Transport: Airlines, trains, taxis, ride-share, parking, fuel
- Accommodation: Hotels, Airbnb, extended stay facilities
- Office: Office supplies, software, equipment, co-working spaces
- Other: Everything else not fitting above categories

### Response Parsing and Validation

**JSON Extraction Strategy**: Multiple extraction methods to handle various AI response formats including JSON blocks, code blocks, and mixed content responses.

**Validation Framework**:
```typescript
interface ExtractedReceiptData {
  merchant: string;           // Required, 1-100 characters
  amount: number;            // Required, positive number
  tax_amount?: number;       // Optional, <= amount
  tax_type?: string;         // Optional, predefined values
  tax_rate?: number;         // Optional, 0-100 percentage
  date: string;              // Required, valid date format
  category: ExpenseCategory; // Required, enum value
  confidence: number;        // Required, 0.0-1.0
  currency?: string;         // Optional, ISO code
  notes?: string;           // Optional, additional info
}
```

**Data Sanitization**:
- Merchant name: Trim whitespace, title case formatting, remove special characters
- Amount: Validate positive numbers, handle various decimal formats
- Date: Support multiple formats (MM/DD/YYYY, DD.MM.YYYY, YYYY-MM-DD)
- Category: Map variations to standard categories with confidence scoring

### Error Handling and Recovery

**Service-Specific Error Handling**:
- Rate limiting: Exponential backoff with service-specific limits
- Authentication errors: Clear user guidance for API key issues
- Invalid responses: Graceful fallback to partial data extraction
- Network errors: Queue item retry with connectivity awareness

**Confidence-Based Validation**: Low confidence scores trigger additional validation or suggest manual review. Confidence thresholds configurable per user preference.

**Fallback Strategies**:
1. AI service failure → Retry with different service if configured
2. Partial extraction → Use available data, mark fields as needing review
3. Complete failure → Add to manual review queue with error details

### Performance and Cost Optimization

**Request Optimization**:
- Image compression reduces API transmission costs
- Structured prompts minimize token usage
- Response caching prevents duplicate processing
- Batch processing for multiple receipts when appropriate

**Cost Management**:
- Processing cost estimation before API calls
- User alerts for high-volume processing
- Usage statistics for cost awareness
- Optional cost limits with user confirmation for overrides

### Integration with Processing Queue

**Queue Integration**: Seamless integration with processing queue from Epic 1 foundation. Queue items automatically processed when network available and service configured.

**Status Updates**: Real-time status updates for user feedback including processing progress, estimated completion time, and success/failure notifications.

**Result Handling**: Successful processing results automatically integrated with expense creation workflow. Failed processing items queued for user review or retry.

### Testing Strategy

**Unit Testing**:
- Image preprocessing validation with various image types
- JSON parsing with malformed and edge case responses
- Service-specific API integration testing with mock responses

**Integration Testing**:
- End-to-end processing with real AI services (minimal cost testing)
- Queue processing with network connectivity changes
- Error handling validation with various failure scenarios

**Performance Testing**:
- Image processing speed with large files
- Queue processing efficiency with multiple items
- Memory usage during intensive processing operations

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-15 | 1.0 | Initial story creation from PRD Epic 2 | SM Agent |