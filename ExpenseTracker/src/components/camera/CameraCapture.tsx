/**
 * CameraCapture Component
 * Main camera interface for capturing receipt photos
 * Uses react-native-vision-camera for high-quality image capture
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  Vibration,
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { ensureCameraPermission } from '../../utils/cameraPermissions';
import { colors, spacing, borderRadius, textStyles, commonStyles } from '../../styles';

interface CameraCaptureProps {
  onCapture: (imageUri: string) => void;
  onCancel: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const camera = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  const [isActive, setIsActive] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);

  useEffect(() => {
    // Request camera permission on mount
    const checkPermission = async () => {
      if (!hasPermission) {
        const granted = await ensureCameraPermission();
        if (!granted) {
          onCancel();
        }
      }
    };

    checkPermission();
  }, [hasPermission, onCancel]);

  useEffect(() => {
    // Cleanup camera when component unmounts
    return () => {
      setIsActive(false);
    };
  }, []);

  const handleCapture = async () => {
    if (!camera.current || isCapturing) {
      return;
    }

    try {
      setIsCapturing(true);

      // Capture photo with high quality settings
      const photo = await camera.current.takePhoto({
        flash: flashEnabled ? 'on' : 'off',
        enableShutterSound: true,
      });

      // Provide haptic feedback (silently fail if not available)
      try {
        Vibration.vibrate(50);
      } catch (error) {
        // Vibration not available or permission denied - continue without it
        console.log('Vibration not available:', error);
      }

      // Get the file URI
      const imageUri = `file://${photo.path}`;

      console.log('Photo captured:', {
        uri: imageUri,
        width: photo.width,
        height: photo.height,
      });

      // Pass the captured image to parent component
      onCapture(imageUri);
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert(
        'Capture Failed',
        'Failed to capture photo. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const toggleFlash = () => {
    setFlashEnabled(prev => !prev);
  };

  // Show loading while camera initializes
  if (!device) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Initializing camera...</Text>
      </View>
    );
  }

  // Show permission denied message
  if (!hasPermission) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.permissionText}>Camera permission required</Text>
        <Text style={styles.permissionSubtext}>
          Please grant camera access to capture receipt photos
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={styles.camera}
        device={device}
        isActive={isActive && hasPermission}
        photo={true}
        enableZoomGesture={true}
      />

      {/* Framing guide overlay */}
      <View style={styles.overlay}>
        <View style={styles.framingGuide}>
          <View style={styles.cornerTopLeft} />
          <View style={styles.cornerTopRight} />
          <View style={styles.cornerBottomLeft} />
          <View style={styles.cornerBottomRight} />
        </View>
      </View>

      {/* Camera controls */}
      <View style={styles.controls}>
        {/* Top controls */}
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
            <Text style={styles.flashButtonText}>
              {flashEnabled ? '⚡ Flash On' : '⚡ Flash Off'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
            onPress={handleCapture}
            disabled={isCapturing}>
            {isCapturing ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>

          <View style={styles.placeholder} />
        </View>
      </View>

      {/* Guidance text */}
      <View style={styles.guidanceContainer}>
        <Text style={styles.guidanceText}>
          Position receipt within the frame
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.flex1,
    backgroundColor: colors.shadow,
  },
  camera: {
    flex: 1,
  },
  loadingContainer: {
    ...commonStyles.flex1,
    backgroundColor: colors.shadow,
    ...commonStyles.flexCenter,
    padding: spacing.lg,
  },
  loadingText: {
    ...textStyles.body,
    color: colors.textInverse,
    marginTop: spacing.base,
  },
  permissionText: {
    ...textStyles.h4,
    color: colors.textInverse,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  permissionSubtext: {
    ...textStyles.body,
    color: colors.gray400,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  permissionButtonText: {
    ...textStyles.button,
    color: colors.textInverse,
  },
  cancelButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  cancelButtonText: {
    ...textStyles.body,
    color: colors.primary,
  },
  overlay: {
    ...commonStyles.absoluteFill,
    ...commonStyles.flexCenter,
    pointerEvents: 'none',
  },
  framingGuide: {
    width: '80%',
    aspectRatio: 3 / 4,
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.primary,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.primary,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.primary,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.primary,
  },
  controls: {
    ...commonStyles.absoluteFill,
    justifyContent: 'space-between',
  },
  topControls: {
    ...commonStyles.flexRow,
    justifyContent: 'flex-end',
    padding: spacing.lg,
    paddingTop: 60,
  },
  flashButton: {
    backgroundColor: colors.blackOverlay50,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
  },
  flashButtonText: {
    ...textStyles.body,
    color: colors.textInverse,
    fontWeight: '600',
  },
  bottomControls: {
    ...commonStyles.flexRow,
    ...commonStyles.flexBetween,
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  closeButton: {
    backgroundColor: colors.blackOverlay50,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
    minWidth: 80,
  },
  closeButtonText: {
    ...textStyles.body,
    color: colors.textInverse,
    fontWeight: '600',
    textAlign: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.whiteOverlay30,
    ...commonStyles.flexCenter,
    borderWidth: 4,
    borderColor: colors.background,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background,
  },
  placeholder: {
    width: 80,
  },
  guidanceContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  guidanceText: {
    ...textStyles.body,
    color: colors.textInverse,
    backgroundColor: colors.blackOverlay50,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
  },
});
