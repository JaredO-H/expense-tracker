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
  colors as staticColors,
  spacing,
  borderRadius,
  textStyles,
  shadows,
  screenStyles,
  getPatternByIndex,
} from '../styles';
import { staggeredFadeIn, createAnimatedValues } from '../utils/animations';
import { useTheme } from '../contexts/ThemeContext';

interface CategoriesScreenProps {
  navigation: any;
}

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ navigation }) => {
  const { categories, fetchCategories } = useCategoryStore();
  const { expenses, fetchExpenses } = useExpenseStore();
  const { colors, themeVersion } = useTheme();
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
      <View style={[screenStyles.loadingStateContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[screenStyles.loadingStateText, { color: colors.textPrimary }]}>
          Loading categories...
        </Text>
      </View>
    );
  }

  const totalExpenses = (expenses || []).length;
  const totalAmount = (expenses || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);

  return (
    <View
      style={[screenStyles.screenWithDecorations, { backgroundColor: colors.background }]}
      key={themeVersion}>
      {/* Background decorations */}
      <View style={[screenStyles.bgDecorCircleLarge, { backgroundColor: colors.accent1 }]} />
      <View style={[screenStyles.bgDecorSquare, { backgroundColor: colors.accent3 }]} />
      <View
        style={[screenStyles.bgDecorCircleSmallBottom, { backgroundColor: colors.secondary }]}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={screenStyles.scrollViewContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={screenStyles.headerWithAccent}>
          <View style={[screenStyles.decorativeAccentBar, { backgroundColor: colors.primary }]} />
          <Text style={[screenStyles.headerTitle, { color: colors.textPrimary }]}>Categories</Text>
          <Text style={[screenStyles.headerSubtitle, { color: colors.textSecondary }]}>
            Organize your expenses with style
          </Text>
        </View>

        {/* Overall Stats */}
        <View style={styles.statsContainer}>
          <View
            style={[
              screenStyles.statBoxHorizontal,
              { backgroundColor: colors.primaryLight, borderColor: colors.border },
            ]}>
            <View style={[screenStyles.statIconCircle, { backgroundColor: colors.primary }]}>
              <Icon name="albums" size={28} color={colors.textInverse} />
            </View>
            <View style={screenStyles.statTextContainer}>
              <Text style={[screenStyles.statValue, { color: colors.textPrimary }]}>
                {categories.length}
              </Text>
              <Text style={[screenStyles.statLabel, { color: colors.textSecondary }]}>
                CATEGORIES
              </Text>
            </View>
          </View>

          <View
            style={[
              screenStyles.statBoxHorizontal,
              { backgroundColor: colors.secondaryLight, borderColor: colors.border },
            ]}>
            <View style={[screenStyles.statIconCircle, { backgroundColor: colors.secondary }]}>
              <Icon name="receipt" size={28} color={colors.textOnSecondary} />
            </View>
            <View style={screenStyles.statTextContainer}>
              <Text style={[screenStyles.statValue, { color: colors.textPrimary }]}>
                {totalExpenses}
              </Text>
              <Text style={[screenStyles.statLabel, { color: colors.textSecondary }]}>
                EXPENSES
              </Text>
            </View>
          </View>

          <View
            style={[
              screenStyles.statBoxHorizontal,
              styles.statCardWide,
              { backgroundColor: colors.accent1Light, borderColor: colors.border },
            ]}>
            <View style={[screenStyles.statIconCircle, { backgroundColor: colors.accent1Dark }]}>
              <Icon name="cash" size={28} color={colors.textOnSecondary} />
            </View>
            <View style={screenStyles.statTextContainer}>
              <Text style={[screenStyles.statValue, { color: colors.textPrimary }]}>
                ${totalAmount.toFixed(0)}
              </Text>
              <Text style={[screenStyles.statLabel, { color: colors.textSecondary }]}>
                TOTAL SPENT
              </Text>
            </View>
          </View>
        </View>

        {/* Section Title */}
        <View style={screenStyles.sectionHeader}>
          <Text style={[screenStyles.sectionTitle, { color: colors.textSecondary }]}>
            YOUR CATEGORIES
          </Text>
          <View style={[screenStyles.sectionLine, { backgroundColor: colors.border }]} />
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
                    {index % 4 === 0 && (
                      <View
                        style={[
                          styles.decorCircle,
                          {
                            backgroundColor: colors.whiteOverlay30,
                            borderColor: colors.whiteOverlay60,
                          },
                        ]}
                      />
                    )}
                    {index % 4 === 1 && (
                      <View
                        style={[
                          styles.decorSquare,
                          {
                            backgroundColor: colors.whiteOverlay30,
                            borderColor: colors.whiteOverlay60,
                          },
                        ]}
                      />
                    )}
                    {index % 4 === 2 && (
                      <View
                        style={[styles.decorTriangle, { borderBottomColor: colors.whiteOverlay30 }]}
                      />
                    )}
                    {index % 4 === 3 && (
                      <View
                        style={[
                          styles.decorPill,
                          {
                            backgroundColor: colors.whiteOverlay30,
                            borderColor: colors.whiteOverlay60,
                          },
                        ]}
                      />
                    )}
                  </View>

                  {/* Category Name */}
                  <View style={styles.categoryHeader}>
                    <Text
                      style={[styles.categoryName, { color: colors.textOnSecondary }]}
                      numberOfLines={2}>
                      {category.name.toUpperCase()}
                    </Text>
                  </View>

                  {/* Stats */}
                  {hasExpenses ? (
                    <View style={styles.categoryStats}>
                      <View style={styles.statRow}>
                        <Icon name="receipt-outline" size={16} color={colors.textOnSecondary} />
                        <Text style={[styles.categoryStatText, { color: colors.textOnSecondary }]}>
                          {stats.count}
                        </Text>
                      </View>
                      <View style={styles.statRow}>
                        <Icon name="cash-outline" size={16} color={colors.textOnSecondary} />
                        <Text style={[styles.categoryStatText, { color: colors.textOnSecondary }]}>
                          ${stats.total.toFixed(0)}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.categoryEmpty}>
                      <Text style={[styles.categoryEmptyText, { color: colors.textOnSecondary }]}>
                        No expenses yet
                      </Text>
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
        <View
          style={[
            screenStyles.infoBanner,
            { backgroundColor: colors.accent3Light, borderColor: colors.accent3 },
          ]}>
          <View style={[screenStyles.infoBannerDecor, { backgroundColor: colors.accent3 }]} />
          <View style={screenStyles.infoBannerContent}>
            <View
              style={[
                screenStyles.infoBannerIcon,
                { backgroundColor: colors.backgroundElevated, borderColor: colors.accent3 },
              ]}>
              <Icon name="color-palette" size={24} color={colors.accent3Dark} />
            </View>
            <View style={screenStyles.infoBannerTextContainer}>
              <Text style={[screenStyles.infoBannerTitle, { color: colors.textPrimary }]}>
                Unique Patterns
              </Text>
              <Text style={[screenStyles.infoBannerSubtitle, { color: colors.textSecondary }]}>
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
    backgroundColor: staticColors.whiteOverlay30,
    borderWidth: 2,
    borderColor: staticColors.whiteOverlay60,
  },
  decorSquare: {
    width: 45,
    height: 45,
    backgroundColor: staticColors.whiteOverlay30,
    borderWidth: 2,
    borderColor: staticColors.whiteOverlay60,
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
    borderBottomColor: staticColors.whiteOverlay30,
  },
  decorPill: {
    width: 50,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: staticColors.whiteOverlay30,
    borderWidth: 2,
    borderColor: staticColors.whiteOverlay60,
  },

  // Category Content - Category-specific layout
  categoryHeader: {
    marginBottom: spacing.md,
  },
  categoryName: {
    ...textStyles.h6,
    fontSize: 15,
    fontWeight: '800',
    color: staticColors.textOnSecondary,
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
    color: staticColors.textOnSecondary,
  },

  // Empty state per category
  categoryEmpty: {
    opacity: 0.6,
  },
  categoryEmptyText: {
    ...textStyles.caption,
    fontSize: 11,
    color: staticColors.textOnSecondary,
    fontStyle: 'italic',
  },

  // Category Arrow indicator
  categoryArrow: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
  },
});
