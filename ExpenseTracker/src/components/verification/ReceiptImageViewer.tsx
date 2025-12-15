/**
 * ReceiptImageViewer Component
 * Full-screen receipt image display with pinch-to-zoom and pan gestures
 */

import React, { useState } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Text, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, spacing, textStyles, commonStyles } from '../../styles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

interface ReceiptImageViewerProps {
  imageUri: string;
  onLoadError?: () => void;
}

export const ReceiptImageViewer: React.FC<ReceiptImageViewerProps> = ({
  imageUri,
  onLoadError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // Shared values for zoom and pan
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Handle image load
  const handleImageLoad = (event: any) => {
    const { width, height } = event.nativeEvent.source;
    setImageSize({ width, height });
    setIsLoading(false);
  };

  // Handle image error
  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
    if (onLoadError) {
      onLoadError();
    }
  };

  // Calculate the max translation boundaries based on current zoom
  const getMaxTranslation = (currentScale: number): { x: number; y: number } => {
    'worklet';
    const scaledWidth = SCREEN_WIDTH * currentScale;
    const scaledHeight = SCREEN_HEIGHT * currentScale;

    const maxX = Math.max(0, (scaledWidth - SCREEN_WIDTH) / 2);
    const maxY = Math.max(0, (scaledHeight - SCREEN_HEIGHT) / 2);

    return { x: maxX, y: maxY };
  };

  // Clamp translation to keep image within bounds
  const clampTranslation = (
    x: number,
    y: number,
    currentScale: number
  ): { x: number; y: number } => {
    'worklet';
    const max = getMaxTranslation(currentScale);
    return {
      x: Math.max(-max.x, Math.min(max.x, x)),
      y: Math.max(-max.y, Math.min(max.y, y)),
    };
  };

  // Pinch gesture for zooming
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, savedScale.value * event.scale));
    })
    .onEnd(() => {
      // If zoomed out too much, snap back to min zoom
      if (scale.value < MIN_ZOOM) {
        scale.value = withSpring(MIN_ZOOM);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }

      // Clamp translation when zoom changes
      const clamped = clampTranslation(translateX.value, translateY.value, scale.value);
      translateX.value = withSpring(clamped.x);
      translateY.value = withSpring(clamped.y);

      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Pan gesture for moving the image
  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      if (scale.value > MIN_ZOOM) {
        const newX = savedTranslateX.value + event.translationX;
        const newY = savedTranslateY.value + event.translationY;
        const clamped = clampTranslation(newX, newY, scale.value);
        translateX.value = clamped.x;
        translateY.value = clamped.y;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Double tap to zoom in/out
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((event) => {
      if (scale.value > MIN_ZOOM) {
        // Zoom out
        scale.value = withSpring(MIN_ZOOM);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedScale.value = MIN_ZOOM;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        // Zoom in to 2x at tap location
        const newScale = 2;
        scale.value = withSpring(newScale);
        savedScale.value = newScale;

        // Center zoom on tap location
        const focalX = event.x - SCREEN_WIDTH / 2;
        const focalY = event.y - SCREEN_HEIGHT / 2;

        const newX = -focalX * (newScale - 1);
        const newY = -focalY * (newScale - 1);

        const clamped = clampTranslation(newX, newY, newScale);
        translateX.value = withSpring(clamped.x);
        translateY.value = withSpring(clamped.y);
        savedTranslateX.value = clamped.x;
        savedTranslateY.value = clamped.y;
      }
    });

  // Combine gestures
  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    Gesture.Exclusive(doubleTapGesture, panGesture)
  );

  // Animated style for the image
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Show error state
  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Failed to load receipt image</Text>
        <Text style={styles.errorSubtext}>The image may be corrupted or missing</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading receipt...</Text>
        </View>
      )}

      {/* Image with gestures */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.imageContainer, animatedStyle]}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.flex1,
    backgroundColor: colors.shadow,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    ...commonStyles.flexCenter,
    backgroundColor: colors.shadow,
  },
  loadingText: {
    ...textStyles.body,
    color: colors.textInverse,
    marginTop: spacing.md,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  errorContainer: {
    ...commonStyles.flex1,
    ...commonStyles.flexCenter,
    backgroundColor: colors.shadow,
    padding: spacing.xl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  errorText: {
    ...textStyles.h5,
    color: colors.textInverse,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  errorSubtext: {
    ...textStyles.body,
    color: colors.gray400,
    textAlign: 'center',
  },
});
