/**
 * Create Expense Screen
 * Screen for creating new expenses
 */

import React from 'react';
import { View, Alert } from 'react-native';
import { ExpenseForm } from '../../components/forms/ExpenseForm';
import { useExpenseStore } from '../../stores/expenseStore';
import { CreateExpenseModel } from '../../types/database';
import { screenStyles } from '../../styles';
import { useTheme } from '../../contexts/ThemeContext';

interface CreateExpenseScreenProps {
  navigation: any;
  route?: {
    params?: {
      tripId?: number;
    };
  };
}

export const CreateExpenseScreen: React.FC<CreateExpenseScreenProps> = ({ navigation, route }) => {
  const { createExpense, isLoading } = useExpenseStore();
  const { colors } = useTheme();
  const initialTripId = route?.params?.tripId;

  const handleCreate = async (model: CreateExpenseModel) => {
    try {
      await createExpense(model);
      Alert.alert('Success', 'Expense created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create expense');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={[screenStyles.screenContainer, { backgroundColor: colors.background }]}>
      <ExpenseForm
        onSubmit={handleCreate}
        onCancel={handleCancel}
        isLoading={isLoading}
        initialTripId={initialTripId}
      />
    </View>
  );
};
