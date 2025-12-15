/**
 * ML Kit OCR Service
 * Wrapper around ML Kit text recognition for offline receipt processing
 */

import TextRecognition, { TextBlock } from '@react-native-ml-kit/text-recognition';

export interface MLKitResult {
  text: string;           // Full recognized text
  blocks: TextBlock[];    // Text blocks with positions
  processingTime: number; // Time taken to process in milliseconds
}

/**
 * Recognize text from an image using ML Kit
 * @param imageUri - Local file URI of the image to process
 * @returns MLKitResult containing recognized text and metadata
 */
export async function recognizeText(imageUri: string): Promise<MLKitResult> {
  const startTime = Date.now();

  try {
    console.log('[MLKit] Starting text recognition for:', imageUri);

    // Call ML Kit text recognition API
    const result = await TextRecognition.recognize(imageUri);

    const processingTime = Date.now() - startTime;

    console.log('[MLKit] Recognition completed in', processingTime, 'ms');
    console.log('[MLKit] Recognized text length:', result.text.length, 'characters');
    console.log('[MLKit] Text blocks found:', result.blocks.length);

    return {
      text: result.text,
      blocks: result.blocks,
      processingTime,
    };
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('[MLKit] Recognition failed after', processingTime, 'ms:', error);
    throw new Error(`ML Kit recognition failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Check if ML Kit is available on this platform
 * @returns true if ML Kit text recognition is supported
 */
export function isMLKitAvailable(): boolean {
  try {
    // Simple check to see if the module is available
    return !!TextRecognition && typeof TextRecognition.recognize === 'function';
  } catch (error) {
    console.warn('[MLKit] ML Kit not available on this platform:', error);
    return false;
  }
}
