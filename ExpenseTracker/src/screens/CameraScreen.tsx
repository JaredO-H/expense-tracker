/**
 * Camera Screen
 * Main screen for camera-based receipt capture
 * Orchestrates camera capture, preview, and image compression
 */

import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CameraCapture } from '../components/camera/CameraCapture';
import { ImagePreview } from '../components/camera/ImagePreview';
import { compressReceiptImage } from '../utils/imageCompression';
import RNFS from 'react-native-fs';

type CameraMode = 'capture' | 'preview';

export const CameraScreen: React.FC = () => {
  const navigation = useNavigation();

  const [mode, setMode] = useState<CameraMode>('capture');
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Handle photo capture from camera
   */
  const handleCapture = (imageUri: string) => {
    console.log('Image captured:', imageUri);
    setCapturedImageUri(imageUri);
    setMode('preview');
  };

  /**
   * Handle retake - go back to camera mode
   */
  const handleRetake = () => {
    // Clean up the captured image
    if (capturedImageUri) {
      RNFS.unlink(capturedImageUri.replace('file://', '')).catch(error => {
        console.error('Error deleting temporary image:', error);
      });
    }
    setCapturedImageUri(null);
    setMode('capture');
  };

  /**
   * Handle accept - compress and save the image
   */
  const handleAccept = async () => {
    if (!capturedImageUri) {
      return;
    }

    try {
      setIsProcessing(true);

      console.log('Processing image...');

      // Compress the image
      const compressionResult = await compressReceiptImage(capturedImageUri);

      console.log('Image compressed successfully:', {
        originalUri: capturedImageUri,
        compressedUri: compressionResult.uri,
        compressionRatio: `${(compressionResult.compressionRatio * 100).toFixed(2)}%`,
      });

      // Generate final filename with timestamp
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const filename = `receipt_${timestamp}_${randomId}.jpg`;

      // Define the final destination path
      const receiptsDir = `${RNFS.DocumentDirectoryPath}/receipts`;

      // Create receipts directory if it doesn't exist
      const dirExists = await RNFS.exists(receiptsDir);
      if (!dirExists) {
        await RNFS.mkdir(receiptsDir);
      }

      const finalPath = `${receiptsDir}/${filename}`;

      // Move compressed image to final location
      await RNFS.moveFile(
        compressionResult.uri.replace('file://', ''),
        finalPath
      );

      // Clean up original captured image if different
      if (capturedImageUri !== compressionResult.uri) {
        await RNFS.unlink(capturedImageUri.replace('file://', '')).catch(error => {
          console.error('Error deleting original image:', error);
        });
      }

      const finalUri = `file://${finalPath}`;

      console.log('Image saved to:', finalUri);

      Alert.alert(
        'Success',
        'Receipt image captured and saved successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back or to expense form with the image URI
              navigation.goBack();
              // TODO: Pass the finalUri to the expense form
              // This will be implemented when integrating with the expense creation flow
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert(
        'Processing Failed',
        'Failed to process the image. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle cancel - go back to previous screen
   */
  const handleCancel = () => {
    // Clean up any captured images
    if (capturedImageUri) {
      RNFS.unlink(capturedImageUri.replace('file://', '')).catch(error => {
        console.error('Error deleting temporary image:', error);
      });
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {mode === 'capture' ? (
        <CameraCapture onCapture={handleCapture} onCancel={handleCancel} />
      ) : (
        capturedImageUri && (
          <ImagePreview
            imageUri={capturedImageUri}
            onRetake={handleRetake}
            onAccept={handleAccept}
            isProcessing={isProcessing}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
