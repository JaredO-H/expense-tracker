/**
 * Root Navigator
 * Main stack navigator that wraps the tab navigator
 * Provides modal screens accessible from anywhere
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ExpenseNavigator } from './ExpenseNavigator';
import { TripNavigator } from './TripNavigator';
import { HomeScreen } from '../screens/HomeScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { CreateExpenseScreen } from '../screens/expenses/CreateExpenseScreen';
import { TripDetailScreen } from '../screens/trips/TripDetailScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  Camera: undefined;
  CreateExpense: undefined;
  TripDetail: { tripId: number };
};

export type AppTabParamList = {
  HomeTab: undefined;
  TripsTab: undefined;
  ExpensesTab: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

// Bottom Tab Navigator
const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
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
        }}
      />
      <Tab.Screen
        name="TripsTab"
        component={TripNavigator}
        options={{
          title: 'Trips',
          tabBarLabel: 'Trips',
        }}
      />
      <Tab.Screen
        name="ExpensesTab"
        component={ExpenseNavigator}
        options={{
          title: 'Expenses',
          tabBarLabel: 'Expenses',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#3b82f6',
          },
          headerTintColor: '#fff',
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
              backgroundColor: '#3b82f6',
            },
            headerTintColor: '#fff',
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
              backgroundColor: '#3b82f6',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
