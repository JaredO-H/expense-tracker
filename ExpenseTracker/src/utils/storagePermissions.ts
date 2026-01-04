/**
 * Storage Permissions Utility
 * Handles storage permission requests for saving export files to device storage
 */

import { Alert, Linking, Platform, PermissionsAndroid } from 'react-native';

/**
 * Request storage write permission for Android
 * For Android 13+ (API 33+), storage permissions work differently with scoped storage
 * @returns Promise<boolean>
 */
export const requestStoragePermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS !== 'android') {
      // iOS doesn't need storage permissions for its sandboxed file system
      return true;
    }

    // Android 13+ (API 33+) doesn't need WRITE_EXTERNAL_STORAGE for app-specific directories
    // or when using MediaStore API
    if (Platform.Version >= 33) {
      return true;
    }

    // Android 10-12 (API 29-32)
    if (Platform.Version >= 29) {
      // For Android 10+, we'll use scoped storage or app-specific directories
      // which don't require permissions
      return true;
    }

    // Android 9 and below (API 28 and below)
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission Required',
        message: 'This app needs storage access to save your exported trip files to your device.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    console.error('Error requesting storage permission:', error);
    return false;
  }
};

/**
 * Check storage permission status
 * @returns Promise<boolean>
 */
export const checkStoragePermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS !== 'android') {
      return true;
    }

    // Android 10+ (API 29+) doesn't need explicit permission for scoped storage
    if (Platform.Version >= 29) {
      return true;
    }

    // Android 9 and below
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );
    return granted;
  } catch (error) {
    console.error('Error checking storage permission:', error);
    return false;
  }
};

/**
 * Handle storage permission denied scenario
 */
export const handleStoragePermissionDenied = (): void => {
  Alert.alert(
    'Storage Permission Required',
    'Storage access is needed to save exported files. Please enable storage permissions in your device settings.',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Open Settings',
        onPress: () => {
          Linking.openSettings();
        },
      },
    ],
  );
};

/**
 * Ensure storage permission with proper flow handling
 * Returns true if permission granted, false otherwise
 */
export const ensureStoragePermission = async (): Promise<boolean> => {
  const hasPermission = await checkStoragePermission();

  if (hasPermission) {
    return true;
  }

  const granted = await requestStoragePermission();

  if (!granted) {
    handleStoragePermissionDenied();
    return false;
  }

  return true;
};
