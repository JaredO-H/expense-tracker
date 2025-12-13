# Story 1.3: Camera Integration and Image Capture

## Status
Draft

## Story

**As a** business traveler,
**I want** to capture receipt photos using my device camera,
**so that** I can digitally store expense documentation.

## Acceptance Criteria

1. Camera component opens with automatic focus and exposure optimization
2. Receipt photo capture saves image to local file system
3. Image compression applied to balance quality and storage efficiency
4. Captured images display in preview mode with retake option
5. Camera permissions handled gracefully with user guidance

## Tasks / Subtasks

- [ ] Create camera component with react-native-vision-camera integration (AC: 1)
  - [ ] Create `src/components/camera/CameraCapture.tsx` main camera component
  - [ ] Implement camera device selection (back camera default, front camera option)
  - [ ] Add automatic focus and exposure optimization
  - [ ] Create camera viewfinder with receipt framing guides
  - [ ] Add camera controls (capture button, flash toggle, camera switch)
  - [ ] Implement touch-to-focus functionality
  - [ ] Handle camera initialization and cleanup

- [ ] Implement photo capture with local file system storage (AC: 2)
  - [ ] Create capture function with high-quality image settings
  - [ ] Generate unique filenames using timestamp and random ID
  - [ ] Save captured images to Documents/receipts directory
  - [ ] Integrate with fileService from Story 1.2 for storage operations
  - [ ] Add capture confirmation with haptic feedback
  - [ ] Handle capture errors with user-friendly messages

- [ ] Add image compression pipeline (AC: 3)
  - [ ] Integrate react-native-image-resizer for compression
  - [ ] Set compression parameters: max 1024x1024px, 80% quality, JPEG format
  - [ ] Create before/after size comparison for optimization verification
  - [ ] Balance image quality for AI processing vs storage efficiency
  - [ ] Add compression progress indicators for large images
  - [ ] Handle compression failures with fallback options

- [ ] Create image preview interface with retake functionality (AC: 4)
  - [ ] Create `src/components/camera/ImagePreview.tsx` preview component
  - [ ] Display captured image with zoom and pan capabilities
  - [ ] Add retake and accept action buttons
  - [ ] Implement image rotation correction if needed
  - [ ] Show image metadata (file size, dimensions, timestamp)
  - [ ] Navigate to verification screen on accept

- [ ] Implement camera permissions and error handling (AC: 5)
  - [ ] Request camera permissions on component mount
  - [ ] Create permission denied screen with settings navigation
  - [ ] Handle camera unavailable scenarios (device limitations)
  - [ ] Add user guidance for camera setup and positioning
  - [ ] Implement graceful fallback to photo library selection
  - [ ] Create troubleshooting help for common camera issues

## Dev Notes

### Camera Integration Architecture

**react-native-vision-camera**: Primary camera library providing high-performance native camera integration. Supports advanced features like manual focus, exposure control, and high-resolution capture.

**Camera Configuration**: Back camera default with 16:9 aspect ratio optimized for receipt capture. Auto-focus and auto-exposure enabled with touch-to-focus override capability.

**Performance Optimization**: Camera session management with proper initialization and cleanup. Background/foreground handling to pause camera when app inactive.

### Photo Capture Implementation

**Capture Settings**: High-quality JPEG capture at maximum device resolution. Flash auto-detection based on ambient light conditions. Capture button with haptic feedback for user confirmation.

**File Management**: Integration with fileService from Story 1.2 for consistent storage patterns. Unique filename generation: `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`.

**Error Handling**: Comprehensive error handling for camera failures, storage issues, and permission problems. User-friendly error messages with actionable guidance.

### Image Compression Strategy

**Compression Parameters**: 
- Maximum dimensions: 1024x1024 pixels
- Quality: 80% JPEG compression
- Format: Always JPEG for consistent AI processing
- Target file size: Under 500KB for API transmission

**Quality Balance**: Optimize for AI service processing while minimizing storage usage. Preserve text readability for OCR processing. Test compression settings with various receipt types.

**Performance**: Asynchronous compression to avoid UI blocking. Progress indicators for compression operations over 2 seconds.

### Preview Interface Design

**Image Display**: Full-screen preview with pinch-to-zoom and pan gestures. Image orientation correction for proper receipt viewing. Overlay controls that don't obstruct image content.

**User Actions**: Clear retake and accept buttons with intuitive positioning. Swipe gestures for quick retake. Visual feedback for user actions.

**Navigation Flow**: Accept button navigates to verification screen (to be implemented in Epic 2). Cancel/back navigation returns to previous screen.

### Permission Management

**Camera Permissions**: Request permissions with clear explanation of usage. Handle permission denied with settings navigation. Graceful degradation to photo library selection.

**User Guidance**: 
- Permission request explanation: "Camera access needed to capture receipt photos"
- Setup guidance: Receipt positioning tips and lighting recommendations
- Troubleshooting: Common issues and solutions

**Fallback Options**: Photo library access when camera unavailable. Manual photo import from device gallery.

### Platform-Specific Considerations

**Android Implementation**:
- Camera2 API through react-native-vision-camera
- Runtime permission handling
- Storage permission for file saving
- Hardware camera feature detection

**iOS Implementation**:
- AVFoundation integration through react-native-vision-camera
- iOS-specific permission descriptions in Info.plist
- Photo library usage description for fallback option

### Camera Component Architecture

**Component Structure**:
```typescript
interface CameraProps {
  onCapture: (imageUri: string) => void;
  onCancel: () => void;
  isVisible: boolean;
}
```

**State Management**: Local state for camera status, capture mode, and current image. Integration with global store for navigation and captured images.

**Lifecycle Management**: Proper camera resource cleanup on unmount. Background/foreground state handling to pause camera appropriately.

### Receipt Capture Optimization

**Framing Guides**: Visual overlay to help users position receipts properly. Automatic edge detection suggestions for optimal capture angles.

**Image Quality**: Auto-focus with manual override. Exposure adjustment for various lighting conditions. Image stabilization for sharp text capture.

**Capture Feedback**: Visual and haptic feedback for successful capture. Audio feedback options (configurable by user). Clear indication when image is being processed.

### Integration Points

**Database Integration**: Save image metadata to expenses table. Link captured images to expense records. Track capture method (camera vs library).

**Navigation Integration**: Smooth transitions between camera and other screens. Back navigation handling with proper cleanup. Deep linking support for camera access.

**File System Integration**: Use fileService for consistent storage operations. Proper error handling for storage failures. Cleanup of temporary files during capture process.

### Testing Strategy

**Unit Tests**: Mock camera operations for component testing. Test permission handling logic. Validate compression settings and file operations.

**Integration Tests**: Real camera testing on physical devices. Test capture flow end-to-end. Validate file storage and retrieval operations.

**Platform Testing**: Test camera functionality on both Android and iOS. Verify permission flows on different OS versions. Test various device camera capabilities.

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-15 | 1.0 | Initial story creation from PRD Epic 1 | SM Agent |