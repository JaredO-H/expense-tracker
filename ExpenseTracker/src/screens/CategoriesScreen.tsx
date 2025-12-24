/**
 * Categories Screen - Neo-Memphis Edition
 * A visual showcase of expense categories with unique geometric patterns
 * Refactored to use centralized screenStyles
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useCategoryStore } from '../stores/categoryStore';
import { useExpenseStore } from '../stores/expenseStore';
import {
  colors,
  spacing,
  borderRadius,
  textStyles,
  shadows,
  screenStyles,
  getPatternByIndex,
} from '../styles';
import { staggeredFadeIn, createAnimatedValues } from '../utils/animations';

interface CategoriesScreenProps {
  navigation: any;
}

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ navigation }) => {
  const { categories, fetchCategories } = useCategoryStore();
  const { expenses, fetchExpenses } = useExpenseStore();
  const [isLoading, setIsLoading] = useState(true);
  const [scaleAnims] = useState(() => categories.map(() => new Animated.Value(1)));

  // Entrance animations for category cards
  const [entranceAnims] = useState<Animated.Value[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchCategories(), fetchExpenses()]);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [fetchCategories, fetchExpenses]);

  // Initialize and trigger entrance animations when categories load
  useEffect(() => {
    if (!isLoading && categories.length > 0) {
      // Create animated values for each category
      const newAnims = categories.map(() => new Animated.Value(0));
      entranceAnims.length = 0;
      entranceAnims.push(...newAnims);

      // Trigger staggered entrance
      staggeredFadeIn(newAnims, 120, 600).start();
    }
  }, [isLoading, categories.length]);

  const getCategoryStats = (categoryId: number) => {
    const categoryExpenses = (expenses || []).filter(exp => exp.category === categoryId);
    const totalAmount = categoryExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    return {
      count: categoryExpenses.length,
      total: totalAmount,
    };
  };

  const handleCategoryPress = (categoryId: number, index: number) => {
    // Animate press
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to filtered expense list (if implemented)
    // navigation.navigate('Expenses', { categoryId });
  };

  if (isLoading) {
    return (
      <View style={screenStyles.loadingStateContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={screenStyles.loadingStateText}>Loading categories...</Text>
      </View>
    );
  }

  const totalExpenses = (expenses || []).length;
  const totalAmount = (expenses || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);

  return (
    <View style={screenStyles.screenWithDecorations}>
      {/* Background decorations */}
      <View style={screenStyles.bgDecorCircleLarge} />
      <View style={screenStyles.bgDecorSquare} />
      <View style={screenStyles.bgDecorCircleSmallBottom} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={screenStyles.scrollViewContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={screenStyles.headerWithAccent}>
          <View style={screenStyles.decorativeAccentBar} />
          <Text style={screenStyles.headerTitle}>Categories</Text>
          <Text style={screenStyles.headerSubtitle}>
            Organize your expenses with style
          </Text>
        </View>

        {/* Overall Stats */}
        <View style={styles.statsContainer}>
          <View style={screenStyles.statBoxHorizontal}>
            <View style={screenStyles.statIconCircle}>
              <Icon name="albums" size={28} color={colors.primary} />
            </View>
            <View style={screenStyles.statTextContainer}>
              <Text style={screenStyles.statValue}>{categories.length}</Text>
              <Text style={screenStyles.statLabel}>CATEGORIES</Text>
            </View>
          </View>

          <View style={screenStyles.statBoxHorizontal}>
            <View style={screenStyles.statIconCircle}>
              <Icon name="receipt" size={28} color={colors.secondary} />
            </View>
            <View style={screenStyles.statTextContainer}>
              <Text style={screenStyles.statValue}>{totalExpenses}</Text>
              <Text style={screenStyles.statLabel}>EXPENSES</Text>
            </View>
          </View>

          <View style={[screenStyles.statBoxHorizontal, styles.statCardWide]}>
            <View style={screenStyles.statIconCircle}>
              <Icon name="cash" size={28} color={colors.accent1Dark} />
            </View>
            <View style={screenStyles.statTextContainer}>
              <Text style={screenStyles.statValue}>${totalAmount.toFixed(0)}</Text>
              <Text style={screenStyles.statLabel}>TOTAL SPENT</Text>
            </View>
          </View>
        </View>

        {/* Section Title */}
        <View style={screenStyles.sectionHeader}>
          <Text style={screenStyles.sectionTitle}>YOUR CATEGORIES</Text>
          <View style={screenStyles.sectionLine} />
        </View>

        {/* Categories Grid */}
        <View style={styles.categoriesGrid}>
          {categories.map((category, index) => {
            const pattern = getPatternByIndex(index);
            const stats = getCategoryStats(category.id);
            const hasExpenses = stats.count > 0;

            // Get animations for this card
            const entranceAnim = entranceAnims[index] || new Animated.Value(1);

            return (
              <Animated.View
                key={category.id}
                style={[
                  styles.categoryCardWrapper,
                  {
                    opacity: entranceAnim,
                    transform: [
                      { scale: scaleAnims[index] || 1 },
                      {
                        translateY: entranceAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0],
                        }),
                      },
                    ],
                  },
                ]}>
                <TouchableOpacity
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor: pattern.backgroundColor,
                      borderColor: pattern.borderColor || colors.border,
                      borderWidth: pattern.borderWidth,
                      borderStyle: pattern.borderStyle,
                    },
                  ]}
                  onPress={() => handleCategoryPress(category.id, index)}
                  activeOpacity={0.9}>
                  {/* Geometric decoration unique to each category */}
                  <View style={styles.categoryDecorContainer}>
                    {index % 4 === 0 && <View style={styles.decorCircle} />}
                    {index % 4 === 1 && <View style={styles.decorSquare} />}
                    {index % 4 === 2 && <View style={styles.decorTriangle} />}
                    {index % 4 === 3 && <View style={styles.decorPill} />}
                  </View>

                  {/* Category Name */}
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName} numberOfLines={2}>
                      {category.name.toUpperCase()}
                    </Text>
                  </View>

                  {/* Stats */}
                  {hasExpenses ? (
                    <View style={styles.categoryStats}>
                      <View style={styles.statRow}>
                        <Icon name="receipt-outline" size={16} color={colors.textOnSecondary} />
                        <Text style={styles.categoryStatText}>{stats.count}</Text>
                      </View>
                      <View style={styles.statRow}>
                        <Icon name="cash-outline" size={16} color={colors.textOnSecondary} />
                        <Text style={styles.categoryStatText}>${stats.total.toFixed(0)}</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.categoryEmpty}>
                      <Text style={styles.categoryEmptyText}>No expenses yet</Text>
                    </View>
                  )}

                  {/* Arrow indicator */}
                  <View style={styles.categoryArrow}>
                    <Icon name="arrow-forward" size={20} color={colors.textOnSecondary} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Info Banner */}
        <View style={screenStyles.infoBanner}>
          <View style={screenStyles.infoBannerDecor} />
          <View style={screenStyles.infoBannerContent}>
            <View style={screenStyles.infoBannerIcon}>
              <Icon name="color-palette" size={24} color={colors.accent3Dark} />
            </View>
            <View style={screenStyles.infoBannerTextContainer}>
              <Text style={screenStyles.infoBannerTitle}>Unique Patterns</Text>
              <Text style={screenStyles.infoBannerSubtitle}>
                Each category has a distinctive color and border style for instant recognition
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Minimal local styles - most styles now use centralized screenStyles
const styles = StyleSheet.create({
  // ScrollView basic style
  scrollView: {
    flex: 1,
  },

  // Stats Container - wrapping flexbox layout
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  statCardWide: {
    flex: 1,
    minWidth: '100%',
  },

  // Categories Grid - unique grid layout for category cards
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.base,
    marginBottom: spacing.xl,
  },
  categoryCardWrapper: {
    width: '48%',
  },
  categoryCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    minHeight: 140,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.medium,
  },

  // Category Decorations - Unique geometric shapes per category
  categoryDecorContainer: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  decorCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.whiteOverlay30,
    borderWidth: 2,
    borderColor: colors.whiteOverlay60,
  },
  decorSquare: {
    width: 45,
    height: 45,
    backgroundColor: colors.whiteOverlay30,
    borderWidth: 2,
    borderColor: colors.whiteOverlay60,
    transform: [{ rotate: '15deg' }],
  },
  decorTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 25,
    borderRightWidth: 25,
    borderBottomWidth: 45,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.whiteOverlay30,
  },
  decorPill: {
    width: 50,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: colors.whiteOverlay30,
    borderWidth: 2,
    borderColor: colors.whiteOverlay60,
  },

  // Category Content - Category-specific layout
  categoryHeader: {
    marginBottom: spacing.md,
  },
  categoryName: {
    ...textStyles.h6,
    fontSize: 15,
    fontWeight: '800',
    color: colors.textOnSecondary,
    letterSpacing: 0.5,
    lineHeight: 20,
  },

  // Category Stats - Inline stats display
  categoryStats: {
    gap: spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  categoryStatText: {
    ...textStyles.bodyBold,
    fontSize: 14,
    color: colors.textOnSecondary,
  },

  // Empty state per category
  categoryEmpty: {
    opacity: 0.6,
  },
  categoryEmptyText: {
    ...textStyles.caption,
    fontSize: 11,
    color: colors.textOnSecondary,
    fontStyle: 'italic',
  },

  // Category Arrow indicator
  categoryArrow: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
  },
});
