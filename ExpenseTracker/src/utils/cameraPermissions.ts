/**
 * Camera & Gallery Permissions Utility
 * Handles camera and photo library permission requests and status checks for both Android and iOS
 */

import { Alert, Linking, Platform, PermissionsAndroid } from 'react-native';
import { Camera } from 'react-native-vision-camera';

export type PermissionStatus = 'granted' | 'denied' | 'not-determined' | 'restricted';

/**
 * Request camera permissions with user-friendly messaging
 * @returns Promise<PermissionStatus>
 */
export const requestCameraPermission = async (): Promise<PermissionStatus> => {
  try {
    const permission = await Camera.requestCameraPermission();
    return permission as PermissionStatus;
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return 'denied';
  }
};

/**
 * Check current camera permission status
 * @returns PermissionStatus
 */
export const getCameraPermissionStatus = (): PermissionStatus => {
  const permission = Camera.getCameraPermissionStatus();
  return permission as PermissionStatus;
};


 //Handle permission denied scenario with guidance to open settings

export const handlePermissionDenied = (): void => {
  Alert.alert(
    'Camera Permission Required',
    'Camera access is needed to capture receipt photos. Please enable camera permissions in your device settings.',
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
    ]
  );
};

/**
 * Check if camera is available on the device
 * @returns Promise<boolean>
 */
export const isCameraAvailable = async (): Promise<boolean> => {
  try {
    const devices = await Camera.getAvailableCameraDevices();
    return devices.length > 0;
  } catch (error) {
    console.error('Error checking camera availability:', error);
    return false;
  }
};

/**
 * Get the appropriate back camera device for receipt capture
 * @returns Promise<CameraDevice | null>
 */
export const getBackCameraDevice = async () => {
  try {
    const devices = await Camera.getAvailableCameraDevices();
    const backCamera = devices.find(device => device.position === 'back');
    return backCamera || devices[0] || null;
  } catch (error) {
    console.error('Error getting back camera device:', error);
    return null;
  }
};

/**
 * Request camera permission with proper flow handling
 * Returns true if permission granted, false otherwise
 */
export const ensureCameraPermission = async (): Promise<boolean> => {
  const currentStatus = getCameraPermissionStatus();

  if (currentStatus === 'granted') {
    return true;
  }

  if (currentStatus === 'not-determined') {
    const newStatus = await requestCameraPermission();
    return newStatus === 'granted';
  }

  if (currentStatus === 'denied' || currentStatus === 'restricted') {
    handlePermissionDenied();
    return false;
  }

  return false;
};

/**
 * Request photo library/gallery permissions
 * @returns Promise<boolean>
 */
export const requestGalleryPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      // Android 13+ (API 33+) uses READ_MEDIA_IMAGES
      if (Platform.Version >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          {
            title: 'Photo Library Permission',
            message: 'This app needs access to your photo library to select receipt images.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // Android 12 and below use READ_EXTERNAL_STORAGE
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Photo Library Permission',
            message: 'This app needs access to your photo library to select receipt images.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    // iOS permissions are handled automatically by react-native-image-picker
    // but we need the Info.plist entries
    return true;
  } catch (error) {
    console.error('Error requesting gallery permission:', error);
    return false;
  }
};

/**
 * Check gallery permission status
 * @returns Promise<boolean>
 */
export const checkGalleryPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        );
        return granted;
      } else {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        return granted;
      }
    }
    // iOS permissions are handled by the system
    return true;
  } catch (error) {
    console.error('Error checking gallery permission:', error);
    return false;
  }
};

/**
 * Handle gallery permission denied scenario
 */
export const handleGalleryPermissionDenied = (): void => {
  Alert.alert(
    'Photo Library Permission Required',
    'Photo library access is needed to select receipt images. Please enable photo library permissions in your device settings.',
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
    ]
  );
};

/**
 * Ensure gallery permission with proper flow handling
 * Returns true if permission granted, false otherwise
 */
export const ensureGalleryPermission = async (): Promise<boolean> => {
  const hasPermission = await checkGalleryPermission();

  if (hasPermission) {
    return true;
  }

  const granted = await requestGalleryPermission();

  if (!granted) {
    handleGalleryPermissionDenied();
    return false;
  }

  return true;
};
