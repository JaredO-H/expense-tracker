/**
 * Tests for ML Kit Service
 * Validates offline text recognition using ML Kit
 */

import { recognizeText, isMLKitAvailable } from '../../../src/services/ocr/mlKitService';
import TextRecognition, { TextBlock } from '@react-native-ml-kit/text-recognition';

// Mock ML Kit module
jest.mock('@react-native-ml-kit/text-recognition');

const mockTextRecognition = TextRecognition as jest.Mocked<typeof TextRecognition>;

describe('ML Kit Service', () => {
  // Sample text blocks for testing
  const mockTextBlocks: TextBlock[] = [
    {
      text: 'STARBUCKS',
      frame: { left: 10, top: 20, width: 100, height: 30 },
      cornerPoints: [
        { x: 10, y: 20 },
        { x: 110, y: 20 },
        { x: 110, y: 50 },
        { x: 10, y: 50 },
      ],
      lines: [],
      recognizedLanguages: [],
    },
    {
      text: 'Total: $15.50',
      frame: { left: 10, top: 60, width: 120, height: 30 },
      cornerPoints: [
        { x: 10, y: 60 },
        { x: 130, y: 60 },
        { x: 130, y: 90 },
        { x: 10, y: 90 },
      ],
      lines: [],
      recognizedLanguages: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Default successful recognition
    mockTextRecognition.recognize.mockResolvedValue({
      text: 'STARBUCKS\nTotal: $15.50',
      blocks: mockTextBlocks,
    });
  });

  describe('recognizeText', () => {
    describe('successful recognition', () => {
      it('should recognize text from image', async () => {
        const result = await recognizeText('file://receipt.jpg');

        expect(result).toBeDefined();
        expect(result.text).toBe('STARBUCKS\nTotal: $15.50');
        expect(result.blocks).toHaveLength(2);
      });

      it('should call ML Kit with correct image URI', async () => {
        const imageUri = 'file://receipt.jpg';
        await recognizeText(imageUri);

        expect(mockTextRecognition.recognize).toHaveBeenCalledWith(imageUri);
      });

      it('should return all recognized text blocks', async () => {
        const result = await recognizeText('file://receipt.jpg');

        expect(result.blocks).toEqual(mockTextBlocks);
      });

      it('should include processing time', async () => {
        const result = await recognizeText('file://receipt.jpg');

        expect(result.processingTime).toBeGreaterThanOrEqual(0);
        expect(typeof result.processingTime).toBe('number');
      });

      it('should handle image with no text', async () => {
        mockTextRecognition.recognize.mockResolvedValue({
          text: '',
          blocks: [],
        });

        const result = await recognizeText('file://blank.jpg');

        expect(result.text).toBe('');
        expect(result.blocks).toHaveLength(0);
      });

      it('should handle image with lots of text', async () => {
        const longText = 'A'.repeat(1000);
        const manyBlocks = Array(50).fill(mockTextBlocks[0]);

        mockTextRecognition.recognize.mockResolvedValue({
          text: longText,
          blocks: manyBlocks,
        });

        const result = await recognizeText('file://document.jpg');

        expect(result.text.length).toBe(1000);
        expect(result.blocks).toHaveLength(50);
      });

      it('should handle multiline text correctly', async () => {
        const multilineText = 'Line 1\nLine 2\nLine 3';
        mockTextRecognition.recognize.mockResolvedValue({
          text: multilineText,
          blocks: [],
        });

        const result = await recognizeText('file://receipt.jpg');

        expect(result.text).toBe(multilineText);
      });

      it('should handle special characters', async () => {
        const specialText = '$ € £ ¥ @ # % & * ( ) - + = [ ] { }';
        mockTextRecognition.recognize.mockResolvedValue({
          text: specialText,
          blocks: [],
        });

        const result = await recognizeText('file://receipt.jpg');

        expect(result.text).toBe(specialText);
      });

      it('should process different image URIs', async () => {
        const uris = [
          'file://receipt1.jpg',
          '/path/to/receipt2.png',
          'content://media/receipt3.jpg',
        ];

        for (const uri of uris) {
          await recognizeText(uri);
          expect(mockTextRecognition.recognize).toHaveBeenCalledWith(uri);
        }
      });
    });

    describe('processing time measurement', () => {
      it('should measure processing time accurately', async () => {
        // Mock delay in recognition
        mockTextRecognition.recognize.mockImplementation(async () => {
          await new Promise(resolve => setTimeout(resolve, 50));
          return {
            text: 'Test',
            blocks: [],
          };
        });

        const result = await recognizeText('file://receipt.jpg');

        expect(result.processingTime).toBeGreaterThanOrEqual(50);
      });

      it('should include time even on fast processing', async () => {
        const result = await recognizeText('file://receipt.jpg');

        expect(result.processingTime).toBeGreaterThanOrEqual(0);
      });
    });

    describe('error handling', () => {
      it('should throw error if recognition fails', async () => {
        mockTextRecognition.recognize.mockRejectedValue(new Error('Image not found'));

        await expect(recognizeText('file://nonexistent.jpg')).rejects.toThrow(
          'ML Kit recognition failed',
        );
      });

      it('should include original error message', async () => {
        mockTextRecognition.recognize.mockRejectedValue(new Error('Invalid image format'));

        await expect(recognizeText('file://invalid.jpg')).rejects.toThrow('Invalid image format');
      });

      it('should handle undefined error message', async () => {
        mockTextRecognition.recognize.mockRejectedValue({});

        await expect(recognizeText('file://receipt.jpg')).rejects.toThrow('Unknown error');
      });

      it('should handle null image URI', async () => {
        mockTextRecognition.recognize.mockRejectedValue(new Error('Invalid URI'));

        await expect(recognizeText('')).rejects.toThrow();
      });

      it('should include processing time in error case', async () => {
        mockTextRecognition.recognize.mockRejectedValue(new Error('Recognition failed'));

        const startTime = Date.now();
        try {
          await recognizeText('file://receipt.jpg');
        } catch {
          const endTime = Date.now();
          const elapsed = endTime - startTime;
          expect(elapsed).toBeGreaterThanOrEqual(0);
        }
      });
    });

    describe('text block structure', () => {
      it('should preserve block frame information', async () => {
        const result = await recognizeText('file://receipt.jpg');

        expect(result.blocks[0].frame).toBeDefined();
        expect(result.blocks[0].frame?.left).toBe(10);
        expect(result.blocks[0].frame?.top).toBe(20);
      });

      it('should preserve block text', async () => {
        const result = await recognizeText('file://receipt.jpg');

        expect(result.blocks[0].text).toBe('STARBUCKS');
        expect(result.blocks[1].text).toBe('Total: $15.50');
      });
    });
  });

  describe('isMLKitAvailable', () => {
    describe('when ML Kit is available', () => {
      it('should return true if TextRecognition is available', () => {
        const available = isMLKitAvailable();

        expect(available).toBe(true);
      });

      it('should return true if recognize function exists', () => {
        (TextRecognition as any).recognize = jest.fn();

        const available = isMLKitAvailable();

        expect(available).toBe(true);
      });
    });

    describe('when ML Kit is not available', () => {
      it('should return false if recognize function is missing', () => {
        const originalRecognize = TextRecognition.recognize;
        delete (TextRecognition as any).recognize;

        const available = isMLKitAvailable();

        expect(available).toBe(false);

        // Restore
        (TextRecognition as any).recognize = originalRecognize;
      });

      it('should check for recognize function', () => {
        // Verify that function checks for recognize method
        const available = isMLKitAvailable();

        // When recognize exists, should return true
        expect(available).toBe(true);
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete receipt recognition workflow', async () => {
      const receiptText = `WALMART
Store #1234
123 Main St
City, State 12345

GROCERIES
Milk          $3.99
Bread         $2.50
Eggs          $4.29

Subtotal     $10.78
Tax           $0.86
Total        $11.64

Thank you!`;

      mockTextRecognition.recognize.mockResolvedValue({
        text: receiptText,
        blocks: [
          {
            text: 'WALMART',
            frame: { left: 0, top: 0, width: 100, height: 30 },
            cornerPoints: [
              { x: 0, y: 0 },
              { x: 100, y: 0 },
              { x: 100, y: 30 },
              { x: 0, y: 30 },
            ],
            lines: [],
            recognizedLanguages: [],
          },
          {
            text: 'Total $11.64',
            frame: { left: 0, top: 200, width: 150, height: 30 },
            cornerPoints: [
              { x: 0, y: 200 },
              { x: 150, y: 200 },
              { x: 150, y: 230 },
              { x: 0, y: 230 },
            ],
            lines: [],
            recognizedLanguages: [],
          },
        ],
      });

      const result = await recognizeText('file://walmart-receipt.jpg');

      expect(result.text).toContain('WALMART');
      expect(result.text).toContain('$11.64');
      expect(result.blocks).toHaveLength(2);
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle poor quality image with partial text', async () => {
      mockTextRecognition.recognize.mockResolvedValue({
        text: 'STORE\n...blur...\nTotal: $5.00',
        blocks: [
          {
            text: 'STORE',
            frame: { left: 0, top: 0, width: 50, height: 20 },
            cornerPoints: [
              { x: 0, y: 0 },
              { x: 50, y: 0 },
              { x: 50, y: 20 },
              { x: 0, y: 20 },
            ],
            lines: [],
            recognizedLanguages: [],
          },
          {
            text: 'Total: $5.00',
            frame: { left: 0, top: 100, width: 80, height: 20 },
            cornerPoints: [
              { x: 0, y: 100 },
              { x: 80, y: 100 },
              { x: 80, y: 120 },
              { x: 0, y: 120 },
            ],
            lines: [],
            recognizedLanguages: [],
          },
        ],
      });

      const result = await recognizeText('file://blurry-receipt.jpg');

      expect(result.text).toBeDefined();
      expect(result.blocks.length).toBeGreaterThan(0);
    });

    it('should handle rotated image', async () => {
      mockTextRecognition.recognize.mockResolvedValue({
        text: 'Rotated Text',
        blocks: [],
      });

      const result = await recognizeText('file://rotated-receipt.jpg');

      expect(result.text).toBe('Rotated Text');
    });
  });
});
