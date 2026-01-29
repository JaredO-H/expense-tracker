/**
 * Mock for react-native-gesture-handler
 */

import { View } from 'react-native';

export const GestureHandlerRootView = View;

export const State = {
  UNDETERMINED: 0,
  FAILED: 1,
  BEGAN: 2,
  CANCELLED: 3,
  ACTIVE: 4,
  END: 5,
};

export const Directions = {
  RIGHT: 1,
  LEFT: 2,
  UP: 4,
  DOWN: 8,
};

export class PanGestureHandler extends View {}
export class TapGestureHandler extends View {}
export class LongPressGestureHandler extends View {}
export class PinchGestureHandler extends View {}
export class RotationGestureHandler extends View {}
export class FlingGestureHandler extends View {}

export const Gesture = {
  Pan: jest.fn(() => ({
    onStart: jest.fn().mockReturnThis(),
    onUpdate: jest.fn().mockReturnThis(),
    onEnd: jest.fn().mockReturnThis(),
    onFinalize: jest.fn().mockReturnThis(),
    enabled: jest.fn().mockReturnThis(),
  })),
  Tap: jest.fn(() => ({
    onStart: jest.fn().mockReturnThis(),
    onEnd: jest.fn().mockReturnThis(),
    enabled: jest.fn().mockReturnThis(),
  })),
};

export const GestureDetector = View;

export default {
  GestureHandlerRootView,
  State,
  Directions,
  PanGestureHandler,
  TapGestureHandler,
  LongPressGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
  FlingGestureHandler,
  Gesture,
  GestureDetector,
};
