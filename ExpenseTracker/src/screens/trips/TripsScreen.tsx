/**
 * Trips Screen
 * Displays list of all trips with search, filtering, and status indicators
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
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTripStore } from '../../stores/tripStore';
import { Trip } from '../../types/database';
import { format, isPast, isFuture } from 'date-fns';
import { colors, spacing, borderRadius, textStyles, commonStyles, shadows, fontWeights } from '../../styles';
import databaseService from '../../services/database/databaseService';
import { TripCard } from '../../components/cards/TripCard';
import { cardEntrance } from '../../utils/animations';

interface TripsScreenProps {
  navigation: any;
}

type TripStatus = 'upcoming' | 'active' | 'completed';

const getTripStatus = (trip: Trip): TripStatus => {
  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);

  if (isFuture(startDate)) {
    return 'upcoming';
  }
  if (isPast(endDate)) {
    return 'completed';
  }
  return 'active';
};

export const TripsScreen: React.FC<TripsScreenProps> = ({ navigation }) => {
  const { trips, fetchTrips, error, clearError } = useTripStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [tripStats, setTripStats] = useState<Map<number, { expenseCount: number; totalAmount: number }>>(new Map());
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [cardAnimations] = useState<Map<number, Animated.Value>>(new Map());
  const [buttonOpacityAnims] = useState<Map<number, Animated.Value>>(new Map());
  const [buttonTranslateAnims] = useState<Map<number, Animated.Value>>(new Map());

  const loadTrips = useCallback(async () => {
    try {
      await fetchTrips();
      // Fetch trip statistics
      const stats = await databaseService.getAllTripsStatistics();
      setTripStats(stats);
    } catch (err) {
      console.error('Failed to load trips:', err);
    }
  }, [fetchTrips]);

  // Reload trips and stats whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [loadTrips])
  );

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error, clearError]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTrips();
    setRefreshing(false);
  }, [loadTrips]);

  const filteredTrips = trips.filter(trip => {
    if (!searchQuery) {
      return true;
    }
    const query = searchQuery.toLowerCase();
    return (
      trip.name.toLowerCase().includes(query) ||
      trip.destination?.toLowerCase().includes(query) ||
      trip.purpose?.toLowerCase().includes(query)
    );
  });

  const handleCreateTrip = () => {
    navigation.navigate('CreateTrip');
  };

  const handleTripPress = (trip: Trip) => {
    navigation.navigate('TripDetail', { tripId: trip.id });
  };

  const renderTripCard = ({ item: trip }: { item: Trip }) => {
    const stats = tripStats.get(trip.id) || { expenseCount: 0, totalAmount: 0 };
    const isExpanded = expandedCards.has(trip.id);

    // Get or create animation value for dropdown
    if (!cardAnimations.has(trip.id)) {
      cardAnimations.set(trip.id, new Animated.Value(0));
    }
    const animatedHeight = cardAnimations.get(trip.id)!;

    // Get or create animation values for entrance (button fade in and slide up)
    if (!buttonOpacityAnims.has(trip.id)) {
      const opacityAnim = new Animated.Value(0);
      const translateAnim = new Animated.Value(30);
      buttonOpacityAnims.set(trip.id, opacityAnim);
      buttonTranslateAnims.set(trip.id, translateAnim);
      // Trigger entrance animation (synced with TripCard using cardEntrance)
      cardEntrance(opacityAnim, translateAnim, 0).start();
    }
    const buttonOpacity = buttonOpacityAnims.get(trip.id)!;
    const buttonTranslate = buttonTranslateAnims.get(trip.id)!;

    const toggleExpanded = () => {
      const newExpanded = new Set(expandedCards);
      if (isExpanded) {
        newExpanded.delete(trip.id);
      } else {
        newExpanded.add(trip.id);
      }
      setExpandedCards(newExpanded);

      Animated.spring(animatedHeight, {
        toValue: isExpanded ? 0 : 1,
        friction: 8,
        tension: 40,
        useNativeDriver: false,
      }).start();
    };

    const maxHeight = animatedHeight.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 200],
    });

    const arrowRotate = animatedHeight.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    return (
      <View style={styles.tripCardWrapper}>
        <TripCard trip={trip} onPress={() => handleTripPress(trip)} />

        {/* Expand/Collapse Arrow Button with entrance animation */}
        <Animated.View
          style={{
            opacity: buttonOpacity,
            transform: [{ translateY: buttonTranslate }],
          }}>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={toggleExpanded}
            activeOpacity={0.7}>
            <Animated.View style={{ transform: [{ rotate: arrowRotate }] }}>
              <Icon name="chevron-down" size={24} color={colors.primary} />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>

        {/* Expense Stats Footer - Animated */}
        <Animated.View
          style={[
            styles.statsFooter,
            {
              maxHeight,
              opacity: animatedHeight,
            },
          ]}>
          <View style={styles.statsFooterContent}>
            <View style={styles.statItem}>
              <Icon name="receipt" size={20} color={colors.primary} />
              <View style={styles.statTextContainer}>
                <Text style={styles.statValue}>{stats.expenseCount}</Text>
                <Text style={styles.statLabel}>{stats.expenseCount === 1 ? 'EXPENSE' : 'EXPENSES'}</Text>
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Icon name="cash" size={20} color={colors.accent1Dark} />
              <View style={styles.statTextContainer}>
                <Text style={styles.statValue}>${stats.totalAmount.toFixed(2)}</Text>
                <Text style={styles.statLabel}>TOTAL SPENT</Text>
              </View>
            </View>
          </View>

          {/* Purpose if available */}
          {trip.purpose && (
            <View style={styles.purposeSection}>
              <View style={styles.purposeHeader}>
                <Icon name="information-circle-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.purposeLabel}>PURPOSE</Text>
              </View>
              <Text style={styles.purposeText}>{trip.purpose}</Text>
            </View>
          )}
        </Animated.View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Trips Found</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery
          ? 'No trips match your search criteria'
          : 'Get started by creating your first business trip'}
      </Text>
      {!searchQuery && (
        <TouchableOpacity style={styles.emptyStateButton} onPress={handleCreateTrip}>
          <Text style={styles.emptyStateButtonText}>Create Trip</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Background geometric decorations */}
      <View style={styles.bgDecorCircle1} />
      <View style={styles.bgDecorCircle2} />
      <View style={styles.bgDecorSquare} />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search trips by name, destination, or purpose..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textDisabled}
        />
      </View>

      {/* Trip List */}
      <FlatList
        data={filteredTrips}
        renderItem={renderTripCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleCreateTrip}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.containerGray,
  },

  // Background decorations - Neo-Memphis style
  bgDecorCircle1: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accent1,
    opacity: 0.3,
  },
  bgDecorCircle2: {
    position: 'absolute',
    bottom: 100,
    left: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.secondary,
    opacity: 0.2,
  },
  bgDecorSquare: {
    position: 'absolute',
    top: 200,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: colors.accent3,
    opacity: 0.25,
    transform: [{ rotate: '25deg' }],
  },

  searchContainer: {
    backgroundColor: 'transparent',
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
    padding: spacing.lg,
    paddingBottom: 100,
  },

  // Trip Card Wrapper with Stats
  tripCardWrapper: {
    marginBottom: spacing.lg,
  },

  // Expand Button
  expandButton: {
    position: 'absolute',
    bottom: spacing.sm,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 3,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    ...shadows.medium,
  },

  // Stats Footer - Neo-Memphis Style
  statsFooter: {
    overflow: 'hidden',
    backgroundColor: colors.backgroundElevated,
    marginTop: -spacing.sm,
    marginHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    borderColor: colors.border,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    ...shadows.medium,
  },
  statsFooterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    paddingTop: spacing.lg,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    ...textStyles.h5,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    ...textStyles.labelSmall,
    fontSize: 9,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 3,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },

  // Purpose Section
  purposeSection: {
    borderTopWidth: 3,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  purposeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  purposeLabel: {
    ...textStyles.labelSmall,
    fontSize: 9,
    color: colors.textSecondary,
  },
  purposeText: {
    ...textStyles.body,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
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
