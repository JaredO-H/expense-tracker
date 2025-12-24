/**
 * Expenses Screen - Neo-Memphis Edition
 * Bold, geometric expense list that makes finances exciting
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
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useExpenseStore } from '../../stores/expenseStore';
import { useCategoryStore } from '../../stores/categoryStore';
import { Expense } from '../../types/database';
import { format } from 'date-fns';
import {
  colors,
  spacing,
  borderRadius,
  textStyles,
  commonStyles,
  shadows,
  fontWeights,
  getPatternByIndex,
} from '../../styles';
import { float } from '../../utils/animations';

interface ExpensesScreenProps {
  navigation: any;
}

export const ExpensesScreen: React.FC<ExpensesScreenProps> = ({ navigation }) => {
  const { expenses, fetchExpenses, error, clearError } = useExpenseStore();
  const { categories, fetchCategories } = useCategoryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const [fabRotation] = useState(new Animated.Value(0));
  const [fabMenu1Anim] = useState(new Animated.Value(0));
  const [fabMenu2Anim] = useState(new Animated.Value(0));

  // Floating background decorations
  const [floatAnim1] = useState(new Animated.Value(0));
  const [floatAnim2] = useState(new Animated.Value(0));

  const loadExpenses = useCallback(async () => {
    try {
      await fetchExpenses();
      await fetchCategories();
    } catch (err) {
      console.error('Failed to load expenses:', err);
    }
  }, [fetchExpenses, fetchCategories]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  // Start floating animations
  useEffect(() => {
    float(floatAnim1, 15, 4000).start();
    float(floatAnim2, 20, 5000).start();
  }, []);

  // Card animations disabled for now
  // TODO: Re-enable with safer animation approach

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

  const filteredExpenses = (expenses || []).filter(expense => {
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
    const toValue = fabMenuOpen ? 0 : 1;
    setFabMenuOpen(!fabMenuOpen);

    Animated.spring(fabRotation, {
      toValue,
      friction: 5,
      useNativeDriver: true,
    }).start();

    if (!fabMenuOpen) {
      // Opening - staggered fade in and slide up
      fabMenu1Anim.setValue(0);
      fabMenu2Anim.setValue(0);
      Animated.stagger(80, [
        Animated.timing(fabMenu1Anim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fabMenu2Anim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleExpensePress = (expense: Expense) => {
    navigation.navigate('ExpenseDetail', { expenseId: expense.id });
  };

  const handleViewProcessingQueue = () => {
    const rootNavigation = navigation.getParent();
    if (rootNavigation) {
      rootNavigation.navigate('ProcessingStatus');
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Other';
  };

  const getCategoryColor = (categoryId: number) => {
    const pattern = getPatternByIndex(categoryId);
    return pattern.backgroundColor;
  };

  const renderExpenseCard = ({ item: expense, index }: { item: Expense; index: number }) => {
    const categoryName = getCategoryName(expense.category);
    const categoryColor = getCategoryColor(expense.category);
    const pattern = getPatternByIndex(expense.category);

    return (
      <View>
        <TouchableOpacity
          style={[
            styles.expenseCard,
            // Alternate slight rotation for visual interest
            index % 3 === 1 && styles.cardRotateRight,
            index % 3 === 2 && styles.cardRotateLeft,
          ]}
          onPress={() => handleExpensePress(expense)}
          activeOpacity={0.8}>
        {/* Geometric decoration */}
        <View style={[styles.cardDecor, { backgroundColor: categoryColor }]} />

        <View style={styles.cardHeader}>
          {/* Category Badge */}
          <View
            style={[
              styles.categoryBadge,
              {
                backgroundColor: categoryColor,
                borderColor: pattern.borderColor || colors.border,
                borderWidth: pattern.borderWidth,
              },
            ]}>
            <Text style={styles.categoryText}>{categoryName.toUpperCase()}</Text>
          </View>

          {/* Amount - Big and Bold */}
          <Text style={styles.amountText}>${expense.amount?.toFixed(2) || '0.00'}</Text>
        </View>

        {/* Merchant */}
        <Text style={styles.merchantName} numberOfLines={1}>
          {expense.merchant || 'Unknown Merchant'}
        </Text>

        {/* Date & Time Row */}
        <View style={styles.cardFooter}>
          <View style={styles.dateContainer}>
            <Icon name="calendar-outline" size={14} color={colors.textTertiary} />
            <Text style={styles.dateText}>{format(new Date(expense.date), 'MMM dd, yyyy')}</Text>
          </View>

          {expense.time && (
            <View style={styles.timeContainer}>
              <Icon name="time-outline" size={14} color={colors.textTertiary} />
              <Text style={styles.timeText}>{expense.time}</Text>
            </View>
          )}
        </View>

        {/* Verification Status Indicator */}
        {expense.verification_status && expense.verification_status !== 'verified' && (
          <View style={styles.statusIndicator}>
            <View
              style={[
                styles.statusDot,
                expense.verification_status === 'pending' && styles.statusPending,
                expense.verification_status === 'flagged' && styles.statusFlagged,
              ]}
            />
          </View>
        )}
      </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      {/* Geometric decoration */}
      <View style={styles.emptyDecorCircle} />
      <View style={styles.emptyDecorSquare} />

      <View style={styles.emptyIcon}>
        <Icon name="receipt-outline" size={64} color={colors.primary} />
      </View>

      <Text style={styles.emptyStateTitle}>No Expenses Yet</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery
          ? 'No expenses match your search criteria'
          : "Let's track your first expense!"}
      </Text>

      {!searchQuery && (
        <TouchableOpacity style={styles.emptyStateButton} onPress={handleCreateExpense}>
          <Icon name="add-circle" size={24} color={colors.textInverse} style={styles.emptyButtonIcon} />
          <Text style={styles.emptyStateButtonText}>CREATE EXPENSE</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const fabRotate = fabRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <View style={styles.container}>
      {/* Background decorations with floating animation */}
      <Animated.View style={[styles.bgDecor1, { transform: [{ translateY: floatAnim1 }] }]} />
      <Animated.View style={[styles.bgDecor2, { transform: [{ translateY: floatAnim2 }] }]} />

      {/* Header Section */}
      <View style={styles.headerSection}>
        {/* Processing Queue Button */}
        <TouchableOpacity style={styles.queueButton} onPress={handleViewProcessingQueue}>
          <View style={styles.queueIconContainer}>
            <Icon name="time-outline" size={20} color={colors.textInverse} />
          </View>
          <Text style={styles.queueButtonText}>PROCESSING QUEUE</Text>
          <Icon name="chevron-forward" size={20} color={colors.whiteOverlay80} />
        </TouchableOpacity>

        {/* Search Bar - Bold Memphis style */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={22} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search expenses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textDisabled}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{filteredExpenses.length}</Text>
            <Text style={styles.statLabel}>EXPENSES</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              ${filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0).toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>TOTAL</Text>
          </View>
        </View>
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
        showsVerticalScrollIndicator={false}
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
          <Animated.View
            style={{
              opacity: fabMenu1Anim,
              transform: [
                {
                  translateY: fabMenu1Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}>
            <TouchableOpacity style={styles.fabMenuOption} onPress={handleCaptureExpense} activeOpacity={0.8}>
              <Text style={styles.fabMenuLabel}>Capture Receipt</Text>
              <View style={[styles.fabMenuButton, { backgroundColor: colors.secondary }]}>
                <Icon name="camera" size={24} color={colors.textInverse} />
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={{
              opacity: fabMenu2Anim,
              transform: [
                {
                  translateY: fabMenu2Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}>
            <TouchableOpacity style={styles.fabMenuOption} onPress={handleCreateExpense} activeOpacity={0.8}>
              <Text style={styles.fabMenuLabel}>Manual Entry</Text>
              <View style={[styles.fabMenuButton, { backgroundColor: colors.accent1Dark }]}>
                <Icon name="create-outline" size={24} color={colors.textOnSecondary} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* Floating Action Button - Bold Memphis style */}
      <Animated.View style={[styles.fab, { transform: [{ rotate: fabRotate }] }]}>
        <TouchableOpacity style={styles.fabButton} onPress={toggleFabMenu} activeOpacity={0.8}>
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Background decorations
  bgDecor1: {
    position: 'absolute',
    top: -50,
    right: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.accent1,
    opacity: 0.15,
  },
  bgDecor2: {
    position: 'absolute',
    bottom: 100,
    left: -40,
    width: 100,
    height: 100,
    backgroundColor: colors.accent3,
    opacity: 0.2,
    transform: [{ rotate: '30deg' }],
  },

  // Header Section
  headerSection: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.base,
    paddingBottom: spacing.md,
    borderBottomWidth: 3,
    borderBottomColor: colors.border,
  },

  // Processing Queue Button
  queueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    borderWidth: 3,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  queueIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.whiteOverlay30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  queueButtonText: {
    ...textStyles.labelMedium,
    fontSize: 12,
    color: colors.textInverse,
    flex: 1,
  },

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: colors.border,
    ...shadows.small,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...textStyles.body,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.backgroundElevated,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 3,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statValue: {
    ...textStyles.h3,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...textStyles.labelSmall,
    fontSize: 10,
    color: colors.textSecondary,
  },

  // List
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100, // Space for FAB
  },

  // Expense Cards - Bold Memphis style
  expenseCard: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 3,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.medium,
  },
  cardRotateRight: {
    transform: [{ rotate: '0.5deg' }],
  },
  cardRotateLeft: {
    transform: [{ rotate: '-0.5deg' }],
  },

  // Card Decoration
  cardDecor: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 50,
    height: 50,
    borderRadius: 25,
    opacity: 0.3,
  },

  // Card Header
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },

  // Category Badge
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
  },
  categoryText: {
    ...textStyles.badge,
    fontSize: 9,
    color: colors.textOnSecondary,
  },

  // Amount - Hero treatment
  amountText: {
    ...textStyles.amountSmall,
    color: colors.primary,
  },

  // Merchant
  merchantName: {
    ...textStyles.h6,
    marginBottom: spacing.xs,
    color: colors.textPrimary,
  },

  // Card Footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateText: {
    ...textStyles.caption,
    fontSize: 12,
    color: colors.textTertiary,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeText: {
    ...textStyles.caption,
    fontSize: 12,
    color: colors.textTertiary,
  },

  // Status Indicator
  statusIndicator: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.border,
  },
  statusPending: {
    backgroundColor: colors.warning,
  },
  statusFlagged: {
    backgroundColor: colors.error,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.massive,
    paddingHorizontal: spacing.xl,
    position: 'relative',
  },
  emptyDecorCircle: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent2,
    opacity: 0.2,
  },
  emptyDecorSquare: {
    position: 'absolute',
    bottom: 100,
    left: 30,
    width: 60,
    height: 60,
    backgroundColor: colors.accent4,
    opacity: 0.2,
    transform: [{ rotate: '20deg' }],
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 3,
    borderColor: colors.border,
  },
  emptyStateTitle: {
    ...textStyles.h2,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyStateText: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  emptyStateButton: {
    ...commonStyles.buttonPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
    ...shadows.medium,
  },
  emptyButtonIcon: {
    marginRight: spacing.sm,
  },
  emptyStateButtonText: {
    ...textStyles.button,
    fontSize: 15,
  },

  // FAB - Bold Memphis style
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    zIndex: 1000,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.xl,
  },
  fabButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: spacing.xxl + spacing.sm,
    color: colors.textInverse,
    fontWeight: fontWeights.regular,
  },

  // FAB Overlay
  fabOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 998,
  },

  // FAB Menu
  fabMenuContainer: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg + 80,
    alignItems: 'flex-end',
    zIndex: 999,
    gap: spacing.md,
  },
  fabMenuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fabMenuLabel: {
    ...textStyles.bodyBold,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.medium,
  },
  fabMenuButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.border,
    ...shadows.large,
  },
});
