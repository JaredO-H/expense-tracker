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
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { ensureCameraPermission, ensureGalleryPermission } from '../../utils/cameraPermissions';
import { colors as staticColors, spacing, borderRadius, textStyles, commonStyles } from '../../styles';
import { useTheme } from '../../contexts/ThemeContext';

interface CameraCaptureProps {
  onCapture: (imageUri: string) => void;
  onCancel: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const camera = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const { colors } = useTheme();

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

  const handleSelectFromGallery = async () => {
    try {
      // Check and request gallery permissions before launching image picker
      const hasPermission = await ensureGalleryPermission();

      if (!hasPermission) {
        console.log('Gallery permission not granted');
        return;
      }

      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
        selectionLimit: 1,
      });

      if (result.didCancel) {
        console.log('User cancelled image picker');
        return;
      }

      if (result.errorCode) {
        console.error('ImagePicker Error:', result.errorMessage);
        Alert.alert(
          'Selection Failed',
          'Failed to select image from gallery. Please try again.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imageUri = asset.uri;

        if (imageUri) {
          console.log('Image selected from gallery:', imageUri);
          onCapture(imageUri);
        }
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert(
        'Selection Failed',
        'Failed to select image from gallery. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Show loading while camera initializes
  if (!device) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.shadow }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: '#FFFFFF' }]}>Initializing camera...</Text>
      </View>
    );
  }

  // Show permission denied message
  if (!hasPermission) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.shadow }]}>
        <Text style={[styles.permissionText, { color: '#FFFFFF' }]}>Camera permission required</Text>
        <Text style={[styles.permissionSubtext, { color: colors.gray400 }]}>
          Please grant camera access to capture receipt photos
        </Text>
        <TouchableOpacity style={[styles.permissionButton, { backgroundColor: colors.primary }]} onPress={requestPermission}>
          <Text style={[styles.permissionButtonText, { color: '#FFFFFF' }]}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={[styles.cancelButtonText, { color: colors.primary }]}>Cancel</Text>
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
          <View style={[styles.cornerTopLeft, { borderColor: colors.primary }]} />
          <View style={[styles.cornerTopRight, { borderColor: colors.primary }]} />
          <View style={[styles.cornerBottomLeft, { borderColor: colors.primary }]} />
          <View style={[styles.cornerBottomRight, { borderColor: colors.primary }]} />
        </View>
      </View>

      {/* Camera controls */}
      <View style={styles.controls}>
        {/* Top controls */}
        <View style={styles.topControls}>
          <TouchableOpacity style={[styles.galleryButton, { backgroundColor: colors.blackOverlay50 }]} onPress={handleSelectFromGallery}>
            <Icon name="images-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={[styles.galleryButtonText, { color: '#FFFFFF' }]}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.flashButton, { backgroundColor: colors.blackOverlay50 }]} onPress={toggleFlash}>
            <Icon
              name={flashEnabled ? 'flash' : 'flash-off'}
              size={20}
              color="#FFFFFF"
              style={styles.buttonIcon}
            />
            <Text style={[styles.flashButtonText, { color: '#FFFFFF' }]}>
              {flashEnabled ? 'Flash On' : 'Flash Off'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.blackOverlay50 }]} onPress={onCancel}>
            <Text style={[styles.closeButtonText, { color: '#FFFFFF' }]}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureButton, { backgroundColor: colors.whiteOverlay30, borderColor: colors.background }, isCapturing && styles.captureButtonDisabled]}
            onPress={handleCapture}
            disabled={isCapturing}>
            {isCapturing ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <View style={[styles.captureButtonInner, { backgroundColor: colors.background }]} />
            )}
          </TouchableOpacity>

          <View style={styles.placeholder} />
        </View>
      </View>

      {/* Guidance text */}
      <View style={styles.guidanceContainer}>
        <Text style={[styles.guidanceText, { color: '#FFFFFF', backgroundColor: colors.blackOverlay50 }]}>
          Position receipt within the frame
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.flex1,
    backgroundColor: staticColors.shadow,
  },
  camera: {
    flex: 1,
  },
  loadingContainer: {
    ...commonStyles.flex1,
    backgroundColor: staticColors.shadow,
    ...commonStyles.flexCenter,
    padding: spacing.lg,
  },
  loadingText: {
    ...textStyles.body,
    color: staticColors.textInverse,
    marginTop: spacing.base,
  },
  permissionText: {
    ...textStyles.h4,
    color: staticColors.textInverse,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  permissionSubtext: {
    ...textStyles.body,
    color: staticColors.gray400,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  permissionButton: {
    backgroundColor: staticColors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  permissionButtonText: {
    ...textStyles.button,
    color: staticColors.textInverse,
  },
  cancelButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  cancelButtonText: {
    ...textStyles.body,
    color: staticColors.primary,
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
    borderColor: staticColors.primary,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: staticColors.primary,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: staticColors.primary,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: staticColors.primary,
  },
  controls: {
    ...commonStyles.absoluteFill,
    justifyContent: 'space-between',
  },
  topControls: {
    ...commonStyles.flexRow,
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingTop: 60,
  },
  galleryButton: {
    ...commonStyles.flexRow,
    ...commonStyles.alignCenter,
    backgroundColor: staticColors.blackOverlay50,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
  },
  flashButton: {
    ...commonStyles.flexRow,
    ...commonStyles.alignCenter,
    backgroundColor: staticColors.blackOverlay50,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
  },
  buttonIcon: {
    marginRight: spacing.xs,
  },
  galleryButtonText: {
    ...textStyles.body,
    fontWeight: '600',
  },
  flashButtonText: {
    ...textStyles.body,
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
    backgroundColor: staticColors.blackOverlay50,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
    minWidth: 80,
  },
  closeButtonText: {
    ...textStyles.body,
    color: staticColors.textInverse,
    fontWeight: '600',
    textAlign: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: staticColors.whiteOverlay30,
    ...commonStyles.flexCenter,
    borderWidth: 4,
    borderColor: staticColors.background,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: staticColors.background,
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
    color: staticColors.textInverse,
    backgroundColor: staticColors.blackOverlay50,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
  },
});
