/**
 * Animation Utilities - Neo-Memphis Edition
 * Reusable animation functions for delightful micro-interactions
 */

import { Animated, Easing } from 'react-native';

/**
 * Fade In Animation
 * Elements smoothly appear with opacity transition
 */
export const fadeIn = (
  animatedValue: Animated.Value,
  duration: number = 600,
  delay: number = 0
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    delay,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  });
};

/**
 * Fade Out Animation
 */
export const fadeOut = (
  animatedValue: Animated.Value,
  duration: number = 400
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing: Easing.in(Easing.ease),
    useNativeDriver: true,
  });
};

/**
 * Slide Up Animation
 * Elements slide up from below while fading in
 */
export const slideUp = (
  animatedValue: Animated.Value,
  distance: number = 50,
  duration: number = 600,
  delay: number = 0
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    delay,
    easing: Easing.out(Easing.bezier(0.25, 0.1, 0.25, 1)),
    useNativeDriver: true,
  });
};

/**
 * Scale Animation
 * Elements scale from small to normal size
 */
export const scale = (
  animatedValue: Animated.Value,
  toValue: number = 1,
  duration: number = 400,
  delay: number = 0
): Animated.CompositeAnimation => {
  return Animated.spring(animatedValue, {
    toValue,
    friction: 6,
    tension: 40,
    delay,
    useNativeDriver: true,
  });
};

/**
 * Press Animation
 * Button press feedback with scale down/up
 */
export const pressAnimation = (
  animatedValue: Animated.Value
): Animated.CompositeAnimation => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 0.95,
      duration: 100,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }),
    Animated.spring(animatedValue, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }),
  ]);
};

/**
 * Bounce Animation
 * Playful bounce effect
 */
export const bounce = (
  animatedValue: Animated.Value,
  duration: number = 800
): Animated.CompositeAnimation => {
  return Animated.spring(animatedValue, {
    toValue: 1,
    friction: 3,
    tension: 40,
    useNativeDriver: true,
  });
};

/**
 * Rotate Animation
 * Continuous rotation
 */
export const rotate = (
  animatedValue: Animated.Value,
  duration: number = 1000,
  toValue: number = 1
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing: Easing.linear,
    useNativeDriver: true,
  });
};

/**
 * Shake Animation
 * Error or attention-grabbing shake
 */
export const shake = (
  animatedValue: Animated.Value
): Animated.CompositeAnimation => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: -10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 50,
      useNativeDriver: true,
    }),
  ]);
};

/**
 * Staggered List Animation
 * Create staggered animations for list items
 */
export const staggeredFadeIn = (
  animatedValues: Animated.Value[],
  staggerDelay: number = 100,
  duration: number = 600
): Animated.CompositeAnimation => {
  const animations = animatedValues.map((value, index) =>
    fadeIn(value, duration, index * staggerDelay)
  );
  return Animated.parallel(animations);
};

/**
 * Pulse Animation
 * Subtle pulse for attention
 */
export const pulse = (
  animatedValue: Animated.Value,
  minScale: number = 1,
  maxScale: number = 1.05,
  duration: number = 1000
): Animated.CompositeAnimation => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: maxScale,
        duration: duration / 2,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: minScale,
        duration: duration / 2,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  );
};

/**
 * Float Animation
 * Gentle floating motion for background decorations
 */
export const float = (
  animatedValue: Animated.Value,
  distance: number = 10,
  duration: number = 3000
): Animated.CompositeAnimation => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: distance,
        duration: duration / 2,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: duration / 2,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ])
  );
};

/**
 * Success Checkmark Animation
 * Scale in with bounce for success feedback
 */
export const successCheckmark = (
  scaleValue: Animated.Value,
  opacityValue: Animated.Value
): Animated.CompositeAnimation => {
  return Animated.parallel([
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    }),
    Animated.timing(opacityValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }),
  ]);
};

/**
 * Card Entrance Animation
 * Combined fade in and slide up for cards
 */
export const cardEntrance = (
  opacityValue: Animated.Value,
  translateValue: Animated.Value,
  delay: number = 0
): Animated.CompositeAnimation => {
  return Animated.parallel([
    fadeIn(opacityValue, 600, delay),
    slideUp(translateValue, 30, 600, delay),
  ]);
};

/**
 * Create animated value with initial value
 */
export const createAnimatedValue = (initialValue: number = 0): Animated.Value => {
  return new Animated.Value(initialValue);
};

/**
 * Create multiple animated values
 */
export const createAnimatedValues = (
  count: number,
  initialValue: number = 0
): Animated.Value[] => {
  return Array.from({ length: count }, () => new Animated.Value(initialValue));
};
