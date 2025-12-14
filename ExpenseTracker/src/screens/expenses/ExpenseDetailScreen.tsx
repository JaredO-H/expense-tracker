/**
 * Expense Detail Screen
 * Displays expense details with edit and delete capabilities
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
      `Are you sure you want to delete "${expense.name}"?`,
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (isEditing) {
    return (
      <View style={styles.container}>
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
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Expense Information Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Expense Information</Text>

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
              <Text style={styles.infoValue}>{expense.processed}</Text>
            </View>
          )}

          {expense.capture_method && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Capture Method</Text>
              <Text style={styles.infoValue}>{expense.manual_entry}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#374151',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  summaryNote: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 8,
  },
  actionButtons: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#3b82f6',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
