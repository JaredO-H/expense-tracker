# Business Expense Tracker - Technical & Product Decisions Summary

**Document Date:** January 15, 2025  
**Status:** Architecture Planning Phase  
**Next Session:** Continue with detailed implementation planning  

## Product Vision Summary

A mobile-first expense tracking application that uses AI to extract data from business receipt photos, with offline capability and trip-based organization. The app addresses core pain points: manual data entry, receipt loss, cross-referencing difficulties, and consolidation overhead.

---

## Core Product Decisions

### Target Users
- **Primary**: Frequent business travelers (1-4 trips/month, 10-50 expenses per trip)
- **Secondary**: Occasional business travelers (quarterly or less frequent)

### Key Problems Solved
1. Time-sensitive data entry burden
2. Physical receipt management failures  
3. Manual cross-referencing complexity
4. Consolidation overhead

### MVP Feature Set (Finalized)
1. **AI Receipt Scanning** - Server-side OCR processing via user-selected AI service
2. **Manual Trip Grouping** - User-created trip folders with manual expense assignment
3. **Basic Automatic Categorization** - Simple rule-based expense classification
4. **Trust & Verification UI** - Side-by-side image and editable data display
5. **Offline-First Design** - Online-first processing with offline fallback options

---

## Technical Architecture Decisions

### Mobile Framework
**Decision**: React Native for MVP
**Rationale**: Cross-platform development, faster time-to-market, single codebase

### Data Storage Strategy
**Decision**: Device-only storage (no backend/cloud)
**Components**:
- Local SQLite database for expense data
- Local file system for receipt images
- No cloud backup or synchronization for MVP

### OCR Processing Strategy
**Decision**: Online-first with user-chosen offline fallback
**Flow**:
1. Attempt AI service processing first (when connected)
2. If unavailable/fails, offer user three options:
   - Try offline OCR (ML Kit)
   - Enter data manually
   - Queue for later processing

### AI Service Integration
**Decision**: User-selectable AI services (ChatGPT, Claude, Gemini)
**Implementation**:
- Users choose default service but can change anytime
- Conversational AI APIs with structured prompts for data extraction
- JSON response format for consistent parsing

### Data Extraction Requirements
**Expanded Scope**:
- Merchant name
- Total amount
- Tax amount and type (VAT, GST, Sales Tax, etc.)
- Tax rate percentage (if available)
- Date
- Category (meal/transport/accommodation/office/other)

### User Interface Design
**Decision**: Side-by-side verification layout
**Components**:
- Left side: Receipt image display
- Right side: Editable data fields
- Processing status indicators
- User choice dialogs for processing failures

### Export Capabilities
**Formats**: CSV, PDF, Excel
**Features**:
- Trip-based export with all expenses
- PDF includes receipt images cross-referenced to data
- Post-export image deletion (user confirmation required)

---

## Technical Implementation Decisions

### Database Schema
```sql
CREATE TABLE trips (
  id INTEGER PRIMARY KEY,
  name TEXT,
  start_date DATE,
  end_date DATE
);

CREATE TABLE expenses (
  id INTEGER PRIMARY KEY,
  trip_id INTEGER,
  image_path TEXT,
  merchant TEXT,
  amount DECIMAL,
  tax_amount DECIMAL,
  tax_type TEXT,
  tax_rate DECIMAL,
  date DATE,
  category TEXT,
  processed BOOLEAN DEFAULT FALSE,
  ai_service_used TEXT,
  manual_entry BOOLEAN DEFAULT FALSE
);
```

### Processing Flow Architecture
```
Mobile App Capture → Check Connectivity → 
AI Service Processing (Primary) → 
Offline OCR (User Choice Fallback) → 
Manual Entry (Final Fallback) → 
Side-by-Side Verification → 
Local Storage
```

### Offline OCR Implementation
**Technology**: React Native ML Kit for text recognition
**Parsing Strategy**: Pattern-matching algorithms for:
- Merchant name extraction (top-of-receipt filtering)
- Amount extraction (total/amount keyword patterns)
- Tax extraction (VAT/GST/tax keyword patterns)
- Date extraction (multiple format recognition)
- Confidence scoring for user feedback

---

## Key Technical Constraints & Decisions

### No Cloud Infrastructure
- **Benefit**: Simplified architecture, no ongoing server costs
- **Limitation**: No data backup, no cross-device sync, no collaborative features

### AI Service Dependencies
- **Risk**: Rate limiting, API costs, service availability
- **Mitigation**: Multiple service options, offline fallback, user choice

### Device Storage Management
- **Challenge**: Image storage accumulation (2-5MB per receipt)
- **Solution**: Post-export deletion with user confirmation

### Data Portability
- **Export-only strategy**: No cloud sync, users manage their own data export
- **Formats**: Multiple export formats for different corporate systems

---

## Outstanding Technical Considerations

### Offline OCR Accuracy Expectations
- ML Kit achieves 60-80% accuracy on clean receipts
- 30-50% accuracy on thermal or damaged receipts
- Users explicitly choose lower accuracy processing

### AI Processing Costs
- Estimated $5-15 per 50 receipts depending on service and image sizes
- No cost management built into MVP
- User responsibility to manage API usage

### Data Loss Risk
- Device-only storage means complete data loss if device damaged/lost
- No automated backup solution in MVP
- Users must manually export data for protection

---

## Deferred Features (Post-MVP)

### Future Enhancements
- Automatic trip detection via location/calendar
- Bank statement matching for currency accuracy
- Real-time budget tracking against allowances
- Corporate system integrations (Concur, Expensify)
- Cloud backup and multi-device sync

### Advanced Features
- Machine learning for improved categorization
- Corporate policy compliance checking
- Approval workflows
- Advanced analytics and reporting

---

## Next Session Planning

### Immediate Priorities
1. **Implementation Planning**: Detailed development roadmap and task breakdown
2. **UI/UX Design**: Mockups for verification interface and user choice dialogs  
3. **AI Integration**: Specific API implementation for each service
4. **Offline OCR**: Detailed parsing algorithm implementation
5. **Export System**: Multi-format generation specifications

### Technical Deep Dives Needed
- Error handling for AI service failures
- Offline OCR parsing algorithm refinement
- Export format specifications and testing
- User choice dialog flows and edge cases

### Validation Requirements
- OCR accuracy testing across receipt types
- AI service cost analysis and optimization
- User experience testing for processing flows
- Export compatibility with common corporate systems

---

## Session Outcome

**Architecture Status**: Core technical decisions finalized, ready for implementation planning
**Product Scope**: MVP feature set locked, post-MVP roadmap identified
**Technical Approach**: Online-first processing with device-only storage validated
**Next Steps**: Ready to proceed with detailed implementation specifications

*This document captures all major decisions from our brainstorming and architecture planning sessions. All technical approaches and product features are locked for MVP development.*