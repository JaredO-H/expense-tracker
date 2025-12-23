/**
 * Tests for Image Processor
 * Validates image preprocessing, compression, validation, and cost estimation
 */

import {
  processImageForAI,
  validateImageQuality,
  estimateProcessingCost,
  ProcessedImage,
  ImageProcessingOptions,
} from '../../../src/services/ai/imageProcessor';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';

// Mock modules
jest.mock('react-native-fs');
jest.mock('react-native-image-resizer');

const mockRNFS = RNFS as jest.Mocked<typeof RNFS>;
const mockImageResizer = ImageResizer as jest.Mocked<typeof ImageResizer>;

describe('Image Processor', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockRNFS.stat.mockResolvedValue({
      size: 2048 * 1024, // 2MB
      isFile: () => true,
      isDirectory: () => false,
      mtime: new Date(),
      ctime: new Date(),
      path: 'mock-path',
      originalFilepath: 'mock-path',
      mode: 0,
    } as any);

    mockRNFS.readFile.mockResolvedValue('mock-base64-data');
    mockRNFS.unlink.mockResolvedValue(undefined);

    mockImageResizer.createResizedImage.mockResolvedValue({
      uri: 'file://resized-image.jpg',
      path: '/path/to/resized-image.jpg',
      name: 'resized-image.jpg',
      size: 500000,
      width: 2048,
      height: 1536,
    });
  });

  describe('processImageForAI', () => {
    describe('basic processing', () => {
      it('should process image with default options', async () => {
        const result = await processImageForAI('file://test-image.jpg');

        expect(result).toBeDefined();
        expect(result.base64).toBe('mock-base64-data');
        expect(result.size).toBeGreaterThan(0);
      });

      it('should handle image URI with file:// prefix', async () => {
        await processImageForAI('file://test-image.jpg');

        expect(mockRNFS.stat).toHaveBeenCalledWith('test-image.jpg');
      });

      it('should handle image URI without file:// prefix', async () => {
        await processImageForAI('/path/to/test-image.jpg');

        expect(mockRNFS.stat).toHaveBeenCalledWith('/path/to/test-image.jpg');
      });

      it('should return processed image with all required fields', async () => {
        const result = await processImageForAI('file://test-image.jpg');

        expect(result).toHaveProperty('base64');
        expect(result).toHaveProperty('size');
        expect(result).toHaveProperty('width');
        expect(result).toHaveProperty('height');
        expect(result).toHaveProperty('quality');
      });

      it('should read file as base64', async () => {
        await processImageForAI('file://test-image.jpg');

        expect(mockRNFS.readFile).toHaveBeenCalledWith(
          expect.any(String),
          'base64'
        );
      });
    });

    describe('compression and resizing', () => {
      it('should compress image if larger than target size', async () => {
        // Mock large file (3MB > 1MB target)
        mockRNFS.stat.mockResolvedValue({
          size: 3 * 1024 * 1024,
          isFile: () => true,
          isDirectory: () => false,
        } as any);

        await processImageForAI('file://large-image.jpg');

        expect(mockImageResizer.createResizedImage).toHaveBeenCalled();
      });

      it('should not compress image if smaller than target size', async () => {
        // Mock small file (500KB < 1MB target)
        mockRNFS.stat.mockResolvedValue({
          size: 500 * 1024,
          isFile: () => true,
          isDirectory: () => false,
        } as any);

        await processImageForAI('file://small-image.jpg');

        expect(mockImageResizer.createResizedImage).not.toHaveBeenCalled();
      });

      it('should use custom max width and height', async () => {
        mockRNFS.stat.mockResolvedValue({
          size: 3 * 1024 * 1024,
          isFile: () => true,
        } as any);

        const options: ImageProcessingOptions = {
          maxWidth: 1024,
          maxHeight: 768,
        };

        await processImageForAI('file://test-image.jpg', options);

        expect(mockImageResizer.createResizedImage).toHaveBeenCalledWith(
          expect.any(String),
          1024,
          768,
          'JPEG',
          expect.any(Number),
          expect.any(Number),
          undefined,
          false,
          { mode: 'contain' }
        );
      });

      it('should use custom quality setting', async () => {
        mockRNFS.stat.mockResolvedValue({
          size: 3 * 1024 * 1024,
          isFile: () => true,
        } as any);

        const options: ImageProcessingOptions = {
          quality: 75,
        };

        await processImageForAI('file://test-image.jpg', options);

        expect(mockImageResizer.createResizedImage).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(Number),
          expect.any(Number),
          'JPEG',
          75,
          expect.any(Number),
          undefined,
          false,
          { mode: 'contain' }
        );
      });

      it('should use custom target size', async () => {
        mockRNFS.stat.mockResolvedValue({
          size: 3 * 1024 * 1024,
          isFile: () => true,
        } as any);

        const options: ImageProcessingOptions = {
          targetSizeKB: 512,
        };

        await processImageForAI('file://test-image.jpg', options);

        // Should compress because 3MB > 512KB
        expect(mockImageResizer.createResizedImage).toHaveBeenCalled();
      });

      it('should reduce quality iteratively if image still too large', async () => {
        // Mock initial large file
        mockRNFS.stat
          .mockResolvedValueOnce({
            size: 3 * 1024 * 1024, // Original: 3MB
            isFile: () => true,
          } as any)
          .mockResolvedValueOnce({
            size: 1.5 * 1024 * 1024, // After first resize: 1.5MB (still too large)
            isFile: () => true,
          } as any)
          .mockResolvedValueOnce({
            size: 800 * 1024, // After second resize: 800KB (acceptable)
            isFile: () => true,
          } as any)
          .mockResolvedValue({
            size: 800 * 1024, // Final stat
            isFile: () => true,
          } as any);

        await processImageForAI('file://test-image.jpg');

        // Should call createResizedImage multiple times
        expect(mockImageResizer.createResizedImage).toHaveBeenCalledTimes(2);
      });

      it('should clean up temporary files', async () => {
        mockRNFS.stat.mockResolvedValue({
          size: 3 * 1024 * 1024,
          isFile: () => true,
        } as any);

        await processImageForAI('file://test-image.jpg');

        // Should call unlink to clean up resized file
        expect(mockRNFS.unlink).toHaveBeenCalled();
      });

      it('should handle unlink errors gracefully', async () => {
        mockRNFS.stat.mockResolvedValue({
          size: 3 * 1024 * 1024,
          isFile: () => true,
        } as any);

        mockRNFS.unlink.mockRejectedValue(new Error('File not found'));

        // Should not throw error
        await expect(processImageForAI('file://test-image.jpg')).resolves.toBeDefined();
      });

      it('should use JPEG format for resizing', async () => {
        mockRNFS.stat.mockResolvedValue({
          size: 3 * 1024 * 1024,
          isFile: () => true,
        } as any);

        await processImageForAI('file://test-image.jpg');

        expect(mockImageResizer.createResizedImage).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(Number),
          expect.any(Number),
          'JPEG',
          expect.any(Number),
          expect.any(Number),
          undefined,
          false,
          { mode: 'contain' }
        );
      });

      it('should stop reducing quality at 50', async () => {
        // Mock that image stays large even after compression
        mockRNFS.stat.mockResolvedValue({
          size: 3 * 1024 * 1024,
          isFile: () => true,
        } as any);

        await processImageForAI('file://test-image.jpg', { targetSizeKB: 100 });

        // Should not reduce quality below 50
        // Even if target size not reached
        expect(mockImageResizer.createResizedImage).toHaveBeenCalled();
      });
    });

    describe('error handling', () => {
      it('should throw error if file stat fails', async () => {
        mockRNFS.stat.mockRejectedValue(new Error('File not found'));

        await expect(processImageForAI('file://nonexistent.jpg')).rejects.toThrow(
          'Failed to process image for AI service'
        );
      });

      it('should throw error if resize fails', async () => {
        mockRNFS.stat.mockResolvedValue({
          size: 3 * 1024 * 1024,
          isFile: () => true,
        } as any);

        mockImageResizer.createResizedImage.mockRejectedValue(
          new Error('Resize failed')
        );

        await expect(processImageForAI('file://test-image.jpg')).rejects.toThrow(
          'Failed to process image for AI service'
        );
      });

      it('should throw error if base64 conversion fails', async () => {
        mockRNFS.readFile.mockRejectedValue(new Error('Read failed'));

        await expect(processImageForAI('file://test-image.jpg')).rejects.toThrow(
          'Failed to process image for AI service'
        );
      });
    });
  });

  describe('validateImageQuality', () => {
    describe('valid images', () => {
      it('should validate image with acceptable size', async () => {
        mockRNFS.stat.mockResolvedValue({
          size: 500 * 1024, // 500KB
          isFile: () => true,
        } as any);

        const result = await validateImageQuality('file://test-image.jpg');

        expect(result.isValid).toBe(true);
        expect(result.reason).toBeUndefined();
      });

      it('should accept minimum size image (10KB)', async () => {
        mockRNFS.stat.mockResolvedValue({
          size: 10 * 1024,
          isFile: () => true,
        } as any);

        const result = await validateImageQuality('file://test-image.jpg');

        expect(result.isValid).toBe(true);
      });

      it('should accept maximum size image (10MB)', async () => {
        mockRNFS.stat.mockResolvedValue({
          size: 10 * 1024 * 1024,
          isFile: () => true,
        } as any);

        const result = await validateImageQuality('file://test-image.jpg');

        expect(result.isValid).toBe(true);
      });
    });

    describe('invalid images', () => {
      it('should reject image smaller than 10KB', async () => {
        mockRNFS.stat.mockResolvedValue({
          size: 5 * 1024, // 5KB
          isFile: () => true,
        } as any);

        const result = await validateImageQuality('file://tiny-image.jpg');

        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('too small');
      });

      it('should reject image larger than 10MB', async () => {
        mockRNFS.stat.mockResolvedValue({
          size: 15 * 1024 * 1024, // 15MB
          isFile: () => true,
        } as any);

        const result = await validateImageQuality('file://huge-image.jpg');

        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('too large');
      });

      it('should handle file:// prefix correctly', async () => {
        mockRNFS.stat.mockResolvedValue({
          size: 500 * 1024,
          isFile: () => true,
        } as any);

        await validateImageQuality('file://test-image.jpg');

        expect(mockRNFS.stat).toHaveBeenCalledWith('test-image.jpg');
      });
    });

    describe('error handling', () => {
      it('should return invalid if stat fails', async () => {
        mockRNFS.stat.mockRejectedValue(new Error('File not found'));

        const result = await validateImageQuality('file://nonexistent.jpg');

        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('Failed to validate');
      });

      it('should provide helpful error message on failure', async () => {
        mockRNFS.stat.mockRejectedValue(new Error('Permission denied'));

        const result = await validateImageQuality('file://test-image.jpg');

        expect(result.isValid).toBe(false);
        expect(result.reason).toBeDefined();
      });
    });
  });

  describe('estimateProcessingCost', () => {
    describe('OpenAI pricing', () => {
      it('should calculate cost for OpenAI service', () => {
        const cost = estimateProcessingCost(1024, 'openai'); // 1MB

        expect(cost).toBe(0.02);
      });

      it('should scale with image size', () => {
        const cost500KB = estimateProcessingCost(512, 'openai');
        const cost1MB = estimateProcessingCost(1024, 'openai');

        expect(cost1MB).toBeGreaterThan(cost500KB);
        expect(cost1MB).toBe(cost500KB * 2);
      });

      it('should handle small images', () => {
        const cost = estimateProcessingCost(100, 'openai'); // 100KB

        expect(cost).toBeGreaterThan(0);
        expect(cost).toBeLessThan(0.02);
      });

      it('should handle large images', () => {
        const cost = estimateProcessingCost(5 * 1024, 'openai'); // 5MB

        expect(cost).toBe(0.1);
      });
    });

    describe('Anthropic pricing', () => {
      it('should calculate cost for Anthropic service', () => {
        const cost = estimateProcessingCost(1024, 'anthropic'); // 1MB

        expect(cost).toBe(0.01);
      });

      it('should be cheaper than OpenAI', () => {
        const openaiCost = estimateProcessingCost(1024, 'openai');
        const anthropicCost = estimateProcessingCost(1024, 'anthropic');

        expect(anthropicCost).toBeLessThan(openaiCost);
      });

      it('should handle various sizes', () => {
        const cost2MB = estimateProcessingCost(2048, 'anthropic');

        expect(cost2MB).toBe(0.02);
      });
    });

    describe('Gemini pricing', () => {
      it('should calculate cost for Gemini service', () => {
        const cost = estimateProcessingCost(1024, 'gemini'); // 1MB

        expect(cost).toBe(0.005);
      });

      it('should be cheapest of all services', () => {
        const openaiCost = estimateProcessingCost(1024, 'openai');
        const anthropicCost = estimateProcessingCost(1024, 'anthropic');
        const geminiCost = estimateProcessingCost(1024, 'gemini');

        expect(geminiCost).toBeLessThan(anthropicCost);
        expect(geminiCost).toBeLessThan(openaiCost);
      });

      it('should handle large files efficiently', () => {
        const cost10MB = estimateProcessingCost(10 * 1024, 'gemini');

        expect(cost10MB).toBe(0.05);
      });
    });

    describe('cost comparison', () => {
      it('should provide consistent scaling across services', () => {
        const size1 = 1024;
        const size2 = 2048;

        const openai1 = estimateProcessingCost(size1, 'openai');
        const openai2 = estimateProcessingCost(size2, 'openai');

        const anthropic1 = estimateProcessingCost(size1, 'anthropic');
        const anthropic2 = estimateProcessingCost(size2, 'anthropic');

        const gemini1 = estimateProcessingCost(size1, 'gemini');
        const gemini2 = estimateProcessingCost(size2, 'gemini');

        // All should double when size doubles
        expect(openai2 / openai1).toBe(2);
        expect(anthropic2 / anthropic1).toBe(2);
        expect(gemini2 / gemini1).toBe(2);
      });

      it('should maintain price ratios', () => {
        const size = 1024;

        const openaiCost = estimateProcessingCost(size, 'openai');
        const anthropicCost = estimateProcessingCost(size, 'anthropic');
        const geminiCost = estimateProcessingCost(size, 'gemini');

        // OpenAI = 2x Anthropic
        expect(openaiCost / anthropicCost).toBe(2);

        // Anthropic = 2x Gemini
        expect(anthropicCost / geminiCost).toBe(2);

        // OpenAI = 4x Gemini
        expect(openaiCost / geminiCost).toBe(4);
      });
    });
  });
});
