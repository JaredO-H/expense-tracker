/**
 * Mock for react-native-reanimated
 */

import { View, Text, Image, ScrollView } from 'react-native';

const Reanimated = {
  default: {
    View,
    Text,
    Image,
    ScrollView,
    createAnimatedComponent: (component: any) => component,
  },
  View,
  Text,
  Image,
  ScrollView,
  createAnimatedComponent: (component: any) => component,
  useSharedValue: (value: any) => ({ value }),
  useAnimatedStyle: (callback: () => any) => callback(),
  useAnimatedGestureHandler: (handlers: any) => handlers,
  useAnimatedScrollHandler: (handler: any) => handler,
  useDerivedValue: (callback: () => any) => ({ value: callback() }),
  useAnimatedReaction: jest.fn(),
  useAnimatedRef: () => ({ current: null }),
  useAnimatedProps: (callback: () => any) => callback(),
  withTiming: (value: any) => value,
  withSpring: (value: any) => value,
  withDecay: (config: any) => config,
  withSequence: (...animations: any[]) => animations[0],
  withDelay: (_delay: number, animation: any) => animation,
  withRepeat: (animation: any) => animation,
  cancelAnimation: jest.fn(),
  runOnJS: (fn: (...args: any[]) => any) => fn,
  runOnUI: (fn: (...args: any[]) => any) => fn,
  Easing: {
    linear: (x: number) => x,
    ease: (x: number) => x,
    quad: (x: number) => x,
    cubic: (x: number) => x,
    bezier: () => (x: number) => x,
    in: (easing: (x: number) => number) => easing,
    out: (easing: (x: number) => number) => easing,
    inOut: (easing: (x: number) => number) => easing,
  },
  Extrapolate: {
    CLAMP: 'clamp',
    EXTEND: 'extend',
    IDENTITY: 'identity',
  },
  interpolate: (_value: number, _input: number[], output: number[]) => output[0],
  Extrapolation: {
    CLAMP: 'clamp',
    EXTEND: 'extend',
    IDENTITY: 'identity',
  },
};

export default Reanimated;

export const {
  View: AnimatedView,
  Text: AnimatedText,
  Image: AnimatedImage,
  ScrollView: AnimatedScrollView,
  createAnimatedComponent,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  useAnimatedScrollHandler,
  useDerivedValue,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedProps,
  withTiming,
  withSpring,
  withDecay,
  withSequence,
  withDelay,
  withRepeat,
  cancelAnimation,
  runOnJS,
  runOnUI,
  Easing,
  Extrapolate,
  interpolate,
  Extrapolation,
} = Reanimated;
