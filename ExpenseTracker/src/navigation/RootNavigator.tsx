/**
 * Root Navigator
 * Main stack navigator that wraps the tab navigator
 * Provides modal screens accessible from anywhere
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { ExpenseNavigator } from './ExpenseNavigator';
import { TripNavigator } from './TripNavigator';
import { HomeScreen } from '../screens/HomeScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { CreateExpenseScreen } from '../screens/expenses/CreateExpenseScreen';
import { TripDetailScreen } from '../screens/trips/TripDetailScreen';
import { AIServiceSettings } from '../screens/settings/AIServiceSettings';
import { AIServiceHelp } from '../screens/settings/AIServiceHelp';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { ProcessingStatusScreen } from '../screens/ProcessingStatusScreen';
import { ReceiptVerificationScreen } from '../screens/verification/ReceiptVerificationScreen';
import { ExportScreen } from '../screens/exports/ExportScreen';
import { GeneralSettingsScreen } from '../screens/settings/GeneralSettingsScreen';
import { colors } from '../styles';

export type RootStackParamList = {
  MainTabs: undefined;
  Camera: undefined;
  CreateExpense: { tripId?: number } | undefined;
  TripDetail: { tripId: number };
  ExportScreen: { tripId: number };
  GeneralSettings: undefined;
  AIServiceSettings: undefined;
  AIServiceHelp: undefined;
  ProcessingStatus: undefined;
  ReceiptVerification: { queueItemId: string };
};

export type AppTabParamList = {
  HomeTab: undefined;
  TripsTab: undefined;
  ExpensesTab: undefined;
  SettingsTab: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

// Bottom Tab Navigator
const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TripsTab"
        component={TripNavigator}
        options={{
          title: 'Trips',
          tabBarLabel: 'Trips',
          tabBarIcon: ({ color, size }) => (
            <Icon name="airplane" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ExpensesTab"
        component={ExpenseNavigator}
        options={{
          title: 'Expenses',
          tabBarLabel: 'Expenses',
          tabBarIcon: ({ color, size }) => (
            <Icon name="receipt" size={size} color={color} />
          ),
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.textInverse,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Icon name="settings" size={size} color={color} />
          ),
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.textInverse,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
    </Tab.Navigator>
  );
};

// Root Stack Navigator with Modals
export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{
            presentation: 'fullScreenModal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CreateExpense"
          component={CreateExpenseScreen}
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'Create Expense',
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: colors.textInverse,
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        />
        <Stack.Screen
          name="TripDetail"
          component={TripDetailScreen}
          options={{
            headerShown: true,
            headerTitle: 'Trip Details',
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: colors.textInverse,
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        />
        <Stack.Screen
          name="ExportScreen"
          component={ExportScreen}
          options={{
            headerShown: true,
            headerTitle: 'Export Trip',
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: colors.textInverse,
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        />
        <Stack.Screen
          name="GeneralSettings"
          component={GeneralSettingsScreen}
          options={{
            headerShown: true,
            headerTitle: 'General Settings',
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: colors.textInverse,
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        />
        <Stack.Screen
          name="AIServiceSettings"
          component={AIServiceSettings}
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'AI Service Settings',
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: colors.textInverse,
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        />
        <Stack.Screen
          name="AIServiceHelp"
          component={AIServiceHelp}
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'API Key Setup Guide',
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: colors.textInverse,
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        />
        <Stack.Screen
          name="ProcessingStatus"
          component={ProcessingStatusScreen}
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'Processing Status',
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: colors.textInverse,
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        />
        <Stack.Screen
          name="ReceiptVerification"
          component={ReceiptVerificationScreen}
          options={{
            presentation: 'fullScreenModal',
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
