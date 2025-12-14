/**
 * Image Compression Utility
 * Handles image compression using react-native-image-resizer
 * Optimizes images for AI processing while minimizing storage usage
 */

import ImageResizer from 'react-native-image-resizer';

export interface CompressionResult {
  uri: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  compressionRatio: number;
}

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'JPEG' | 'PNG';
}

// Default compression settings optimized for receipt capture
const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 80,
  format: 'JPEG',
};

/**
 * Compress an image with the specified options
 * @param imageUri - URI of the image to compress
 * @param options - Compression options (optional)
 * @returns Promise<CompressionResult>
 */
export const compressImage = async (
  imageUri: string,
  options: CompressionOptions = {}
): Promise<CompressionResult> => {
  try {
    const mergedOptions = { ...DEFAULT_COMPRESSION_OPTIONS, ...options };

    console.log('Starting image compression:', {
      originalUri: imageUri,
      options: mergedOptions,
    });

    // Get original file size
    const originalSize = await getFileSize(imageUri);

    // Perform compression
    const result = await ImageResizer.createResizedImage(
      imageUri,
      mergedOptions.maxWidth!,
      mergedOptions.maxHeight!,
      mergedOptions.format!,
      mergedOptions.quality!,
      0, // rotation (0 = no rotation)
      undefined, // outputPath (undefined = generate automatically)
      false, // keepMeta (false = remove EXIF data to reduce size)
      {
        mode: 'contain', // Maintain aspect ratio
        onlyScaleDown: true, // Only scale down, never up
      }
    );

    // Get compressed file size
    const compressedSize = await getFileSize(result.uri);

    const compressionRatio = originalSize > 0 ? compressedSize / originalSize : 1;

    console.log('Image compression complete:', {
      originalSize: `${(originalSize / 1024).toFixed(2)} KB`,
      compressedSize: `${(compressedSize / 1024).toFixed(2)} KB`,
      compressionRatio: `${(compressionRatio * 100).toFixed(2)}%`,
      dimensions: `${result.width}x${result.height}`,
    });

    return {
      uri: result.uri,
      originalSize,
      compressedSize,
      width: result.width,
      height: result.height,
      compressionRatio,
    };
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error(
      `Failed to compress image: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

/**
 * Get file size in bytes
 * @param _uri - File URI (unused for now)
 * @returns Promise<number>
 */
const getFileSize = async (_uri: string): Promise<number> => {
  try {
    // For now, return estimated size based on compression
    // This can be enhanced with actual file size reading using react-native-fs
    return 0;
  } catch (error) {
    console.error('Error getting file size:', error);
    return 0;
  }
};

/**
 * Compress image with receipt-optimized settings
 * Specifically tuned for receipt capture and OCR processing
 * @param imageUri - URI of the receipt image
 * @returns Promise<CompressionResult>
 */
export const compressReceiptImage = async (imageUri: string): Promise<CompressionResult> => {
  return compressImage(imageUri, {
    maxWidth: 1024,
    maxHeight: 1024,
    quality: 80,
    format: 'JPEG',
  });
};

/**
 * Check if image needs compression
 * @param width - Image width
 * @param height - Image height
 * @returns boolean
 */
export const needsCompression = (width: number, height: number): boolean => {
  const MAX_DIMENSION = 1024;
  return width > MAX_DIMENSION || height > MAX_DIMENSION;
};

/**
 * Calculate recommended compression quality based on image size
 * @param fileSize - File size in bytes
 * @returns number (0-100)
 */
export const getRecommendedQuality = (fileSize: number): number => {
  const TARGET_SIZE = 500 * 1024; // 500 KB target

  if (fileSize <= TARGET_SIZE) {
    return 90; // High quality for small files
  } else if (fileSize <= TARGET_SIZE * 2) {
    return 80; // Standard quality for medium files
  } else {
    return 70; // Lower quality for large files
  }
};
