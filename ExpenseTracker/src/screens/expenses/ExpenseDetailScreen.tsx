/**
 * Expense Detail Screen
 * Displays expense details with edit and delete capabilities
 * Refactored to use centralized screenStyles
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useExpenseStore } from '../../stores/expenseStore';
import { ExpenseForm } from '../../components/forms/ExpenseForm';
import { CreateExpenseModel } from '../../types/database';
import { format } from 'date-fns';
import { colors, spacing, textStyles, commonStyles, screenStyles } from '../../styles';

interface ExpenseDetailScreenProps {
  route: any;
  navigation: any;
}

export const ExpenseDetailScreen: React.FC<ExpenseDetailScreenProps> = ({ route, navigation }) => {
  const { expenseId } = route.params;
  const { expenses, updateExpense, deleteExpense, isLoading } = useExpenseStore();
  const [isEditing, setIsEditing] = useState(false);

  const expense = expenses.find(t => t.id === expenseId);

  useEffect(() => {
    if (!expense) {
      Alert.alert('Error', 'Expense not found', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    }
  }, [expense, navigation]);

  useEffect(() => {
    if (expense) {
      navigation.setOptions({
        title: expense.merchant,
      });
    }
  }, [expense, navigation]);

  const handleUpdate = async (data: CreateExpenseModel) => {
    if (!expense) {
      return;
    }

    try {
      await updateExpense({
        id: expense.id,
        ...data,
      });
      setIsEditing(false);
      Alert.alert('Success', 'Expense updated successfully');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update expense');
    }
  };

  const handleDelete = () => {
    if (!expense) {
      return;
    }

    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${expense.merchant}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense(expense.id);
              Alert.alert('Success', 'Expense deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to delete expense',
              );
            }
          },
        },
      ],
    );
  };

  if (!expense) {
    return (
      <View style={screenStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isEditing) {
    return (
      <View style={screenStyles.screenContainer}>
        <ExpenseForm
          expense={expense}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isLoading={isLoading}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.containerGray}>
      <View style={styles.content}>
        {/* Expense Information Card */}
        <View style={styles.card}>
          <Text style={screenStyles.sectionTitle}>Expense Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Merchant Name</Text>
            <Text style={styles.infoValue}>{expense.merchant}</Text>
          </View>



          {expense.amount && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Amount</Text>
              <Text style={styles.infoValue}>{expense.amount}</Text>
            </View>
          )}

          {expense.tax_amount && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tax Amount</Text>
              <Text style={styles.infoValue}>{expense.tax_amount}</Text>
            </View>
          )}

          {expense.tax_type && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tax Type</Text>
              <Text style={styles.infoValue}>{expense.tax_type}</Text>
            </View>
          )}

          {expense.tax_rate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tax Rate</Text>
              <Text style={styles.infoValue}>{expense.tax_rate}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>
              {format(new Date(expense.date), 'MMMM dd, yyyy')}
            </Text>
          </View>

          {expense.time && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>{expense.time}</Text>
            </View>
          )}

          {expense.category && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Category</Text>
              <Text style={styles.infoValue}>{expense.category}</Text>
            </View>
          )}

          {expense.notes && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Notes</Text>
              <Text style={styles.infoValue}>{expense.notes}</Text>
            </View>
          )}

          {expense.capture_method && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Capture Method</Text>
              <Text style={styles.infoValue}>{expense.capture_method}</Text>
            </View>
          )}

          {expense.ai_service_used && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ai Service Used</Text>
              <Text style={styles.infoValue}>{expense.ai_service_used}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Verification Status</Text>
            <Text style={styles.infoValue}>{expense.verification_status}</Text>
          </View>

        </View>


        {/* Metadata Card */}
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>
              {format(new Date(expense.created_at), 'MMM dd, yyyy HH:mm')}
            </Text>
          </View>
          {expense.updated_at && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Updated</Text>
              <Text style={styles.infoValue}>
                {format(new Date(expense.updated_at), 'MMM dd, yyyy HH:mm')}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => setIsEditing(true)}>
            <Text style={styles.editButtonText}>Edit Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Expense</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

// Minimal local styles - most styles now use centralized screenStyles
const styles = StyleSheet.create({
  // Gray container for detail view
  containerGray: {
    ...commonStyles.containerGray,
  },

  // Content padding
  content: {
    padding: spacing.base,
  },

  // Card - uses common card style
  card: {
    ...commonStyles.card,
    marginBottom: spacing.base,
  },

  // Info Row - Key-value pair display pattern
  infoRow: {
    marginBottom: spacing.md,
  },
  infoLabel: {
    ...textStyles.labelSmall,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    ...textStyles.bodyLarge,
  },

  // Action Buttons
  actionButtons: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionButton: {
    ...commonStyles.button,
  },
  editButton: {
    ...commonStyles.buttonPrimary,
  },
  editButtonText: {
    ...textStyles.button,
  },
  deleteButton: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.errorDark,
  },
  deleteButtonText: {
    ...textStyles.button,
    color: colors.errorDark,
  },
});
