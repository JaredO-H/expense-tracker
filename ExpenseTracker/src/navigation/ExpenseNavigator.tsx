/**
 * Expense Navigator
 * Stack navigator for expense-related screens
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExpensesScreen } from '../screens/expenses/ExpensesScreen';
import { ExpenseDetailScreen } from '../screens/expenses/ExpenseDetailScreen';
import { CreateExpenseScreen } from '../screens/expenses/CreateExpenseScreen';

export type ExpenseStackParamList = {
  ExpensesList: undefined;
  ExpenseDetail: { expenseId: number };
  CreateExpense: undefined;
};

const Stack = createNativeStackNavigator<ExpenseStackParamList>();

export const ExpenseNavigator: React.FC = () => {
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
    </Stack.Navigator>
  );
};
