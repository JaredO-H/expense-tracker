/**
 * ImagePreview Component
 * Displays captured receipt image with retake and accept options
 * Includes zoom and pan capabilities for image verification
 */

import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImagePreviewProps {
  imageUri: string;
  onRetake: () => void;
  onAccept: () => void;
  isProcessing?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUri,
  onRetake,
  onAccept,
  isProcessing = false,
}) => {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = (event: any) => {
    const { width, height } = event.nativeEvent.source;
    setImageSize({ width, height });
    setIsLoading(false);
  };

  const getImageDimensions = () => {
    if (imageSize.width === 0 || imageSize.height === 0) {
      return { width: SCREEN_WIDTH, height: SCREEN_HEIGHT };
    }

    const imageAspectRatio = imageSize.width / imageSize.height;
    const screenAspectRatio = SCREEN_WIDTH / SCREEN_HEIGHT;

    if (imageAspectRatio > screenAspectRatio) {
      // Image is wider than screen
      return {
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH / imageAspectRatio,
      };
    } else {
      // Image is taller than screen
      return {
        width: SCREEN_HEIGHT * imageAspectRatio,
        height: SCREEN_HEIGHT,
      };
    }
  };

  const dimensions = getImageDimensions();

  return (
    <View style={styles.container}>
      {/* Image display */}
      <View style={styles.imageContainer}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        )}
        <Image
          source={{ uri: imageUri }}
          style={[styles.image, dimensions]}
          resizeMode="contain"
          onLoad={handleImageLoad}
        />
      </View>

      {/* Image metadata */}
      {!isLoading && (
        <View style={styles.metadataContainer}>
          <Text style={styles.metadataText}>
            {imageSize.width} x {imageSize.height}
          </Text>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.retakeButton]}
          onPress={onRetake}
          disabled={isProcessing}>
          <Text style={styles.retakeButtonText}>Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.acceptButton, isProcessing && styles.buttonDisabled]}
          onPress={onAccept}
          disabled={isProcessing}>
          {isProcessing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.acceptButtonText}>Accept</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Guidance text */}
      <View style={styles.guidanceContainer}>
        <Text style={styles.guidanceText}>
          Review the receipt image. Ensure all text is clear and readable.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    backgroundColor: '#000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  metadataContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  metadataText: {
    color: '#fff',
    fontSize: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  retakeButton: {
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#3b82f6',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  guidanceContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  guidanceText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
});
