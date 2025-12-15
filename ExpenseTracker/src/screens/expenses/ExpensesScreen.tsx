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
import Icon from 'react-native-vector-icons/Ionicons';
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
  const [fabMenuOpen, setFabMenuOpen] = useState(false);

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
    setFabMenuOpen(false);
    navigation.navigate('CreateExpense');
  };

  const handleCaptureExpense = () => {
    setFabMenuOpen(false);
    navigation.navigate('Camera');
  };

  const toggleFabMenu = () => {
    setFabMenuOpen(!fabMenuOpen);
  };

  const handleExpensePress = (expense: Expense) => {
    navigation.navigate('ExpenseDetail', { expenseId: expense.id });
  };

  const handleViewProcessingQueue = () => {
    // Navigate to ProcessingStatus screen in the root navigator
    const rootNavigation = navigation.getParent();
    if (rootNavigation) {
      rootNavigation.navigate('ProcessingStatus');
    }
  };

  const renderExpenseCard = ({ item: expense }: { item: Expense }) => {
    return (
      <TouchableOpacity
        style={styles.expenseCard}
        onPress={() => handleExpensePress(expense)}
        activeOpacity={0.7}>
        <View style={styles.expenseCardRow}>
          <Text style={styles.merchantName} numberOfLines={1}>
            {expense.merchant || 'Unknown Merchant'}
          </Text>
          <Text style={styles.amountText}>
            ${expense.amount?.toFixed(2) || '0.00'}
          </Text>
        </View>
        <Text style={styles.dateText}>
          {format(new Date(expense.date), 'MMM dd, yyyy')}
        </Text>
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
      {/* Processing Queue Button */}
      <View style={styles.topButtonContainer}>
        <TouchableOpacity style={styles.queueButton} onPress={handleViewProcessingQueue}>
          <Icon name="time-outline" size={20} color={colors.textInverse} style={styles.queueButtonIcon} />
          <Text style={styles.queueButtonText}>Processing Queue</Text>
        </TouchableOpacity>
      </View>

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

      {/* FAB Menu Overlay */}
      {fabMenuOpen && (
        <TouchableOpacity
          style={styles.fabOverlay}
          activeOpacity={1}
          onPress={() => setFabMenuOpen(false)}
        />
      )}

      {/* FAB Menu Options */}
      {fabMenuOpen && (
        <View style={styles.fabMenuContainer}>
          <TouchableOpacity
            style={styles.fabMenuOption}
            onPress={handleCaptureExpense}
            activeOpacity={0.7}>
            <View style={styles.fabMenuButton}>
              <Icon name="camera" size={24} color={colors.textInverse} />
            </View>
            <Text style={styles.fabMenuLabel}>Capture Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fabMenuOption}
            onPress={handleCreateExpense}
            activeOpacity={0.7}>
            <View style={styles.fabMenuButton}>
              <Icon name="create-outline" size={24} color={colors.textInverse} />
            </View>
            <Text style={styles.fabMenuLabel}>Manual Entry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={toggleFabMenu}>
        <Icon
          name={fabMenuOpen ? 'close' : 'add'}
          size={32}
          color={colors.textInverse}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.containerGray,
  },
  topButtonContainer: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  queueButton: {
    ...commonStyles.flexRow,
    ...commonStyles.alignCenter,
    ...commonStyles.flexCenter,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  queueButtonIcon: {
    marginRight: spacing.xs,
  },
  queueButtonText: {
    ...textStyles.body,
    color: colors.textInverse,
    fontWeight: fontWeights.semibold,
  },
  searchContainer: {
    backgroundColor: colors.background,
    padding: spacing.base,
    paddingTop: spacing.sm,
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
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
    ...shadows.sm,
  },
  expenseCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  merchantName: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: fontWeights.medium,
    flex: 1,
    marginRight: spacing.md,
  },
  amountText: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: fontWeights.semibold,
  },
  dateText: {
    ...textStyles.caption,
    fontSize: 11,
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
    zIndex: 1000,
  },
  fabOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 998,
  },
  fabMenuContainer: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg + 70,
    alignItems: 'flex-end',
    zIndex: 999,
  },
  fabMenuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  fabMenuLabel: {
    ...textStyles.body,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    fontWeight: fontWeights.semibold,
    ...shadows.md,
  },
  fabMenuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    ...commonStyles.flexCenter,
    ...shadows.lg,
  },
});
