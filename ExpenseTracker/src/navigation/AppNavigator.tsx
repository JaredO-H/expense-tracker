/**
 * App Navigator
 * Main navigation structure with bottom tabs
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ExpenseNavigator } from './ExpenseNavigator';
import { TripNavigator } from './TripNavigator';


export type AppTabParamList = {
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
    </NavigationContainer>
  );
};
