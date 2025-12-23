/**
 * Tests for File Service
 * Validates receipt image storage, retrieval, validation, and cleanup
 */

import fileService from '../../../src/services/storage/fileService';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';

// Mock modules
jest.mock('react-native-fs');
jest.mock('react-native-image-resizer');

const mockRNFS = RNFS as jest.Mocked<typeof RNFS>;
const mockImageResizer = ImageResizer as jest.Mocked<typeof ImageResizer>;

describe('File Service', () => {
  const mockReceiptsDir = '/mock/documents/receipts';
  const mockImagePath = '/mock/image.jpg';

  beforeEach(() => {
    jest.clearAllMocks();

    // Set mock document directory
    (RNFS.DocumentDirectoryPath as any) = '/mock/documents';

    // Default mock implementations
    mockRNFS.exists.mockResolvedValue(true);
    mockRNFS.mkdir.mockResolvedValue(undefined);
    mockRNFS.stat.mockResolvedValue({
      size: 2 * 1024 * 1024, // 2MB
      isFile: () => true,
      isDirectory: () => false,
      mtime: new Date(),
      ctime: new Date(),
      path: mockImagePath,
      originalFilepath: mockImagePath,
      mode: 0,
    } as any);

    mockImageResizer.createResizedImage.mockResolvedValue({
      uri: 'file://compressed-image.jpg',
      path: '/path/to/compressed-image.jpg',
      name: 'compressed-image.jpg',
      size: 500000,
      width: 1024,
      height: 768,
    });

    mockRNFS.moveFile.mockResolvedValue(undefined);
    mockRNFS.unlink.mockResolvedValue(undefined);
  });

  describe('initializeReceiptsDirectory', () => {
    it('should create receipts directory if it does not exist', async () => {
      mockRNFS.exists.mockResolvedValue(false);

      await fileService.initializeReceiptsDirectory();

      expect(mockRNFS.mkdir).toHaveBeenCalledWith(mockReceiptsDir);
    });

    it('should not create directory if it already exists', async () => {
      mockRNFS.exists.mockResolvedValue(true);

      await fileService.initializeReceiptsDirectory();

      expect(mockRNFS.mkdir).not.toHaveBeenCalled();
    });

    it('should throw error if directory creation fails', async () => {
      mockRNFS.exists.mockResolvedValue(false);
      mockRNFS.mkdir.mockRejectedValue(new Error('Permission denied'));

      await expect(fileService.initializeReceiptsDirectory()).rejects.toThrow(
        'Failed to create receipts storage directory'
      );
    });
  });

  describe('validateImage', () => {
    describe('valid images', () => {
      it('should validate existing JPG image within size limit', async () => {
        mockRNFS.exists.mockResolvedValue(true);
        mockRNFS.stat.mockResolvedValue({
          size: 5 * 1024 * 1024, // 5MB
          isFile: () => true,
        } as any);

        const result = await fileService.validateImage('/path/to/image.jpg');

        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should validate JPEG format', async () => {
        const result = await fileService.validateImage('/path/to/image.jpeg');

        expect(result.valid).toBe(true);
      });

      it('should validate PNG format', async () => {
        const result = await fileService.validateImage('/path/to/image.png');

        expect(result.valid).toBe(true);
      });

      it('should handle uppercase extensions', async () => {
        const result = await fileService.validateImage('/path/to/image.JPG');

        expect(result.valid).toBe(true);
      });

      it('should accept image at maximum size (10MB)', async () => {
        mockRNFS.stat.mockResolvedValue({
          size: 10 * 1024 * 1024,
          isFile: () => true,
        } as any);

        const result = await fileService.validateImage('/path/to/large.jpg');

        expect(result.valid).toBe(true);
      });
    });

    describe('invalid images', () => {
      it('should reject non-existent image', async () => {
        mockRNFS.exists.mockResolvedValue(false);

        const result = await fileService.validateImage('/path/to/nonexistent.jpg');

        expect(result.valid).toBe(false);
        expect(result.error).toContain('does not exist');
      });

      it('should reject unsupported format', async () => {
        const result = await fileService.validateImage('/path/to/image.bmp');

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid image format');
      });

      it('should reject image without extension', async () => {
        const result = await fileService.validateImage('/path/to/image');

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid image format');
      });

      it('should reject image exceeding size limit', async () => {
        mockRNFS.stat.mockResolvedValue({
          size: 15 * 1024 * 1024, // 15MB
          isFile: () => true,
        } as any);

        const result = await fileService.validateImage('/path/to/huge.jpg');

        expect(result.valid).toBe(false);
        expect(result.error).toContain('too large');
      });

      it('should show allowed formats in error message', async () => {
        const result = await fileService.validateImage('/path/to/image.gif');

        expect(result.valid).toBe(false);
        expect(result.error).toContain('jpg, jpeg, png');
      });
    });

    describe('error handling', () => {
      it('should handle stat errors gracefully', async () => {
        mockRNFS.stat.mockRejectedValue(new Error('Permission denied'));

        const result = await fileService.validateImage('/path/to/image.jpg');

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Failed to validate');
      });
    });
  });

  describe('saveReceiptImage', () => {
    it('should save and compress receipt image', async () => {
      const savedPath = await fileService.saveReceiptImage(mockImagePath);

      expect(savedPath).toContain('/receipts/');
      expect(savedPath).toContain('receipt_');
      expect(savedPath).toMatch(/\.jpg$/);
    });

    it('should initialize directory before saving', async () => {
      mockRNFS.exists.mockResolvedValueOnce(false); // Directory doesn't exist

      await fileService.saveReceiptImage(mockImagePath);

      expect(mockRNFS.mkdir).toHaveBeenCalled();
    });

    it('should validate image before saving', async () => {
      mockRNFS.exists.mockResolvedValueOnce(true); // Directory exists
      mockRNFS.exists.mockResolvedValueOnce(false); // Image doesn't exist

      await expect(fileService.saveReceiptImage(mockImagePath)).rejects.toThrow();
    });

    it('should compress image with correct parameters', async () => {
      await fileService.saveReceiptImage(mockImagePath);

      expect(mockImageResizer.createResizedImage).toHaveBeenCalledWith(
        mockImagePath,
        1024, // MAX_IMAGE_WIDTH
        1024, // MAX_IMAGE_HEIGHT
        'JPEG',
        80, // IMAGE_QUALITY
        0,
        undefined
      );
    });

    it('should move compressed image to receipts directory', async () => {
      await fileService.saveReceiptImage(mockImagePath);

      expect(mockRNFS.moveFile).toHaveBeenCalledWith(
        'file://compressed-image.jpg',
        expect.stringContaining('/receipts/receipt_')
      );
    });

    it('should generate unique filenames', async () => {
      const path1 = await fileService.saveReceiptImage(mockImagePath);
      const path2 = await fileService.saveReceiptImage(mockImagePath);

      expect(path1).not.toBe(path2);
    });

    it('should throw error if validation fails', async () => {
      mockRNFS.stat.mockResolvedValue({
        size: 15 * 1024 * 1024, // Too large
        isFile: () => true,
      } as any);

      await expect(fileService.saveReceiptImage(mockImagePath)).rejects.toThrow(
        'too large'
      );
    });

    it('should throw error if compression fails', async () => {
      mockImageResizer.createResizedImage.mockRejectedValue(
        new Error('Compression failed')
      );

      await expect(fileService.saveReceiptImage(mockImagePath)).rejects.toThrow();
    });

    it('should throw error if move fails', async () => {
      mockRNFS.moveFile.mockRejectedValue(new Error('Move failed'));

      await expect(fileService.saveReceiptImage(mockImagePath)).rejects.toThrow();
    });
  });

  describe('getReceiptImage', () => {
    it('should return image path if it exists', async () => {
      mockRNFS.exists.mockResolvedValue(true);

      const result = await fileService.getReceiptImage(mockImagePath);

      expect(result).toBe(mockImagePath);
    });

    it('should return null if image does not exist', async () => {
      mockRNFS.exists.mockResolvedValue(false);

      const result = await fileService.getReceiptImage(mockImagePath);

      expect(result).toBeNull();
    });

    it('should check if file exists', async () => {
      await fileService.getReceiptImage(mockImagePath);

      expect(mockRNFS.exists).toHaveBeenCalledWith(mockImagePath);
    });

    it('should return null on error', async () => {
      mockRNFS.exists.mockRejectedValue(new Error('Permission denied'));

      const result = await fileService.getReceiptImage(mockImagePath);

      expect(result).toBeNull();
    });
  });

  describe('deleteReceiptImage', () => {
    it('should delete existing receipt image', async () => {
      mockRNFS.exists.mockResolvedValueOnce(true); // File exists
      mockRNFS.exists.mockResolvedValueOnce(false); // File deleted

      const result = await fileService.deleteReceiptImage(mockImagePath);

      expect(result).toBe(true);
      expect(mockRNFS.unlink).toHaveBeenCalledWith(mockImagePath);
    });

    it('should verify deletion after unlinking', async () => {
      mockRNFS.exists.mockResolvedValueOnce(true); // Before deletion
      mockRNFS.exists.mockResolvedValueOnce(false); // After deletion

      await fileService.deleteReceiptImage(mockImagePath);

      expect(mockRNFS.exists).toHaveBeenCalledTimes(2);
    });

    it('should return true if file already deleted', async () => {
      mockRNFS.exists.mockResolvedValue(false);

      const result = await fileService.deleteReceiptImage(mockImagePath);

      expect(result).toBe(true);
      expect(mockRNFS.unlink).not.toHaveBeenCalled();
    });

    it('should throw error if deletion verification fails', async () => {
      mockRNFS.exists.mockResolvedValueOnce(true); // File exists
      mockRNFS.exists.mockResolvedValueOnce(true); // Still exists after delete

      await expect(fileService.deleteReceiptImage(mockImagePath)).rejects.toThrow(
        'Failed to verify image deletion'
      );
    });

    it('should throw error if unlink fails', async () => {
      mockRNFS.unlink.mockRejectedValue(new Error('Permission denied'));

      await expect(fileService.deleteReceiptImage(mockImagePath)).rejects.toThrow();
    });
  });

  describe('createThumbnail', () => {
    it('should create thumbnail with correct dimensions', async () => {
      await fileService.createThumbnail(mockImagePath);

      expect(mockImageResizer.createResizedImage).toHaveBeenCalledWith(
        mockImagePath,
        200, // thumbnail width
        200, // thumbnail height
        'JPEG',
        70, // lower quality
        0,
        undefined
      );
    });

    it('should generate filename with thumb_ prefix', async () => {
      const thumbnailPath = await fileService.createThumbnail(mockImagePath);

      expect(thumbnailPath).toContain('thumb_');
      expect(thumbnailPath).not.toContain('receipt_');
    });

    it('should move thumbnail to receipts directory', async () => {
      await fileService.createThumbnail(mockImagePath);

      expect(mockRNFS.moveFile).toHaveBeenCalledWith(
        'file://compressed-image.jpg',
        expect.stringContaining('/receipts/thumb_')
      );
    });

    it('should return thumbnail path', async () => {
      const thumbnailPath = await fileService.createThumbnail(mockImagePath);

      expect(thumbnailPath).toContain('/receipts/');
      expect(thumbnailPath).toMatch(/\.jpg$/);
    });

    it('should throw error if thumbnail creation fails', async () => {
      mockImageResizer.createResizedImage.mockRejectedValue(
        new Error('Resize failed')
      );

      await expect(fileService.createThumbnail(mockImagePath)).rejects.toThrow(
        'Failed to create thumbnail'
      );
    });
  });

  describe('getReceiptsStorageSize', () => {
    it('should return total size of all receipt images', async () => {
      mockRNFS.exists.mockResolvedValue(true);
      mockRNFS.readDir.mockResolvedValue([
        { size: 1024 * 1024, path: '/receipts/img1.jpg' },
        { size: 2 * 1024 * 1024, path: '/receipts/img2.jpg' },
        { size: 512 * 1024, path: '/receipts/img3.jpg' },
      ] as any);

      const totalSize = await fileService.getReceiptsStorageSize();

      const expected = 1024 * 1024 + 2 * 1024 * 1024 + 512 * 1024;
      expect(totalSize).toBe(expected);
    });

    it('should return 0 if directory does not exist', async () => {
      mockRNFS.exists.mockResolvedValue(false);

      const totalSize = await fileService.getReceiptsStorageSize();

      expect(totalSize).toBe(0);
    });

    it('should return 0 if directory is empty', async () => {
      mockRNFS.exists.mockResolvedValue(true);
      mockRNFS.readDir.mockResolvedValue([]);

      const totalSize = await fileService.getReceiptsStorageSize();

      expect(totalSize).toBe(0);
    });

    it('should return 0 on error', async () => {
      mockRNFS.readDir.mockRejectedValue(new Error('Read error'));

      const totalSize = await fileService.getReceiptsStorageSize();

      expect(totalSize).toBe(0);
    });
  });

  describe('cleanupOrphanedImages', () => {
    it('should delete images not in valid paths list', async () => {
      mockRNFS.exists.mockResolvedValue(true);
      mockRNFS.readDir.mockResolvedValue([
        { path: '/receipts/img1.jpg' },
        { path: '/receipts/img2.jpg' },
        { path: '/receipts/img3.jpg' },
      ] as any);

      const validPaths = ['/receipts/img1.jpg', '/receipts/img3.jpg'];
      const deletedCount = await fileService.cleanupOrphanedImages(validPaths);

      expect(deletedCount).toBe(1);
      expect(mockRNFS.unlink).toHaveBeenCalledWith('/receipts/img2.jpg');
    });

    it('should not delete images in valid paths list', async () => {
      mockRNFS.exists.mockResolvedValue(true);
      mockRNFS.readDir.mockResolvedValue([
        { path: '/receipts/img1.jpg' },
        { path: '/receipts/img2.jpg' },
      ] as any);

      const validPaths = ['/receipts/img1.jpg', '/receipts/img2.jpg'];
      const deletedCount = await fileService.cleanupOrphanedImages(validPaths);

      expect(deletedCount).toBe(0);
      expect(mockRNFS.unlink).not.toHaveBeenCalled();
    });

    it('should return 0 if directory does not exist', async () => {
      mockRNFS.exists.mockResolvedValue(false);

      const deletedCount = await fileService.cleanupOrphanedImages([]);

      expect(deletedCount).toBe(0);
    });

    it('should delete all images if valid paths is empty', async () => {
      mockRNFS.exists.mockResolvedValue(true);
      mockRNFS.readDir.mockResolvedValue([
        { path: '/receipts/img1.jpg' },
        { path: '/receipts/img2.jpg' },
      ] as any);

      const deletedCount = await fileService.cleanupOrphanedImages([]);

      expect(deletedCount).toBe(2);
    });

    it('should throw error if cleanup fails', async () => {
      mockRNFS.exists.mockResolvedValue(true);
      mockRNFS.readDir.mockRejectedValue(new Error('Read error'));

      await expect(fileService.cleanupOrphanedImages([])).rejects.toThrow(
        'Failed to cleanup orphaned images'
      );
    });

    it('should handle partial cleanup failures', async () => {
      mockRNFS.exists.mockResolvedValue(true);
      mockRNFS.readDir.mockResolvedValue([
        { path: '/receipts/img1.jpg' },
        { path: '/receipts/img2.jpg' },
      ] as any);

      mockRNFS.unlink
        .mockResolvedValueOnce(undefined) // First delete succeeds
        .mockRejectedValueOnce(new Error('Delete failed')); // Second fails

      await expect(fileService.cleanupOrphanedImages([])).rejects.toThrow();
    });
  });
});
