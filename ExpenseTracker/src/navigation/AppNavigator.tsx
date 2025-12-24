/**
 * App Navigator
 * Main navigation structure with bottom tabs
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ExpenseNavigator } from './ExpenseNavigator';
import { TripNavigator } from './TripNavigator';
import { HomeScreen } from '../screens/HomeScreen';
import { colors } from '../styles';


export type AppTabParamList = {
  HomeTab: undefined;
  TripsTab: undefined;
  ExpensesTab: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
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
              backgroundColor: colors.primary,
            },
            headerTintColor: colors.textInverse,
            headerTitleStyle: {
              fontWeight: '800',
            },
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
