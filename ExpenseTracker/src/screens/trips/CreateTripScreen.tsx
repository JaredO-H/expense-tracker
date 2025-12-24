/**
 * Create Trip Screen
 * Modal screen for creating new trips
 */

import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TripForm } from '../../components/forms/TripForm';
import { useTripStore } from '../../stores/tripStore';
import { CreateTripModel } from '../../types/database';
import { commonStyles } from '../../styles';
import { useTheme } from '../../contexts/ThemeContext';

interface CreateTripScreenProps {
  navigation: any;
}

export const CreateTripScreen: React.FC<CreateTripScreenProps> = ({ navigation }) => {
  const { createTrip, isLoading } = useTripStore();
  const { colors } = useTheme();

  const handleCreate = async (model: CreateTripModel) => {
    try {
      await createTrip(model);
      Alert.alert('Success', 'Trip created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create trip');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TripForm onSubmit={handleCreate} onCancel={handleCancel} isLoading={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
});
