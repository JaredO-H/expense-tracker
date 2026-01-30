/**
 * ReceiptImagePicker Component
 * Allows users to add, view, change, and remove receipt images
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import fileService from '../../services/storage/fileService';
import { ensureCameraPermission, ensureGalleryPermission } from '../../utils/cameraPermissions';
import { spacing, borderRadius, textStyles, shadows } from '../../styles';
import { useTheme } from '../../contexts/ThemeContext';

interface ReceiptImagePickerProps {
  value?: string; // current image path
  onChange: (imagePath: string | undefined) => void;
  editable?: boolean; // respect loading states
}

export const ReceiptImagePicker: React.FC<ReceiptImagePickerProps> = ({
  value,
  onChange,
  editable = true,
}) => {
  const { colors: themeColors } = useTheme();
  const navigation = useNavigation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageExists, setImageExists] = useState(false);

  // Verify image exists on mount and when value changes
  useEffect(() => {
    const verifyImage = async () => {
      if (value) {
        const exists = await fileService.getReceiptImage(value);
        if (!exists) {
          // Image file missing - clear the field
          onChange(undefined);
          Alert.alert('Image Missing', 'The receipt image could not be found.');
          setImageExists(false);
        } else {
          setImageExists(true);
        }
      } else {
        setImageExists(false);
      }
    };

    verifyImage();
  }, [value, onChange]);

  const handleImageSelection = async (imageUri: string) => {
    setIsProcessing(true);
    try {
      // Save and compress the image
      const savedPath = await fileService.saveReceiptImage(imageUri);
      onChange(savedPath);
    } catch (error) {
      console.error('Failed to save image:', error);
      Alert.alert(
        'Save Failed',
        error instanceof Error ? error.message : 'Failed to save the image. Please try again.',
        [{ text: 'OK' }],
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const showImageSourceOptions = () => {
    Alert.alert(
      'Add Receipt Image',
      'Choose how you want to add the receipt:',
      [
        {
          text: 'Take Photo',
          onPress: handleTakePhoto,
        },
        {
          text: 'Choose from Gallery',
          onPress: handleChooseFromGallery,
        },
        {
          text: 'Cancel',
          onPress: () => {},
        },
      ],
      { cancelable: true },
    );
  };

  const handleTakePhoto = async () => {
    try {
      const hasPermission = await ensureCameraPermission();
      if (!hasPermission) {
        return;
      }

      const result = await launchCamera({
        mediaType: 'photo',
        quality: 1,
        saveToPhotos: false,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        console.error('Camera Error:', result.errorMessage);
        Alert.alert('Camera Failed', 'Failed to capture photo. Please try again.', [
          { text: 'OK' },
        ]);
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri) {
          await handleImageSelection(asset.uri);
        }
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert('Error', 'An unexpected error occurred while capturing the photo.');
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      const hasPermission = await ensureGalleryPermission();
      if (!hasPermission) {
        return;
      }

      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
        selectionLimit: 1,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        console.error('Gallery Error:', result.errorMessage);
        Alert.alert('Selection Failed', 'Failed to select image from gallery. Please try again.', [
          { text: 'OK' },
        ]);
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri) {
          await handleImageSelection(asset.uri);
        }
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'An unexpected error occurred while selecting the image.');
    }
  };

  const handleViewImage = () => {
    if (value && imageExists) {
      // Navigate to full-screen image viewer
      (navigation.navigate as any)('ReceiptImageViewer', { imagePath: value });
    }
  };

  const handleChangeImage = () => {
    showImageSourceOptions();
  };

  const handleRemoveImage = () => {
    Alert.alert('Remove Receipt Image', 'Are you sure you want to remove this receipt image?', [
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          onChange(undefined);
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  // Loading State
  if (isProcessing) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: themeColors.backgroundElevated,
            borderColor: themeColors.border,
          },
        ]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={[styles.processingText, { color: themeColors.textSecondary }]}>
          Processing image...
        </Text>
      </View>
    );
  }

  // Preview State - Image selected
  if (value && imageExists) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: themeColors.backgroundElevated,
            borderColor: themeColors.border,
          },
        ]}>
        <View style={styles.previewContainer}>
          {/* Thumbnail */}
          <View style={[styles.thumbnailContainer, { borderColor: themeColors.border }]}>
            <Image
              source={{ uri: `file://${value}` }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleViewImage}
              disabled={!editable}>
              <Icon name="eye-outline" size={20} color={themeColors.primary} />
              <Text style={[styles.actionText, { color: themeColors.primary }]}>View</Text>
            </TouchableOpacity>

            <View style={[styles.actionDivider, { backgroundColor: themeColors.borderSubtle }]} />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleChangeImage}
              disabled={!editable}>
              <Icon name="swap-horizontal-outline" size={20} color={themeColors.accent1} />
              <Text style={[styles.actionText, { color: themeColors.accent1 }]}>Change</Text>
            </TouchableOpacity>

            <View style={[styles.actionDivider, { backgroundColor: themeColors.borderSubtle }]} />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleRemoveImage}
              disabled={!editable}>
              <Icon name="trash-outline" size={20} color={themeColors.error} />
              <Text style={[styles.actionText, { color: themeColors.error }]}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Empty State - No image selected
  return (
    <TouchableOpacity
      style={[
        styles.container,
        styles.emptyContainer,
        {
          backgroundColor: themeColors.backgroundElevated,
          borderColor: themeColors.borderSubtle,
        },
      ]}
      onPress={showImageSourceOptions}
      disabled={!editable}
      activeOpacity={0.7}>
      <Icon name="camera-outline" size={48} color={themeColors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>Add Receipt Image</Text>
      <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
        Tap to take a photo or select from gallery
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 3,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    ...shadows.small,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    ...textStyles.h3,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...textStyles.helper,
    textAlign: 'center',
  },
  processingText: {
    ...textStyles.body,
    marginTop: spacing.md,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    overflow: 'hidden',
    ...shadows.small,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  actionsContainer: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: spacing.lg,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  actionText: {
    ...textStyles.label,
    fontSize: 12,
    marginTop: spacing.xs,
    fontWeight: '700',
  },
  actionDivider: {
    width: 1,
    height: 40,
  },
});
