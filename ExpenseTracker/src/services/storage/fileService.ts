/*
 * File Service
 * Handles receipt image storage, retrieval, and management
 */

import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';

// Configuration
const RECEIPTS_DIR = `${RNFS.DocumentDirectoryPath}/receipts`;
const MAX_IMAGE_WIDTH = 1024;
const MAX_IMAGE_HEIGHT = 1024;
const IMAGE_QUALITY = 80;
const MAX_FILE_SIZE_MB = 10;
const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png'];


//Image validation result
interface ValidationResult {
  valid: boolean;
  error?: string;
}

class FileService {

  //Initialize receipts directory
  async initializeReceiptsDirectory(): Promise<void> {
    try {
      const dirExists = await RNFS.exists(RECEIPTS_DIR);
      if (!dirExists) {
        await RNFS.mkdir(RECEIPTS_DIR);
        console.log('Receipts directory created:', RECEIPTS_DIR);
      }
    } catch (error) {
      console.error('Failed to initialize receipts directory:', error);
      throw new Error('Failed to create receipts storage directory');
    }
  }


  //Generate unique filename for receipt image
  private generateUniqueFilename(extension: string = 'jpg'): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    return `receipt_${timestamp}_${randomId}.${extension}`;
  }


  //Validate image file
  async validateImage(imagePath: string): Promise<ValidationResult> {
    try {
      // Check if file exists
      const exists = await RNFS.exists(imagePath);
      if (!exists) {
        return { valid: false, error: 'Image file does not exist' };
      }

      // Check file extension
      const extension = imagePath.split('.').pop()?.toLowerCase();
      if (!extension || !ALLOWED_FORMATS.includes(extension)) {
        return {
          valid: false,
          error: `Invalid image format. Allowed: ${ALLOWED_FORMATS.join(', ')}`,
        };
      }

      // Check file size
      const stat = await RNFS.stat(imagePath);
      const fileSizeMB = stat.size / (1024 * 1024);
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        return {
          valid: false,
          error: `Image too large. Maximum size: ${MAX_FILE_SIZE_MB}MB`,
        };
      }

      return { valid: true };
    } catch (error) {
      console.error('Image validation error:', error);
      return { valid: false, error: 'Failed to validate image' };
    }
  }


  //Compress and save receipt image
  async saveReceiptImage(sourceImagePath: string): Promise<string> {
    try {
      // Ensure receipts directory exists
      await this.initializeReceiptsDirectory();

      // Validate image
      const validation = await this.validateImage(sourceImagePath);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Compress image
      const compressedImage = await ImageResizer.createResizedImage(
        sourceImagePath,
        MAX_IMAGE_WIDTH,
        MAX_IMAGE_HEIGHT,
        'JPEG',
        IMAGE_QUALITY,
        0, // rotation
        undefined, // output path (will be temp)
      );

      // Generate unique filename
      const filename = this.generateUniqueFilename('jpg');
      const destinationPath = `${RECEIPTS_DIR}/${filename}`;

      // Move compressed image to receipts directory
      await RNFS.moveFile(compressedImage.uri, destinationPath);

      console.log('Receipt image saved:', destinationPath);
      return destinationPath;
    } catch (error) {
      console.error('Failed to save receipt image:', error);
      throw new Error(
        `Failed to save receipt image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }


  //Get receipt image path and verify it exists
  async getReceiptImage(imagePath: string): Promise<string | null> {
    try {
      const exists = await RNFS.exists(imagePath);
      if (!exists) {
        console.warn('Receipt image not found:', imagePath);
        return null;
      }
      return imagePath;
    } catch (error) {
      console.error('Failed to get receipt image:', error);
      return null;
    }
  }


  //Delete receipt image with cleanup verification
  async deleteReceiptImage(imagePath: string): Promise<boolean> {
    try {
      // Check if file exists
      const exists = await RNFS.exists(imagePath);
      if (!exists) {
        console.warn('Image already deleted or does not exist:', imagePath);
        return true; // Consider it successful if already gone
      }

      // Delete the file
      await RNFS.unlink(imagePath);

      // Verify deletion
      const stillExists = await RNFS.exists(imagePath);
      if (stillExists) {
        throw new Error('Failed to verify image deletion');
      }

      console.log('Receipt image deleted:', imagePath);
      return true;
    } catch (error) {
      console.error('Failed to delete receipt image:', error);
      throw new Error(
        `Failed to delete receipt image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }


  //Create thumbnail version of receipt image
  async createThumbnail(imagePath: string): Promise<string> {
    try {
      const thumbnailImage = await ImageResizer.createResizedImage(
        imagePath,
        200, // thumbnail width
        200, // thumbnail height
        'JPEG',
        70, // lower quality for thumbnails
        0,
        undefined,
      );

      const filename = this.generateUniqueFilename('jpg').replace('receipt_', 'thumb_');
      const destinationPath = `${RECEIPTS_DIR}/${filename}`;

      await RNFS.moveFile(thumbnailImage.uri, destinationPath);

      console.log('Thumbnail created:', destinationPath);
      return destinationPath;
    } catch (error) {
      console.error('Failed to create thumbnail:', error);
      throw new Error('Failed to create thumbnail image');
    }
  }


  //Get total size of all receipt images
  async getReceiptsStorageSize(): Promise<number> {
    try {
      const dirExists = await RNFS.exists(RECEIPTS_DIR);
      if (!dirExists) {
        return 0;
      }

      const files = await RNFS.readDir(RECEIPTS_DIR);
      let totalSize = 0;

      for (const file of files) {
        totalSize += file.size;
      }

      return totalSize;
    } catch (error) {
      console.error('Failed to get receipts storage size:', error);
      return 0;
    }
  }

  //Clean up orphaned images (images not referenced in database)
  async cleanupOrphanedImages(validImagePaths: string[]): Promise<number> {
    try {
      const dirExists = await RNFS.exists(RECEIPTS_DIR);
      if (!dirExists) {
        return 0;
      }

      const files = await RNFS.readDir(RECEIPTS_DIR);
      let deletedCount = 0;

      for (const file of files) {
        const filePath = file.path;
        if (!validImagePaths.includes(filePath)) {
          await RNFS.unlink(filePath);
          deletedCount++;
          console.log('Orphaned image deleted:', filePath);
        }
      }

      return deletedCount;
    } catch (error) {
      console.error('Failed to cleanup orphaned images:', error);
      throw new Error('Failed to cleanup orphaned images');
    }
  }
}

// Export singleton instance
export default new FileService();
