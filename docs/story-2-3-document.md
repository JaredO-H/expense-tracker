# Story 2.3: Offline ML Kit OCR Fallback

## Status
Draft

## Story

**As a** business traveler,
**I want** offline receipt processing when AI services are unavailable,
**so that** I can capture expenses even without internet connectivity.

## Acceptance Criteria

1. ML Kit text recognition integration for offline OCR processing
2. Pattern matching algorithms to extract merchant, amount, tax, and date from OCR text
3. User choice dialog when AI service fails: "Try offline OCR" or "Enter manually"
4. Confidence scoring display for offline extraction results
5. Clear indication when offline processing is used vs AI service

## Tasks / Subtasks

- [ ] Integrate ML Kit text recognition for offline OCR (AC: 1)
  - [ ] Install and configure `@react-native-ml-kit/text-recognition` dependency
  - [ ] Create `src/services/ai/mlKitService.ts` for offline OCR operations
  - [ ] Implement image-to-text conversion with ML Kit text recognition
  - [ ] Add text block coordinate extraction for spatial analysis
  - [ ] Handle ML Kit initialization and error states gracefully
  - [ ] Add platform-specific ML Kit configuration (Android/iOS)
  - [ ] Implement text recognition result caching for performance

- [ ] Create pattern matching algorithms for data extraction (AC: 2)
  - [ ] Create `src/services/ai/patternMatcher.ts` for text analysis
  - [ ] Implement merchant name extraction using header/top-section patterns
  - [ ] Add amount extraction with regex patterns for currency formats
  - [ ] Create tax extraction patterns for VAT/GST/Sales Tax keywords
  - [ ] Implement date extraction with multiple format recognition (MM/DD/YY, DD.MM.YY, etc.)
  - [ ] Add confidence scoring based on pattern match strength
  - [ ] Create category classification based on merchant keywords

- [ ] Implement user choice dialog for processing fallback (AC: 3)
  - [ ] Create `src/components/ai/ProcessingOptionsDialog.tsx` modal component
  - [ ] Add dialog trigger when AI service fails or unavailable
  - [ ] Present three options: "Try Offline OCR", "Enter Manually", "Queue for Later"
  - [ ] Include explanation of offline OCR accuracy limitations
  - [ ] Add processing time estimates for each option
  - [ ] Handle user selection and route to appropriate processing method
  - [ ] Store user preference for future fallback scenarios

- [ ] Add confidence scoring and accuracy feedback (AC: 4)
  - [ ] Implement confidence calculation based on pattern matching success
  - [ ] Create visual confidence indicators (high/medium/low with colors)
  - [ ] Add field-level confidence scoring for individual extracted data
  - [ ] Display accuracy warnings for low-confidence extractions
  - [ ] Provide confidence-based recommendations for manual review
  - [ ] Add confidence threshold settings for user customization
  - [ ] Include overall extraction confidence in verification interface

- [ ] Create processing method indicators and user communication (AC: 5)
  - [ ] Add processing source labels (AI Service, Offline OCR, Manual Entry)
  - [ ] Create visual badges showing extraction method in expense lists
  - [ ] Add processing method to expense metadata and database storage
  - [ ] Include method-specific accuracy expectations in UI
  - [ ] Show processing time and method in verification drawer
  - [ ] Add processing statistics for user awareness (accuracy rates by method)
  - [ ] Create help text explaining different processing methods

## Dev Notes

### ML Kit Integration Architecture

**Text Recognition Setup**: ML Kit provides on-device text recognition without network dependency. Supports both printed and handwritten text recognition with varying accuracy levels.

**Platform Configuration**:
- Android: Google ML Kit with Play Services dependency
- iOS: ML Kit iOS framework with automatic model downloading
- Text recognition optimized for document scanning use case

**Performance Considerations**: ML Kit processing is CPU-intensive. Implement background processing to prevent UI blocking. Cache recognition results to avoid reprocessing identical images.

### Pattern Matching Strategy

**Text Analysis Pipeline**:
1. ML Kit text recognition produces text blocks with coordinates
2. Spatial analysis identifies document structure (header, body, footer)
3. Pattern matching extracts specific data fields
4. Confidence scoring based on match quality and spatial context

**Extraction Patterns**:

**Merchant Name**: 
- Top 20% of document text blocks
- Largest font size text excluding numbers
- Business name patterns (LLC, Inc, Corp, Ltd suffixes)
- Address and phone number exclusion logic

**Amount Extraction**:
- Currency symbol patterns ($, €, £, ¥, etc.)
- Decimal number formats (12.34, 12,34, 12.345,67)
- Total/amount keyword proximity matching
- Largest amount extraction with validation

**Tax Information**:
- VAT/GST/Tax keyword proximity matching
- Percentage pattern recognition (XX.X%, XX%)
- Tax amount extraction with total correlation
- Tax rate calculation and validation

**Date Recognition**:
- Multiple format support (MM/DD/YYYY, DD.MM.YYYY, YYYY-MM-DD)
- Date keyword proximity (Date:, Transaction:, etc.)
- Date validation and reasonableness checks
- Current date default for ambiguous cases

### Confidence Scoring Algorithm

**Scoring Factors**:
- Pattern match strength (exact vs fuzzy matching)
- Spatial context (expected location of data)
- Cross-validation between fields (tax amount vs total)
- Text recognition confidence from ML Kit
- Business logic validation (reasonable amounts, dates)

**Confidence Levels**:
- High (80-100%): Strong pattern matches with validation
- Medium (60-79%): Good matches with minor uncertainties
- Low (40-59%): Weak matches requiring manual review
- Very Low (<40%): Extraction failed, manual entry recommended

### User Choice Dialog Implementation

**Dialog Trigger Conditions**:
- AI service authentication failure
- Network connectivity issues during processing
- AI service rate limiting or temporary unavailability
- User preference for offline processing

**Option Explanations**:
- Offline OCR: "60-80% accuracy, processes immediately"
- Manual Entry: "100% accuracy, requires typing"
- Queue for Later: "Save for AI processing when online"

**User Guidance**: Clear explanation of accuracy trade-offs and processing time differences. Educational content about when each option is most appropriate.

### Integration with Processing Pipeline

**Fallback Chain**: AI Service → Offline OCR (user choice) → Manual Entry. Seamless integration with existing processing queue and verification interface.

**Data Flow**: Offline OCR results use same data structure as AI services for consistent verification interface. Processing method stored as metadata for audit trails.

**Error Handling**: Graceful degradation when ML Kit unavailable or fails. Clear error messages with alternative processing options.

### Accuracy and Performance Optimization

**Image Preprocessing for OCR**: Apply image enhancement specifically for OCR processing including contrast adjustment, noise reduction, and text sharpening.

**Pattern Matching Optimization**: 
- Implement fuzzy string matching for merchant names
- Use business rule validation for amount extraction
- Cross-reference extracted fields for consistency validation
- Learn from user corrections to improve pattern accuracy

**Performance Management**: Background processing for ML Kit operations. Progress indicators for longer processing operations. Memory management for large images.

### User Experience Design

**Processing Method Communication**: Clear visual indicators throughout the app showing how each expense was processed. User education about accuracy expectations for different methods.

**Verification Interface Integration**: Offline OCR results presented in same verification drawer as AI services. Confidence indicators help users focus review efforts on uncertain extractions.

**Settings Integration**: User preferences for fallback behavior, confidence thresholds, and processing method priorities stored in settings from Story 2.1.

### Platform-Specific Implementation

**Android ML Kit Setup**:
```typescript
// Android-specific ML Kit configuration
import { TextRecognition } from '@react-native-ml-kit/text-recognition';

const processImageAndroid = async (imagePath: string) => {
  try {
    const result = await TextRecognition.recognize(imagePath);
    return {
      text: result.text,
      blocks: result.blocks.map(block => ({
        text: block.text,
        frame: block.frame,
        confidence: block.confidence
      }))
    };
  } catch (error) {
    throw new Error(`ML Kit processing failed: ${error.message}`);
  }
};
```

**iOS ML Kit Setup**:
```typescript
// iOS-specific ML Kit configuration with same interface
import { TextRecognition } from '@react-native-ml-kit/text-recognition';

const processImageIOS = async (imagePath: string) => {
  try {
    const result = await TextRecognition.recognize(imagePath);
    return {
      text: result.text,
      blocks: result.blocks.map(block => ({
        text: block.text,
        frame: block.frame,
        confidence: block.confidence || 0.8 // iOS default confidence
      }))
    };
  } catch (error) {
    throw new Error(`ML Kit processing failed: ${error.message}`);
  }
};
```

### Pattern Matching Implementation Examples

**Merchant Name Extraction**:
```typescript
const extractMerchantName = (textBlocks: TextBlock[]): ExtractionResult => {
  // Sort blocks by vertical position (top to bottom)
  const topBlocks = textBlocks
    .filter(block => block.frame.y < imageHeight * 0.3)
    .sort((a, b) => a.frame.y - b.frame.y);

  // Find largest text that's not a number or address
  const merchantCandidate = topBlocks.find(block => {
    const text = block.text.trim();
    return text.length > 2 && 
           !isNumeric(text) && 
           !isAddress(text) &&
           !isPhoneNumber(text);
  });

  return {
    value: merchantCandidate?.text || null,
    confidence: merchantCandidate ? calculateConfidence(merchantCandidate) : 0
  };
};
```

**Amount Extraction**:
```typescript
const extractAmount = (textBlocks: TextBlock[]): ExtractionResult => {
  const amountPatterns = [
    /(?:total|amount|sum)[:\s]*\$?(\d+\.?\d*)/i,
    /\$(\d+\.?\d*)/,
    /(\d+\.?\d*)\s*(?:USD|EUR|GBP)/i
  ];

  let bestMatch = { value: null, confidence: 0 };

  textBlocks.forEach(block => {
    amountPatterns.forEach(pattern => {
      const match = block.text.match(pattern);
      if (match) {
        const amount = parseFloat(match[1]);
        if (amount > 0 && amount < 10000) { // Reasonable expense range
          const confidence = calculateAmountConfidence(block, amount);
          if (confidence > bestMatch.confidence) {
            bestMatch = { value: amount, confidence };
          }
        }
      }
    });
  });

  return bestMatch;
};
```

### Testing Strategy

**Accuracy Testing**: Comprehensive testing with various receipt types to establish baseline accuracy rates. A/B testing between different pattern matching approaches.

**Performance Testing**: ML Kit processing speed testing across different device capabilities. Memory usage monitoring during intensive OCR operations.

**Integration Testing**: End-to-end testing of fallback scenarios including AI service failures and network connectivity issues.

**Unit Testing**:
- Pattern matching algorithms with known receipt samples
- Confidence scoring accuracy with validated data
- Error handling for various ML Kit failure scenarios

**Device Testing**:
- Performance across different Android/iOS device capabilities
- ML Kit model availability and download scenarios
- Memory usage with large receipt images

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-15 | 1.0 | Initial story creation from PRD Epic 2 | SM Agent |