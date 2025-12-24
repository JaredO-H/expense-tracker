/**
 * Geometric Decorations
 * Memphis-style geometric shapes and patterns
 * Add visual interest and playfulness to the interface
 */

import { ViewStyle } from 'react-native';
import { colors } from './colors';

// Geometric shape styles that can be used as decorative elements
export const geometricShapes = {
  // Circles
  circleSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent1,
  } as ViewStyle,

  circleMedium: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
  } as ViewStyle,

  circleLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
  } as ViewStyle,

  // Squares with rotation potential
  squareSmall: {
    width: 20,
    height: 20,
    backgroundColor: colors.accent3,
  } as ViewStyle,

  squareMedium: {
    width: 40,
    height: 40,
    backgroundColor: colors.accent2,
    transform: [{ rotate: '15deg' }],
  } as ViewStyle,

  squareLarge: {
    width: 60,
    height: 60,
    backgroundColor: colors.accent4,
    transform: [{ rotate: '45deg' }],
  } as ViewStyle,

  // Triangles (using borderWidth trick)
  triangleUp: {
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 25,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.accent1,
  } as ViewStyle,

  triangleDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderTopWidth: 25,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.secondary,
  } as ViewStyle,

  // Pills (rounded rectangles)
  pillHorizontal: {
    width: 60,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent2,
  } as ViewStyle,

  pillVertical: {
    width: 20,
    height: 60,
    borderRadius: 10,
    backgroundColor: colors.accent3,
  } as ViewStyle,

  // Donuts (hollow circles)
  donutSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 4,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  } as ViewStyle,

  donutMedium: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 6,
    borderColor: colors.secondary,
    backgroundColor: 'transparent',
  } as ViewStyle,
} as const;

// Pattern backgrounds for categories
export const categoryPatterns = [
  {
    id: 'pattern1',
    backgroundColor: colors.pattern1,
    borderWidth: 3,
    borderColor: colors.border,
    borderStyle: 'solid' as ViewStyle['borderStyle'],
  },
  {
    id: 'pattern2',
    backgroundColor: colors.pattern2,
    borderWidth: 3,
    borderColor: colors.border,
    borderStyle: 'dashed' as ViewStyle['borderStyle'],
  },
  {
    id: 'pattern3',
    backgroundColor: colors.pattern3,
    borderWidth: 0,
  },
  {
    id: 'pattern4',
    backgroundColor: colors.pattern4,
    borderWidth: 3,
    borderColor: colors.border,
    borderStyle: 'solid' as ViewStyle['borderStyle'],
  },
  {
    id: 'pattern5',
    backgroundColor: colors.pattern5,
    borderWidth: 3,
    borderColor: colors.border,
    borderStyle: 'dotted' as ViewStyle['borderStyle'],
  },
  {
    id: 'pattern6',
    backgroundColor: colors.pattern6,
    borderWidth: 3,
    borderColor: colors.border,
    borderStyle: 'solid' as ViewStyle['borderStyle'],
  },
  {
    id: 'pattern7',
    backgroundColor: colors.pattern7,
    borderWidth: 0,
  },
  {
    id: 'pattern8',
    backgroundColor: colors.pattern8,
    borderWidth: 3,
    borderColor: colors.border,
    borderStyle: 'dashed' as ViewStyle['borderStyle'],
  },
];

// Get pattern by index (cycles through patterns)
export const getPatternByIndex = (index: number) => {
  return categoryPatterns[index % categoryPatterns.length];
};

// Get pattern by category name (deterministic based on string hash)
export const getPatternByName = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return categoryPatterns[Math.abs(hash) % categoryPatterns.length];
};

// Decorative corner elements
export const cornerDecorations = {
  topLeft: {
    position: 'absolute' as ViewStyle['position'],
    top: -10,
    left: -10,
  },
  topRight: {
    position: 'absolute' as ViewStyle['position'],
    top: -10,
    right: -10,
  },
  bottomLeft: {
    position: 'absolute' as ViewStyle['position'],
    bottom: -10,
    left: -10,
  },
  bottomRight: {
    position: 'absolute' as ViewStyle['position'],
    bottom: -10,
    right: -10,
  },
} as const;

// Memphis-style zigzag/squiggle line
export const decorativeLines = {
  zigzag: {
    borderBottomWidth: 3,
    borderBottomColor: colors.border,
    borderStyle: 'dashed' as ViewStyle['borderStyle'],
  },
  bold: {
    borderBottomWidth: 4,
    borderBottomColor: colors.primary,
    borderStyle: 'solid' as ViewStyle['borderStyle'],
  },
  dotted: {
    borderBottomWidth: 3,
    borderBottomColor: colors.secondary,
    borderStyle: 'dotted' as ViewStyle['borderStyle'],
  },
} as const;
