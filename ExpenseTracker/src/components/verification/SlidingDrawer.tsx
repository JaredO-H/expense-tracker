/**
 * SlidingDrawer Component
 * Draggable bottom sheet overlay with snap points for data editing
 */

import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadows } from '../../styles';
import { useTheme } from '../../contexts/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SlidingDrawerProps {
  children: React.ReactNode;
  snapPoints: number[]; // [0.25, 0.5, 0.9] of screen height
  initialSnapPoint: number; // Index into snapPoints array
  onClose?: () => void;
}

export const SlidingDrawer: React.FC<SlidingDrawerProps> = ({
  children,
  snapPoints = [0.25, 0.5, 0.9],
  initialSnapPoint = 1,
  onClose,
}) => {
  const { colors, isDarkMode } = useTheme();

  // Convert snap points from percentages to actual pixel values
  const snapPointsInPixels = snapPoints.map(point => SCREEN_HEIGHT * (1 - point));

  // Initialize drawer position to initial snap point
  const translateY = useSharedValue(snapPointsInPixels[initialSnapPoint]);
  const startY = useSharedValue(0);

  // Find closest snap point based on current position and velocity
  const findClosestSnapPoint = (currentY: number, velocity: number): number => {
    'worklet';

    // If velocity is strong, predict where drawer will land
    if (Math.abs(velocity) > 500) {
      const predictedY = currentY + velocity * 0.1;

      // Find closest snap point to predicted position
      let closest = snapPointsInPixels[0];
      let minDistance = Math.abs(predictedY - closest);

      for (const snapPoint of snapPointsInPixels) {
        const distance = Math.abs(predictedY - snapPoint);
        if (distance < minDistance) {
          minDistance = distance;
          closest = snapPoint;
        }
      }
      return closest;
    }

    // Otherwise, snap to nearest point based on current position
    let closest = snapPointsInPixels[0];
    let minDistance = Math.abs(currentY - closest);

    for (const snapPoint of snapPointsInPixels) {
      const distance = Math.abs(currentY - snapPoint);
      if (distance < minDistance) {
        minDistance = distance;
        closest = snapPoint;
      }
    }
    return closest;
  };

  // Pan gesture handler for dragging the drawer
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate(event => {
      // Calculate new position, clamped within bounds
      const newY = startY.value + event.translationY;
      const minY = snapPointsInPixels[snapPointsInPixels.length - 1]; // Most expanded
      const maxY = snapPointsInPixels[0]; // Most collapsed

      translateY.value = Math.max(minY, Math.min(maxY, newY));
    })
    .onEnd(event => {
      // Snap to closest point with spring animation
      const snapPoint = findClosestSnapPoint(translateY.value, event.velocityY);

      translateY.value = withSpring(snapPoint, {
        damping: 20,
        stiffness: 200,
        mass: 1,
      });
    });

  // Animated style for drawer position
  const animatedDrawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Animated style for backdrop opacity
  const animatedBackdropStyle = useAnimatedStyle(() => {
    // Calculate opacity based on drawer position (0 at top, 0.5 at bottom)
    const progress =
      (translateY.value - snapPointsInPixels[snapPointsInPixels.length - 1]) /
      (snapPointsInPixels[0] - snapPointsInPixels[snapPointsInPixels.length - 1]);

    return {
      opacity: 0.5 * (1 - progress),
    };
  });

  // Handle backdrop tap to close
  const handleBackdropPress = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, { backgroundColor: colors.shadow }, animatedBackdropStyle]}
        pointerEvents={onClose ? 'auto' : 'none'}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={handleBackdropPress}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Drawer */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.drawer,
            { backgroundColor: isDarkMode ? colors.backgroundSecondary : colors.whiteOverlay80 },
            animatedDrawerStyle,
          ]}>
          {/* Drag handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.gray300 }]} />
          </View>

          {/* Drawer content */}
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </GestureDetector>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.shadow,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: colors.whiteOverlay80,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    ...shadows.xl,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray300,
    borderRadius: borderRadius.round,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
});
