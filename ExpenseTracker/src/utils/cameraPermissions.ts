/**
 * Camera Permissions Utility
 * Handles camera permission requests and status checks for both Android and iOS
 */

import { Alert, Linking } from 'react-native';
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
