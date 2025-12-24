/**
 * Categories Screen - Neo-Memphis Edition
 * A visual showcase of expense categories with unique geometric patterns
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
  commonStyles,
  shadows,
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  const totalExpenses = (expenses || []).length;
  const totalAmount = (expenses || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);

  return (
    <View style={styles.container}>
      {/* Background decorations */}
      <View style={styles.bgDecor1} />
      <View style={styles.bgDecor2} />
      <View style={styles.bgDecor3} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerDecor} />
          <Text style={styles.headerTitle}>Categories</Text>
          <Text style={styles.headerSubtitle}>
            Organize your expenses with style
          </Text>
        </View>

        {/* Overall Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Icon name="albums" size={28} color={colors.primary} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{categories.length}</Text>
              <Text style={styles.statLabel}>CATEGORIES</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Icon name="receipt" size={28} color={colors.secondary} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{totalExpenses}</Text>
              <Text style={styles.statLabel}>EXPENSES</Text>
            </View>
          </View>

          <View style={[styles.statCard, styles.statCardWide]}>
            <View style={styles.statIcon}>
              <Icon name="cash" size={28} color={colors.accent1Dark} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>${totalAmount.toFixed(0)}</Text>
              <Text style={styles.statLabel}>TOTAL SPENT</Text>
            </View>
          </View>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>YOUR CATEGORIES</Text>
          <View style={styles.sectionLine} />
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
        <View style={styles.infoBanner}>
          <View style={styles.infoBannerDecor} />
          <View style={styles.infoBannerContent}>
            <View style={styles.infoBannerIcon}>
              <Icon name="color-palette" size={24} color={colors.accent3Dark} />
            </View>
            <View style={styles.infoBannerText}>
              <Text style={styles.infoBannerTitle}>Unique Patterns</Text>
              <Text style={styles.infoBannerSubtitle}>
                Each category has a distinctive color and border style for instant recognition
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: spacing.massive }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },

  // Loading
  loadingContainer: {
    ...commonStyles.loadingContainer,
  },
  loadingText: {
    ...textStyles.bodyBold,
    marginTop: spacing.md,
    color: colors.textSecondary,
  },

  // Background decorations
  bgDecor1: {
    position: 'absolute',
    top: -40,
    right: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.accent1,
    opacity: 0.15,
  },
  bgDecor2: {
    position: 'absolute',
    top: 200,
    left: -30,
    width: 100,
    height: 100,
    backgroundColor: colors.accent3,
    opacity: 0.2,
    transform: [{ rotate: '25deg' }],
  },
  bgDecor3: {
    position: 'absolute',
    bottom: 150,
    right: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondary,
    opacity: 0.2,
  },

  // Header
  header: {
    marginBottom: spacing.xl,
    position: 'relative',
  },
  headerDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 6,
    height: 70,
    backgroundColor: colors.secondary,
  },
  headerTitle: {
    ...textStyles.display2,
    paddingLeft: spacing.base,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...textStyles.h6,
    paddingLeft: spacing.base,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 3,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.medium,
  },
  statCardWide: {
    flex: 1,
    minWidth: '100%',
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    ...textStyles.h2,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...textStyles.labelSmall,
    fontSize: 10,
    color: colors.textSecondary,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    ...textStyles.labelMedium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  sectionLine: {
    flex: 1,
    height: 3,
    backgroundColor: colors.border,
  },

  // Categories Grid
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

  // Category Decorations - Unique geometric shapes
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

  // Category Content
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

  // Category Stats
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

  // Category Arrow
  categoryArrow: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
  },

  // Info Banner
  infoBanner: {
    backgroundColor: colors.accent3Light,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 3,
    borderColor: colors.accent3,
    position: 'relative',
    overflow: 'hidden',
  },
  infoBannerDecor: {
    position: 'absolute',
    top: -15,
    right: -15,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.accent3,
    opacity: 0.3,
  },
  infoBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.accent3,
  },
  infoBannerText: {
    flex: 1,
  },
  infoBannerTitle: {
    ...textStyles.h6,
    fontSize: 16,
    marginBottom: spacing.xs,
    color: colors.textPrimary,
  },
  infoBannerSubtitle: {
    ...textStyles.body,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
