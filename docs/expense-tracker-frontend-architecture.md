# Business Expense Tracker Frontend Architecture Document

## Template and Framework Selection

Based on the project requirements analysis and technical decisions summary, this React Native application follows an Android-first development strategy with cross-platform deployment. The architecture addresses the critical requirements of offline functionality, AI service integration, and device-only storage.

### Framework Selection Rationale

**React Native** was selected for this mobile-first expense tracking application based on:
- Cross-platform development efficiency (single codebase for iOS and Android)
- Strong ecosystem support for camera, file system, and database operations
- Excellent offline capabilities with local storage integration
- Native performance for camera capture and image processing workflows
- Mature AI service integration patterns via HTTP clients

### Development Strategy

**Android-First Approach**: Initial development and testing on Android platform with iOS compatibility maintained through React Native's cross-platform capabilities. This approach aligns with the Windows development environment and allows for cloud-based iOS builds when needed.

### Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-15 | 1.0 | Initial frontend architecture | Architect Winston |

## Frontend Tech Stack

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Framework | React Native | 0.73.x | Mobile app framework | Cross-platform development with native performance |
| Navigation | React Navigation | 6.x | Screen navigation and routing | Mature navigation solution with gesture support |
| State Management | Zustand | 4.x | Global state management | Lightweight, TypeScript-friendly state management |
| Database | react-native-sqlite-storage | 6.x | Local database operations | Reliable SQLite integration for expense data |
| Camera | react-native-vision-camera | 3.x | Camera capture functionality | High-performance camera with advanced features |
| Storage | @react-native-async-storage | 1.x | Settings and preferences | Secure local storage for user preferences |
| HTTP Client | Axios | 1.x | AI service API integration | Robust HTTP client with interceptors |
| Image Processing | react-native-image-resizer | 3.x | Image compression and optimization | Reduce image size for API transmission |
| File System | react-native-fs | 2.x | Receipt image file management | File operations for local image storage |
| Encryption | react-native-keychain | 8.x | Secure API key storage | Secure storage for AI service credentials |
| PDF Generation | react-native-pdf-lib | 1.x | PDF export functionality | Create PDF reports with embedded images |
| Excel Export | react-native-xlsx | 0.x | Excel file generation | Create formatted Excel exports |
| CSV Export | papaparse | 5.x | CSV file generation | Reliable CSV formatting and generation |
| ML Kit OCR | @react-native-ml-kit/text-recognition | 1.x | Offline text recognition | On-device OCR for offline processing |
| Icons | react-native-vector-icons | 10.x | UI iconography | Comprehensive icon library |
| Animations | react-native-reanimated | 3.x | Drawer animations and gestures | High-performance animations for sliding drawer |
| Gesture Handling | react-native-gesture-handler | 2.x | Touch gestures for drawer interface | Advanced gesture recognition |
| Date Handling | date-fns | 2.x | Date formatting and manipulation | Lightweight date utility library |
| Form Validation | react-hook-form | 7.x | Form handling and validation | Efficient form management with validation |

## Project Structure

```
expense-tracker/
├── android/                     # Android-specific configurations
├── ios/                         # iOS-specific configurations  
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── common/             # Generic components (buttons, inputs)
│   │   ├── camera/             # Camera-specific components
│   │   ├── drawer/             # Sliding drawer components
│   │   ├── forms/              # Form components
│   │   └── navigation/         # Navigation components
│   ├── screens/                # Screen components
│   │   ├── camera/             # Receipt capture screens
│   │   ├── expenses/           # Expense management screens
│   │   ├── trips/              # Trip management screens
│   │   ├── settings/           # Settings and configuration
│   │   └── exports/            # Export and reporting screens
│   ├── services/               # Business logic and API services
│   │   ├── database/           # SQLite database operations
│   │   ├── storage/            # File system operations
│   │   ├── ai/                 # AI service integrations
│   │   ├── camera/             # Camera service layer
│   │   ├── export/             # Export generation services
│   │   └── queue/              # Background processing queue
│   ├── stores/                 # Zustand state management
│   │   ├── expenseStore.ts     # Expense state management
│   │   ├── tripStore.ts        # Trip state management
│   │   ├── settingsStore.ts    # App settings state
│   │   └── queueStore.ts       # Processing queue state
│   ├── types/                  # TypeScript type definitions
│   │   ├── expense.ts          # Expense-related types
│   │   ├── trip.ts             # Trip-related types
│   │   ├── ai.ts               # AI service types
│   │   └── export.ts           # Export-related types
│   ├── utils/                  # Utility functions
│   │   ├── database.ts         # Database helper functions
│   │   ├── imageProcessing.ts  # Image manipulation utilities
│   │   ├── validation.ts       # Data validation functions
│   │   ├── formatting.ts       # Data formatting utilities
│   │   └── encryption.ts       # Security utilities
│   ├── config/                 # Configuration files
│   │   ├── database.ts         # Database configuration
│   │   ├── ai-services.ts      # AI service configurations
│   │   └── constants.ts        # App constants
│   └── assets/                 # Static assets
│       ├── images/             # App icons and images
│       └── fonts/              # Custom fonts if needed
├── __tests__/                  # Test files
├── docs/                       # Documentation
├── package.json
├── metro.config.js             # Metro bundler configuration
├── babel.config.js             # Babel configuration
└── tsconfig.json              # TypeScript configuration
```

## Component Standards

### Component Template

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ComponentNameProps {
  // Define props with TypeScript interfaces
  title: string;
  onPress?: () => void;
  disabled?: boolean;
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  title,
  onPress,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Component styles using 8pt grid system
    padding: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ComponentName;
```

### Naming Conventions

**Component Files**: PascalCase with descriptive names
- `CameraCapture.tsx` - Main camera interface component
- `SlidingDrawer.tsx` - Verification drawer component  
- `ExpenseCard.tsx` - Individual expense display component
- `TripSummary.tsx` - Trip overview component

**Service Files**: camelCase with service suffix
- `databaseService.ts` - Database operations
- `aiService.ts` - AI provider integrations
- `cameraService.ts` - Camera functionality
- `exportService.ts` - Report generation

**Store Files**: camelCase with Store suffix
- `expenseStore.ts` - Expense state management
- `tripStore.ts` - Trip state management
- `settingsStore.ts` - App settings

**Utility Functions**: camelCase with descriptive names
- `formatCurrency.ts` - Currency formatting utilities
- `validateExpense.ts` - Expense data validation
- `processImage.ts` - Image processing functions

## State Management

### Store Structure

```
stores/
├── expenseStore.ts          # Expense CRUD and processing state
├── tripStore.ts             # Trip management and organization
├── settingsStore.ts         # User preferences and AI configuration
├── queueStore.ts            # Background processing queue
└── index.ts                 # Store composition and persistence
```

### State Management Template

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  loadExpenses: () => Promise<void>;
  processReceipt: (imageUri: string) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      expenses: [],
      isLoading: false,
      error: null,

      addExpense: (expense) => 
        set((state) => ({ 
          expenses: [...state.expenses, expense] 
        })),

      updateExpense: (id, updates) =>
        set((state) => ({
          expenses: state.expenses.map(expense =>
            expense.id === id ? { ...expense, ...updates } : expense
          )
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter(expense => expense.id !== id)
        })),

      loadExpenses: async () => {
        set({ isLoading: true, error: null });
        try {
          // Database loading logic
          const expenses = await databaseService.getExpenses();
          set({ expenses, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      processReceipt: async (imageUri) => {
        // AI processing logic with queue management
      },
    }),
    {
      name: 'expense-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        expenses: state.expenses 
      }),
    }
  )
);
```

## API Integration

### Service Template

```typescript
import axios, { AxiosInstance } from 'axios';
import { AIService, ReceiptData, ProcessingResult } from '../types/ai';

export class AIServiceClient {
  private client: AxiosInstance;
  private apiKey: string;
  private serviceType: AIService;

  constructor(serviceType: AIService, apiKey: string) {
    this.serviceType = serviceType;
    this.apiKey = apiKey;
    this.client = this.createClient();
  }

  private createClient(): AxiosInstance {
    const baseURLs = {
      openai: 'https://api.openai.com/v1',
      anthropic: 'https://api.anthropic.com/v1',
      gemini: 'https://generativelanguage.googleapis.com/v1',
    };

    return axios.create({
      baseURL: baseURLs[this.serviceType],
      timeout: 30000,
      headers: this.getAuthHeaders(),
    });
  }

  private getAuthHeaders() {
    switch (this.serviceType) {
      case 'openai':
        return { 'Authorization': `Bearer ${this.apiKey}` };
      case 'anthropic':
        return { 
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        };
      case 'gemini':
        return {};
      default:
        return {};
    }
  }

  async processReceipt(imageBase64: string): Promise<ProcessingResult> {
    try {
      const response = await this.client.post(
        this.getEndpoint(),
        this.buildPayload(imageBase64)
      );
      
      return this.parseResponse(response.data);
    } catch (error) {
      throw this.handleAPIError(error);
    }
  }

  private getEndpoint(): string {
    const endpoints = {
      openai: '/chat/completions',
      anthropic: '/messages',
      gemini: '/models/gemini-pro-vision:generateContent',
    };
    return endpoints[this.serviceType];
  }

  private buildPayload(imageBase64: string) {
    const prompt = `Extract expense data from this receipt image. Return JSON with:
    {
      "merchant": "business name",
      "amount": "total amount as number",
      "tax_amount": "tax amount as number",
      "tax_type": "VAT/GST/Sales Tax/etc",
      "tax_rate": "tax percentage",
      "date": "YYYY-MM-DD",
      "category": "meal/transport/accommodation/office/other"
    }`;

    switch (this.serviceType) {
      case 'openai':
        return {
          model: 'gpt-4-vision-preview',
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` }}
            ]
          }],
          max_tokens: 1000
        };
      
      case 'anthropic':
        return {
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image', source: { 
                type: 'base64', 
                media_type: 'image/jpeg',
                data: imageBase64 
              }}
            ]
          }]
        };

      case 'gemini':
        return {
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: 'image/jpeg', data: imageBase64 }}
            ]
          }]
        };
      
      default:
        throw new Error(`Unsupported AI service: ${this.serviceType}`);
    }
  }

  private parseResponse(responseData: any): ProcessingResult {
    // Service-specific response parsing logic
    let extractedText: string;
    
    switch (this.serviceType) {
      case 'openai':
        extractedText = responseData.choices[0]?.message?.content || '';
        break;
      case 'anthropic':
        extractedText = responseData.content[0]?.text || '';
        break;
      case 'gemini':
        extractedText = responseData.candidates[0]?.content?.parts[0]?.text || '';
        break;
      default:
        throw new Error(`Unsupported service for parsing: ${this.serviceType}`);
    }

    try {
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const extractedData = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        data: extractedData,
        confidence: 0.9, // High confidence for AI services
        source: this.serviceType
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse AI response: ${error.message}`,
        source: this.serviceType
      };
    }
  }

  private handleAPIError(error: any): Error {
    if (error.response) {
      // API returned error response
      const status = error.response.status;
      const message = error.response.data?.error?.message || 'API request failed';
      
      if (status === 429) {
        return new Error('Rate limit exceeded. Please try again later.');
      } else if (status === 401) {
        return new Error('Invalid API key. Please check your configuration.');
      } else if (status >= 500) {
        return new Error('AI service temporarily unavailable. Try offline processing.');
      }
      
      return new Error(`AI service error: ${message}`);
    } else if (error.request) {
      // Network error
      return new Error('Network error. Check your connection or try offline processing.');
    } else {
      return new Error(`Processing error: ${error.message}`);
    }
  }
}

// Factory function for creating AI service clients
export const createAIService = (serviceType: AIService, apiKey: string): AIServiceClient => {
  return new AIServiceClient(serviceType, apiKey);
};
```

### API Client Configuration

```typescript
// src/config/ai-services.ts
export const AI_SERVICE_CONFIG = {
  openai: {
    name: 'OpenAI GPT-4 Vision',
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4-vision-preview',
    maxTokens: 1000,
    timeout: 30000,
  },
  anthropic: {
    name: 'Claude 3 Sonnet',
    baseURL: 'https://api.anthropic.com/v1',
    model: 'claude-3-sonnet-20240229',
    maxTokens: 1000,
    timeout: 30000,
  },
  gemini: {
    name: 'Google Gemini Pro Vision',
    baseURL: 'https://generativelanguage.googleapis.com/v1',
    model: 'gemini-pro-vision',
    maxTokens: 1000,
    timeout: 30000,
  },
};
```

## Routing

### Route Configuration

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';

// Screen imports
import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/camera/CameraScreen';
import VerificationScreen from '../screens/camera/VerificationScreen';
import TripsScreen from '../screens/trips/TripsScreen';
import TripDetailScreen from '../screens/trips/TripDetailScreen';
import ExpensesScreen from '../screens/expenses/ExpensesScreen';
import ExpenseDetailScreen from '../screens/expenses/ExpenseDetailScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

// Type definitions for navigation
export type RootStackParamList = {
  MainTabs: undefined;
  Camera: undefined;
  Verification: { imageUri: string };
  ExpenseDetail: { expenseId: string };
  TripDetail: { tripId: string };
};

export type TabParamList = {
  Home: undefined;
  Trips: undefined;
  Expenses: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Main tab navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Trips':
              iconName = 'map-pin';
              break;
            case 'Expenses':
              iconName = 'list';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Trips" component={TripsScreen} />
      <Tab.Screen name="Expenses" component={ExpensesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

// Root navigator with protected routes
export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen 
          name="Camera" 
          component={CameraScreen}
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen 
          name="Verification" 
          component={VerificationScreen}
          options={{
            headerShown: true,
            title: 'Verify Receipt Data',
            headerBackTitle: 'Cancel',
          }}
        />
        <Stack.Screen 
          name="ExpenseDetail" 
          component={ExpenseDetailScreen}
          options={{
            headerShown: true,
            title: 'Expense Details',
          }}
        />
        <Stack.Screen 
          name="TripDetail" 
          component={TripDetailScreen}
          options={{
            headerShown: true,
            title: 'Trip Details',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

## Styling Guidelines

### Styling Approach

**React Native StyleSheet** approach with organized style management, theme support, and responsive design patterns. Styles follow the 8pt grid system established in the UI/UX specification.

### Global Theme Variables

```typescript
// src/styles/theme.ts
export const theme = {
  colors: {
    primary: '#2563EB',
    secondary: '#64748B', 
    accent: '#10B981',
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    background: {
      primary: '#FFFFFF',
      secondary: '#F8FAFC',
      tertiary: '#E2E8F0',
    },
    text: {
      primary: '#1E293B',
      secondary: '#475569',
      inverse: '#FFFFFF',
    },
    border: '#E2E8F0',
  },
  darkColors: {
    primary: '#3B82F6',
    secondary: '#94A3B8',
    accent: '#34D399', 
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    background: {
      primary: '#0F172A',
      secondary: '#1E293B',
      tertiary: '#334155',
    },
    text: {
      primary: '#F1F5F9',
      secondary: '#CBD5E1',
      inverse: '#0F172A',
    },
    border: '#475569',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
    xxxxl: 64,
  },
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 34,
    },
    h2: {
      fontSize: 22,
      fontWeight: '600',
      lineHeight: 29,
    },
    h3: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 25,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    small: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  shadows: {
    sm: {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    md: {
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    lg: {
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
  },
};

export type Theme = typeof theme;
```

## Testing Requirements

### Component Test Template

```typescript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SlidingDrawer } from '../SlidingDrawer';
import { mockReceiptData } from '../../__mocks__/receiptData';

// Mock external dependencies
jest.mock('react-native-reanimated', () => 
  require('react-native-reanimated/mock'));
jest.mock('react-native-gesture-handler', () => 
  require('react-native-gesture-handler/jestSetup'));

describe('SlidingDrawer Component', () => {
  const defaultProps = {
    receiptData: mockReceiptData,
    visible: true,
    onSave: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders receipt data correctly', () => {
    const { getByText, getByDisplayValue } = render(
      <SlidingDrawer {...defaultProps} />
    );

    expect(getByDisplayValue(mockReceiptData.merchant)).toBeTruthy();
    expect(getByDisplayValue(mockReceiptData.amount.toString())).toBeTruthy();
    expect(getByText('AI Extracted')).toBeTruthy();
  });

  it('handles drawer positioning gestures', async () => {
    const { getByTestId } = render(<SlidingDrawer {...defaultProps} />);
    
    const drawerHandle = getByTestId('drawer-handle');
    
    // Simulate drag gesture
    fireEvent(drawerHandle, 'onPanGestureEvent', {
      nativeEvent: { translationY: -100 }
    });

    await waitFor(() => {
      // Verify drawer position changed
      expect(getByTestId('drawer-container')).toBeTruthy();
    });
  });

  it('validates form data before saving', async () => {
    const { getByText, getByDisplayValue } = render(
      <SlidingDrawer {...defaultProps} />
    );

    // Clear required field
    const merchantInput = getByDisplayValue(mockReceiptData.merchant);
    fireEvent.changeText(merchantInput, '');

    // Attempt to save
    const saveButton = getByText('Save Expense');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(getByText('Merchant name is required')).toBeTruthy();
    });

    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });

  it('calls onSave with updated data', async () => {
    const { getByText, getByDisplayValue } = render(
      <SlidingDrawer {...defaultProps} />
    );

    // Modify merchant name
    const merchantInput = getByDisplayValue(mockReceiptData.merchant);
    fireEvent.changeText(merchantInput, 'Updated Merchant');

    // Save changes
    const saveButton = getByText('Save Expense');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          merchant: 'Updated Merchant'
        })
      );
    });
  });

  it('handles AI processing states correctly', () => {
    const processingProps = {
      ...defaultProps,
      receiptData: { ...mockReceiptData, isProcessing: true }
    };

    const { getByText } = render(<SlidingDrawer {...processingProps} />);
    
    expect(getByText('Processing...')).toBeTruthy();
    expect(getByText('AI Service Processing')).toBeTruthy();
  });
});
```

### Testing Best Practices

1. **Unit Tests**: Test individual components in isolation with mocked dependencies
2. **Integration Tests**: Test component interactions and data flow between screens
3. **E2E Tests**: Test critical user flows using Detox or similar framework
4. **Snapshot Tests**: Maintain visual consistency with Jest snapshot testing
5. **Performance Tests**: Test gesture responsiveness and animation performance
6. **Mock External Dependencies**: Mock AI services, camera, and file system for consistent testing

## Environment Configuration

### Development Environment Variables

```typescript
// src/config/environment.ts
import { Platform } from 'react-native';

export interface Environment {
  API_TIMEOUT: number;
  MAX_IMAGE_SIZE: number;
  SUPPORTED_IMAGE_FORMATS: string[];
  DEFAULT_CURRENCY: string;
  MAX_EXPENSES_PER_TRIP: number;
  OFFLINE_QUEUE_MAX_SIZE: number;
  AI_RETRY_ATTEMPTS: number;
  DATABASE_VERSION: number;
}

const development: Environment = {
  API_TIMEOUT: 30000,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png'],
  DEFAULT_CURRENCY: 'USD',
  MAX_EXPENSES_PER_TRIP: 200,
  OFFLINE_QUEUE_MAX_SIZE: 50,
  AI_RETRY_ATTEMPTS: 3,
  DATABASE_VERSION: 1,
};

const production: Environment = {
  ...development,
  API_TIMEOUT: 20000,
  AI_RETRY_ATTEMPTS: 2,
};

export const config = __DEV__ ? development : production;

// Platform-specific configurations
export const platformConfig = {
  android: {
    useMLKit: true,
    cameraFormat: 'jpeg',
    imageCompression: 0.8,
  },
  ios: {
    useMLKit: true,
    cameraFormat: 'jpeg', 
    imageCompression: 0.7,
  },
};

export const getCurrentPlatformConfig = () => {
  return Platform.OS === 'android' ? platformConfig.android : platformConfig.ios;
};
```

## Frontend Developer Standards

### Critical Coding Rules

1. **Type Safety**: All components must use TypeScript interfaces for props and state - no `any` types allowed
2. **Error Boundaries**: Wrap all AI service calls and camera operations in try-catch blocks with user-friendly error messages
3. **Offline Handling**: Every network-dependent feature must have offline fallback or clear offline state indication
4. **Memory Management**: Dispose of camera resources and large images properly to prevent memory leaks
5. **Security**: Never log API keys or sensitive data - use secure storage for all credentials
6. **Performance**: Use React.memo and useMemo for expensive operations like image processing
7. **Accessibility**: All interactive elements must have testID and accessibility labels
8. **State Management**: Use Zustand stores for global state, local useState only for component-specific UI state
9. **Image Handling**: Always compress images before AI processing and validate file sizes before storage
10. **Database Operations**: All SQLite operations must be wrapped in transactions and include error handling

### File Organization Rules

- **One component per file** with matching filename and component name
- **Services in services/ folder** - never mix UI components with business logic
- **Types in types/ folder** - shared interfaces accessible to all components
- **Utilities in utils/ folder** - pure functions only, no side effects
- **Stores in stores/ folder** - one store per domain (expenses, trips, settings, queue)

### React Native Specific Rules

- **Use React Native components** - never import from 'react-dom' or web-specific libraries
- **Handle platform differences** with Platform.select() when needed
- **Use proper navigation** - never manipulate navigation state directly
- **Test on both platforms** - Android-first development but iOS compatibility required
- **Handle permissions properly** - always check and request permissions before camera/storage access

### Performance Rules

- **Lazy load screens** using React.lazy() for better app startup time
- **Optimize images** before displaying or processing with AI services
- **Use FlatList** for expense lists with proper keyExtractor and getItemLayout
- **Minimize re-renders** with proper dependency arrays in useEffect and useMemo
- **Background processing** for AI operations to keep UI responsive

### Security Rules

- **Encrypt sensitive data** using react-native-keychain for API keys
- **Validate all inputs** before saving to database or sending to AI services
- **Sanitize file paths** to prevent directory traversal attacks
- **Handle API errors** without exposing internal implementation details
- **Clear sensitive data** from memory after use (especially images and API responses)