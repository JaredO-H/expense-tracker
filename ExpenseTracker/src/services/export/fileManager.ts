/**
 * File management utilities for export operations
 */

import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { Platform } from 'react-native';
import { ExportFormat } from '../../types/export';
import { ensureStoragePermission } from '../../utils/storagePermissions';

/**
 * Sanitize a filename by removing invalid characters
 */
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .trim();
};

/**
 * Generate a filename for an export
 */
export const generateFilename = (
  tripName: string,
  format: ExportFormat,
  timestamp?: Date,
): string => {
  const date = timestamp || new Date();
  const formattedDate = date.toISOString().replace(/[:.]/g, '-').split('T')[0];
  const formattedTime = date.toISOString().split('T')[1].split('.')[0].replace(/:/g, '');

  const sanitizedName = sanitizeFilename(tripName);
  const ext = getFileExtension(format);

  return `${sanitizedName}_${format}_${formattedDate}_${formattedTime}.${ext}`;
};

/**
 * Get file extension for a format
 */
export const getFileExtension = (format: ExportFormat): string => {
  switch (format) {
    case ExportFormat.CSV:
      return 'csv';
    case ExportFormat.PDF:
      return 'pdf';
    case ExportFormat.EXCEL:
      return 'xlsx';
    default:
      return 'txt';
  }
};

/**
 * Get the appropriate directory path for saving exports
 * Uses device's public storage for easy access to exported files
 */
export const getExportDirectory = async (): Promise<string> => {
  // Request storage permission
  const hasPermission = await ensureStoragePermission();
  if (!hasPermission) {
    throw new Error('Storage permission not granted');
  }

  let exportDir: string;

  if (Platform.OS === 'android') {
    if (Platform.Version >= 29) {
      // Android 10+ - Use Downloads folder which is accessible with scoped storage
      const downloadDir = RNFS.DownloadDirectoryPath;
      exportDir = `${downloadDir}/ExpenseTracker`;
    } else {
      // Android 9 and below - Use public Documents folder
      const externalStorage = RNFS.ExternalStorageDirectoryPath;
      exportDir = `${externalStorage}/Documents/ExpenseTracker`;
    }
  } else {
    // iOS - Use app's Documents directory (standard iOS sandbox location)
    // Files saved here can be accessed via Files app
    exportDir = `${RNFS.DocumentDirectoryPath}/ExpenseTracker`;
  }

  console.log('Export directory:', exportDir);

  // Create directory if it doesn't exist
  const exists = await RNFS.exists(exportDir);
  if (!exists) {
    await RNFS.mkdir(exportDir);
  }

  return exportDir;
};

/**
 * Save export data to a file
 */
export const saveExportFile = async (
  content: string,
  filename: string,
  encoding: 'utf8' | 'base64' = 'utf8',
): Promise<string> => {
  try {
    const directory = await getExportDirectory();
    const filePath = `${directory}/${filename}`;

    await RNFS.writeFile(filePath, content, encoding);

    return filePath;
  } catch (error) {
    throw new Error(`Failed to save export file: ${error}`);
  }
};

/**
 * Get the file size in a human-readable format
 */
export const getFileSize = async (filePath: string): Promise<number> => {
  try {
    const stat = await RNFS.stat(filePath);
    return stat.size;
  } catch (error) {
    throw new Error(`Failed to get file size: ${error}`);
  }
};

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

/**
 * Get MIME type from file extension
 */
const getMimeType = (filePath: string): string => {
  const extension = filePath.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'csv':
      return 'text/csv';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    default:
      return 'application/octet-stream';
  }
};

/**
 * Share an export file
 */
export const shareExportFile = async (filePath: string, title: string): Promise<void> => {
  try {
    console.log('shareExportFile called with path:', filePath);

    // Verify file exists before sharing
    const exists = await RNFS.exists(filePath);
    if (!exists) {
      throw new Error(`File does not exist at path: ${filePath}`);
    }

    console.log('File exists, proceeding with share');

    // Get MIME type
    const mimeType = getMimeType(filePath);
    console.log('MIME type:', mimeType);

    // Construct proper file URL for the platform
    let fileUrl: string;

    // Ensure file:// prefix for all platforms
    if (!filePath.startsWith('file://')) {
      fileUrl = `file://${filePath}`;
    } else {
      fileUrl = filePath;
    }

    console.log('Sharing with URL:', fileUrl);

    // On Android, use urls array for better FileProvider support
    const shareOptions: any =
      Platform.OS === 'android'
        ? {
            title: title,
            subject: title,
            failOnCancel: false,
            urls: [fileUrl],
            type: mimeType,
          }
        : {
            title: title,
            subject: title,
            failOnCancel: false,
            url: fileUrl,
            type: mimeType,
          };

    console.log('Share options:', shareOptions);

    const result = await Share.open(shareOptions);
    console.log('Share result:', result);
  } catch (error) {
    // User cancelled sharing or error occurred
    if (error instanceof Error && error.message !== 'User did not share') {
      console.error('Share error:', error);
      throw new Error(
        `Failed to share file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
    console.log('User cancelled share');
  }
};

/**
 * Delete a file from the filesystem
 */
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    const exists = await RNFS.exists(filePath);
    if (exists) {
      await RNFS.unlink(filePath);
    }
  } catch (error) {
    throw new Error(`Failed to delete file: ${error}`);
  }
};

/**
 * Check if there's enough storage space
 */
export const hasEnoughSpace = async (requiredBytes: number): Promise<boolean> => {
  try {
    const freeSpace = await RNFS.getFSInfo();
    return freeSpace.freeSpace > requiredBytes;
  } catch {
    // If we can't determine, assume there's enough space
    return true;
  }
};

/**
 * Calculate storage space that would be recovered by deleting receipt images
 */
export const calculateReceiptStorageSize = async (receiptPaths: string[]): Promise<number> => {
  let totalSize = 0;

  for (const path of receiptPaths) {
    try {
      if (path && (await RNFS.exists(path))) {
        const stat = await RNFS.stat(path);
        totalSize += stat.size;
      }
    } catch (error) {
      // Skip files that can't be accessed
      console.warn(`Could not access file: ${path}`, error);
    }
  }

  return totalSize;
};

/**
 * Delete receipt images for a trip
 */
export const deleteReceiptImages = async (receiptPaths: string[]): Promise<number> => {
  let deletedCount = 0;

  for (const path of receiptPaths) {
    try {
      if (path && (await RNFS.exists(path))) {
        await RNFS.unlink(path);
        deletedCount++;
      }
    } catch (error) {
      console.warn(`Could not delete file: ${path}`, error);
    }
  }

  return deletedCount;
};
