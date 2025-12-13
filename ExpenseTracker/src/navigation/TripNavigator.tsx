/**
 * Trip Navigator
 * Stack navigator for trip-related screens
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TripsScreen } from '../screens/trips/TripsScreen';
import { TripDetailScreen } from '../screens/trips/TripDetailScreen';
import { CreateTripScreen } from '../screens/trips/CreateTripScreen';

export type TripStackParamList = {
  TripsList: undefined;
  TripDetail: { tripId: number };
  CreateTrip: undefined;
};

const Stack = createNativeStackNavigator<TripStackParamList>();

export const TripNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3b82f6',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}>
      <Stack.Screen
        name="TripsList"
        component={TripsScreen}
        options={{
          title: 'My Trips',
        }}
      />
      <Stack.Screen
        name="TripDetail"
        component={TripDetailScreen}
        options={{
          title: 'Trip Details',
        }}
      />
      <Stack.Screen
        name="CreateTrip"
        component={CreateTripScreen}
        options={{
          title: 'Create Trip',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};
