/**
 * Image Processor
 * Preprocessing pipeline for receipt images before AI processing
 */

import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';

export interface ProcessedImage {
  base64: string;
  size: number;
  width: number;
  height: number;
  quality: number;
}

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  targetSizeKB?: number;
}

const DEFAULT_OPTIONS: Required<ImageProcessingOptions> = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 85,
  targetSizeKB: 1024, // 1MB target
};

/**
 * Normalize URI by removing file:// prefix if present
 * Ensures consistent file path handling across platforms
 */
function normalizeUri(uri: string): string {
  return uri.replace(/^file:\/\//, '');
}

/**
 * Ensure URI has file:// prefix for ImageResizer
 */
function ensureFilePrefix(uri: string): string {
  return uri.startsWith('file://') ? uri : `file://${uri}`;
}

/**
 * Process image for AI service transmission
 * Handles compression, resizing, and base64 encoding
 */
export async function processImageForAI(
  imageUri: string,
  options: ImageProcessingOptions = {},
): Promise<ProcessedImage> {
  try {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Normalize the input URI for file operations
    const filePath = normalizeUri(imageUri);

    // Get original file size
    const fileInfo = await RNFS.stat(filePath);
    const originalSizeKB = fileInfo.size / 1024;

    console.log(`Original image size: ${originalSizeKB.toFixed(2)} KB`);

    // Determine if we need to compress
    let processedUri = imageUri;
    let currentQuality = opts.quality;

    if (originalSizeKB > opts.targetSizeKB) {
      // Resize and compress the image (ImageResizer needs file:// prefix)
      const resizeResult = await ImageResizer.createResizedImage(
        ensureFilePrefix(imageUri),
        opts.maxWidth,
        opts.maxHeight,
        'JPEG',
        currentQuality,
        0, // rotation
        undefined, // output path
        false, // keep metadata
        { mode: 'contain' }, // resize mode
      );

      processedUri = resizeResult.uri;

      // Check if we need further compression
      const resizedInfo = await RNFS.stat(normalizeUri(resizeResult.uri));
      let resizedSizeKB = resizedInfo.size / 1024;

      // Iteratively reduce quality if still too large
      while (resizedSizeKB > opts.targetSizeKB && currentQuality > 50) {
        currentQuality -= 10;

        const recompressed = await ImageResizer.createResizedImage(
          ensureFilePrefix(processedUri),
          opts.maxWidth,
          opts.maxHeight,
          'JPEG',
          currentQuality,
          0,
          undefined,
          false,
          { mode: 'contain' },
        );

        // Clean up previous file
        if (normalizeUri(processedUri) !== normalizeUri(imageUri)) {
          await RNFS.unlink(normalizeUri(processedUri)).catch(() => {});
        }

        processedUri = recompressed.uri;
        const info = await RNFS.stat(normalizeUri(recompressed.uri));
        resizedSizeKB = info.size / 1024;
      }

      console.log(
        `Compressed image size: ${resizedSizeKB.toFixed(2)} KB (quality: ${currentQuality})`,
      );
    }

    // Convert to base64
    const base64Data = await RNFS.readFile(normalizeUri(processedUri), 'base64');

    // Get final image dimensions
    const finalInfo = await RNFS.stat(normalizeUri(processedUri));

    // Clean up temporary file if we created one
    if (normalizeUri(processedUri) !== normalizeUri(imageUri)) {
      await RNFS.unlink(normalizeUri(processedUri)).catch(() => {});
    }

    return {
      base64: base64Data,
      size: finalInfo.size,
      width: opts.maxWidth,
      height: opts.maxHeight,
      quality: currentQuality,
    };
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process image for AI service');
  }
}

/**
 * Validate image quality and suitability for OCR
 */
export async function validateImageQuality(imageUri: string): Promise<{
  isValid: boolean;
  reason?: string;
}> {
  try {
    const filePath = normalizeUri(imageUri);
    const fileInfo = await RNFS.stat(filePath);

    // Check file size - must be between 10KB and 10MB
    const sizeKB = fileInfo.size / 1024;
    if (sizeKB < 10) {
      return {
        isValid: false,
        reason: 'Image file is too small. Please capture a clearer image.',
      };
    }

    if (sizeKB > 10240) {
      return {
        isValid: false,
        reason: 'Image file is too large. Please use a different image.',
      };
    }

    // Additional quality checks could be added here
    // (e.g., blur detection, brightness analysis)

    return { isValid: true };
  } catch (error) {
    console.error('Image validation error:', error);
    return {
      isValid: false,
      reason: 'Failed to validate image. Please try again.',
    };
  }
}

/**
 * Estimate processing cost for an image
 */
export function estimateProcessingCost(
  imageSizeKB: number,
  serviceId: 'openai' | 'anthropic' | 'gemini',
): number {
  // Rough cost estimates based on service pricing
  const costPerMB = {
    openai: 0.02,
    anthropic: 0.01,
    gemini: 0.005,
  };

  const sizeMB = imageSizeKB / 1024;
  return sizeMB * costPerMB[serviceId];
}
