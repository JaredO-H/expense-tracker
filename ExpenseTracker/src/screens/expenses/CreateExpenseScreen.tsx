/**
 * Expenses Screen (Placeholder)
 * This will be implemented in a future story
 */

import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { ExpenseForm } from '../../components/forms/ExpenseForm';
import { useExpenseStore } from '../../stores/expenseStore';
import { CreateExpenseModel} from '../../types/database';
import { commonStyles } from '../../styles';

interface CreateExpenseScreenProps {
  navigation: any;
}


export const CreateExpenseScreen: React.FC<CreateExpenseScreenProps> = ({navigation}) => {
  const { createExpense, isLoading } = useExpenseStore();

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
    <View style={styles.container}>
      <ExpenseForm onSubmit={handleCreate} onCancel={handleCancel} isLoading={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
});
