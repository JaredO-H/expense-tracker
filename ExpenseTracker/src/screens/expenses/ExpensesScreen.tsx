/**
 * Expenses Screen
 * Displays list of all expenses with search, filtering, and status indicators
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { useExpenseStore } from '../../stores/expenseStore';
import { Expense } from '../../types/database';
import { format } from 'date-fns';
import { colors, spacing, borderRadius, textStyles, commonStyles, shadows, fontWeights } from '../../styles';

interface ExpensesScreenProps {
  navigation: any;
}

export const ExpensesScreen: React.FC<ExpensesScreenProps> = ({ navigation }) => {
  const { expenses, fetchExpenses, error, clearError } = useExpenseStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadExpenses = useCallback(async () => {
    try {
      await fetchExpenses();
    } catch (err) {
      console.error('Failed to load expenses:', err);
    }
  }, [fetchExpenses]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error, clearError]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  }, [loadExpenses]);

  const filteredExpenses = expenses.filter(expense => {
    if (!searchQuery) {
      return true;
    }
    const query = searchQuery.toLowerCase();
    return (
      expense.merchant?.toLowerCase().includes(query) ||
      expense.category?.toString().includes(query) ||
      expense.notes?.toLowerCase().includes(query)
    );
  });

  const handleCreateExpense = () => {
    navigation.navigate('CreateExpense');
  };

  const handleExpensePress = (expense: Expense) => {
    navigation.navigate('ExpenseDetail', { expenseId: expense.id });
  };

  const renderExpenseCard = ({ item: expense }: { item: Expense }) => {
    return (
      <TouchableOpacity
        style={styles.expenseCard}
        onPress={() => handleExpensePress(expense)}
        activeOpacity={0.7}>
        <View style={styles.expenseCardHeader}>
          <Text style={styles.expenseName}>{expense.merchant}</Text>
        </View>

        <View style={styles.expenseCardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>
              {format(new Date(expense.date), 'MMM dd, yyyy')}
            </Text>
          </View>

          {expense.amount && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Amount:</Text>
              <Text style={styles.infoValue}>{expense.amount}</Text>
            </View>
          )}

        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Expenses Found</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery
          ? 'No expenses match your search criteria'
          : 'Get started by creating your first business expense'}
      </Text>
      {!searchQuery && (
        <TouchableOpacity style={styles.emptyStateButton} onPress={handleCreateExpense}>
          <Text style={styles.emptyStateButtonText}>Create Expense</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search expenses by Merchant or Date"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textDisabled}
        />
      </View>

      {/* Expense List */}
      <FlatList
        data={filteredExpenses}
        renderItem={renderExpenseCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleCreateExpense}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.containerGray,
  },
  searchContainer: {
    backgroundColor: colors.background,
    padding: spacing.base,
    ...commonStyles.borderBottom,
  },
  searchInput: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...textStyles.body,
  },
  listContent: {
    padding: spacing.base,
    paddingBottom: 80, // Space for FAB
  },
  expenseCard: {
    ...commonStyles.card,
    marginBottom: spacing.base,
  },
  expenseCardHeader: {
    ...commonStyles.flexRow,
    ...commonStyles.flexBetween,
    ...commonStyles.alignCenter,
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
  },
  expenseName: {
    ...textStyles.h5,
    flex: 1,
    marginRight: spacing.md,
  },
  statusBadge: {
    ...commonStyles.badge,
  },
  status_upcoming: {
    backgroundColor: colors.infoLight,
  },
  status_active: {
    backgroundColor: colors.successLight,
  },
  status_completed: {
    ...commonStyles.badgeGray,
  },
  statusText: {
    ...textStyles.badge,
    fontSize: textStyles.caption.fontSize,
    color: colors.textSecondary,
  },
  expenseCardBody: {
    padding: spacing.base,
  },
  infoRow: {
    ...commonStyles.flexRow,
    marginBottom: spacing.sm,
  },
  infoLabel: {
    ...textStyles.labelSmall,
    color: colors.textTertiary,
    width: 90,
  },
  infoValue: {
    ...textStyles.body,
    flex: 1,
  },
  expenseCardFooter: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundTertiary,
  },
  expenseCount: {
    ...textStyles.body,
    color: colors.textTertiary,
  },
  emptyState: {
    ...commonStyles.emptyContainer,
  },
  emptyStateTitle: {
    ...commonStyles.emptyTitle,
  },
  emptyStateText: {
    ...commonStyles.emptySubtitle,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xxxl,
  },
  emptyStateButton: {
    ...commonStyles.buttonPrimary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  emptyStateButtonText: {
    ...textStyles.button,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    ...commonStyles.flexCenter,
    ...shadows.xl,
  },
  fabIcon: {
    fontSize: spacing.xxl + spacing.sm,
    color: colors.textInverse,
    fontWeight: fontWeights.regular,
  },
});
