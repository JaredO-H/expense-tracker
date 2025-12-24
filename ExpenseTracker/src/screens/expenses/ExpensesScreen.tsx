/**
 * Expenses Screen - Neo-Memphis Edition
 * Bold, geometric expense list that makes finances exciting
 * Refactored to use centralized screenStyles
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
  colors as staticColors,
  spacing,
  textStyles,
  screenStyles,
  getPatternByIndex,
} from '../../styles';
import { float } from '../../utils/animations';
import { useTheme } from '../../contexts/ThemeContext';

interface ExpensesScreenProps {
  navigation: any;
}

export const ExpensesScreen: React.FC<ExpensesScreenProps> = ({ navigation }) => {
  const { expenses, fetchExpenses, error, clearError } = useExpenseStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { colors } = useTheme();
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
            screenStyles.listItemCard,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.border,
            },
            // Alternate slight rotation for visual interest
            index % 3 === 1 && screenStyles.memphisCardRotateRight,
            index % 3 === 2 && screenStyles.memphisCardRotateLeft,
          ]}
          onPress={() => handleExpensePress(expense)}
          activeOpacity={0.8}>
          {/* Geometric decoration */}
          <View style={[screenStyles.cardDecorCircle, { backgroundColor: categoryColor }]} />

          <View style={screenStyles.cardHeader}>
            {/* Category Badge */}
            <View
              style={[
                screenStyles.categoryBadge,
                {
                  backgroundColor: categoryColor,
                  borderColor: pattern.borderColor || colors.border,
                  borderWidth: pattern.borderWidth,
                },
              ]}>
              <Text style={[screenStyles.categoryBadgeText, { color: colors.textOnSecondary }]}>{categoryName.toUpperCase()}</Text>
            </View>

            {/* Amount - Big and Bold */}
            <Text style={[styles.amountText, { color: colors.primary }]}>${expense.amount?.toFixed(2) || '0.00'}</Text>
          </View>

          {/* Merchant */}
          <Text style={[styles.merchantName, { color: colors.textPrimary }]} numberOfLines={1}>
            {expense.merchant || 'Unknown Merchant'}
          </Text>

          {/* Date & Time Row */}
          <View style={screenStyles.cardFooter}>
            <View style={styles.dateContainer}>
              <Icon name="calendar-outline" size={14} color={colors.textTertiary} />
              <Text style={[styles.dateText, { color: colors.textTertiary }]}>{format(new Date(expense.date), 'MMM dd, yyyy')}</Text>
            </View>

            {expense.time && (
              <View style={styles.timeContainer}>
                <Icon name="time-outline" size={14} color={colors.textTertiary} />
                <Text style={[styles.timeText, { color: colors.textTertiary }]}>{expense.time}</Text>
              </View>
            )}
          </View>

          {/* Verification Status Indicator */}
          {expense.verification_status && expense.verification_status !== 'verified' && (
            <View style={screenStyles.statusIndicator}>
              <View
                style={[
                  screenStyles.statusDot,
                  expense.verification_status === 'pending' && screenStyles.statusDotPending,
                  expense.verification_status === 'flagged' && screenStyles.statusDotFlagged,
                ]}
              />
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={screenStyles.emptyStateContainer}>
      {/* Geometric decoration */}
      <View style={[screenStyles.emptyStateDecorCircle, { backgroundColor: colors.accent1 }]} />
      <View style={[screenStyles.emptyStateDecorSquare, { backgroundColor: colors.accent3 }]} />

      <View style={[screenStyles.emptyStateIcon, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}>
        <Icon name="receipt-outline" size={64} color={colors.primary} />
      </View>

      <Text style={[screenStyles.emptyStateTitle, { color: colors.textPrimary }]}>No Expenses Yet</Text>
      <Text style={[screenStyles.emptyStateText, { color: colors.textSecondary }]}>
        {searchQuery
          ? 'No expenses match your search criteria'
          : "Let's track your first expense!"}
      </Text>

      {!searchQuery && (
        <TouchableOpacity style={[screenStyles.emptyStateButton, { backgroundColor: colors.primary, borderColor: colors.border }]} onPress={handleCreateExpense}>
          <Icon name="add-circle" size={24} color={colors.textInverse} style={{ marginRight: spacing.sm }} />
          <Text style={[screenStyles.emptyStateButtonText, { color: colors.textInverse }]}>CREATE EXPENSE</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const fabRotate = fabRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <View style={[screenStyles.screenWithDecorations, { backgroundColor: colors.background }]}>
      {/* Background decorations with floating animation */}
      <Animated.View style={[screenStyles.bgDecorCircleLarge, { backgroundColor: colors.accent1, transform: [{ translateY: floatAnim1 }] }]} />
      <Animated.View style={[screenStyles.bgDecorSquareLeft, { backgroundColor: colors.accent4, transform: [{ translateY: floatAnim2 }] }]} />

      {/* Header Section */}
      <View style={[screenStyles.headerSection, { backgroundColor: colors.backgroundSecondary }]}>
        {/* Processing Queue Button */}
        <TouchableOpacity style={[screenStyles.queueButton, { backgroundColor: colors.accent3, borderColor: colors.border }]} onPress={handleViewProcessingQueue}>
          <View style={[screenStyles.queueIconBadge, { backgroundColor: colors.accent3Dark }]}>
            <Icon name="time-outline" size={20} color={colors.textInverse} />
          </View>
          <Text style={[screenStyles.queueButtonText, { color: colors.textInverse }]}>PROCESSING QUEUE</Text>
          <Icon name="chevron-forward" size={20} color={colors.whiteOverlay80} />
        </TouchableOpacity>

        {/* Search Bar - Bold Memphis style */}
        <View style={[screenStyles.memphisSearchBar, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
          <View style={screenStyles.searchIconContainer}>
            <Icon name="search" size={22} color={colors.textSecondary} />
          </View>
          <TextInput
            style={[screenStyles.searchInputField, { color: colors.textPrimary }]}
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
        <View style={screenStyles.statsRow}>
          <View style={[screenStyles.statBox, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}>
            <Text style={[screenStyles.statValue, { color: colors.textPrimary }]}>{filteredExpenses.length}</Text>
            <Text style={[screenStyles.statLabel, { color: colors.textSecondary }]}>EXPENSES</Text>
          </View>
          <View style={[screenStyles.statBox, { backgroundColor: colors.secondaryLight, borderColor: colors.border }]}>
            <Text style={[screenStyles.statValue, { color: colors.textPrimary }]}>
              ${filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0).toFixed(0)}
            </Text>
            <Text style={[screenStyles.statLabel, { color: colors.textSecondary }]}>TOTAL</Text>
          </View>
        </View>
      </View>

      {/* Expense List */}
      <FlatList
        data={filteredExpenses}
        renderItem={renderExpenseCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={screenStyles.listContentPadding}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB Menu Overlay */}
      {fabMenuOpen && (
        <TouchableOpacity
          style={screenStyles.fabOverlay}
          activeOpacity={1}
          onPress={() => setFabMenuOpen(false)}
        />
      )}

      {/* FAB Menu Options */}
      {fabMenuOpen && (
        <View style={screenStyles.fabMenuContainer}>
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
            <TouchableOpacity style={screenStyles.fabMenuOption} onPress={handleCaptureExpense} activeOpacity={0.8}>
              <Text style={[screenStyles.fabMenuLabel, { color: colors.textPrimary, backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>Capture Receipt</Text>
              <View style={[screenStyles.fabMenuButton, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
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
            <TouchableOpacity style={screenStyles.fabMenuOption} onPress={handleCreateExpense} activeOpacity={0.8}>
              <Text style={[screenStyles.fabMenuLabel, { color: colors.textPrimary, backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>Manual Entry</Text>
              <View style={[screenStyles.fabMenuButton, { backgroundColor: colors.accent1Dark, borderColor: colors.border }]}>
                <Icon name="create-outline" size={24} color={colors.textOnSecondary} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* Floating Action Button - Bold Memphis style */}
      <Animated.View style={[screenStyles.fabContainer, { backgroundColor: colors.primary, transform: [{ rotate: fabRotate }] }]}>
        <TouchableOpacity style={[screenStyles.fabButton, { backgroundColor: colors.primary }]} onPress={toggleFabMenu} activeOpacity={0.8}>
          <Text style={[screenStyles.fabIconText, { color: colors.textInverse }]}>+</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// Minimal local styles - most styles now use centralized screenStyles
const styles = StyleSheet.create({
  // Card-specific styles that need component context
  amountText: {
    ...textStyles.amountSmall,
    color: staticColors.primary,
  },
  merchantName: {
    ...textStyles.h6,
    marginBottom: spacing.xs,
    color: staticColors.textPrimary,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateText: {
    ...textStyles.caption,
    fontSize: 12,
    color: staticColors.textTertiary,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeText: {
    ...textStyles.caption,
    fontSize: 12,
    color: staticColors.textTertiary,
  },
});
