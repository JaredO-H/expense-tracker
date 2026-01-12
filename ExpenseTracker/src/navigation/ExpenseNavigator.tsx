/**
 * Expense Navigator
 * Stack navigator for expense-related screens
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExpensesScreen } from '../screens/expenses/ExpensesScreen';
import { ExpenseDetailScreen } from '../screens/expenses/ExpenseDetailScreen';
import { CreateExpenseScreen } from '../screens/expenses/CreateExpenseScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { useTheme } from '../contexts/ThemeContext';

export type ExpenseStackParamList = {
  ExpensesList: { tripId?: number } | undefined;
  ExpenseDetail: { expenseId: number };
  CreateExpense: undefined;
  Camera: undefined;
};

const Stack = createNativeStackNavigator<ExpenseStackParamList>();

export const ExpenseNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.textInverse,
        headerTitleStyle: {
          fontWeight: '800',
        },
      }}>
      <Stack.Screen
        name="ExpensesList"
        component={ExpensesScreen}
        options={{
           title: 'My Expenses',
        }}
      />
      <Stack.Screen
        name="ExpenseDetail"
        component={ExpenseDetailScreen}
        options={{
          title: 'Expense Details',
        }}
      />
      <Stack.Screen
        name="CreateExpense"
        component={CreateExpenseScreen}
        options={{
          title: 'Create Expense',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{
          title: 'Capture Receipt',
          presentation: 'fullScreenModal',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
