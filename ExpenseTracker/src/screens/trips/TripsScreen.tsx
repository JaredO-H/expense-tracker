/**
 * Trips Screen
 * Displays list of all trips with search, filtering, and status indicators
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
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTripStore } from '../../stores/tripStore';
import { Trip } from '../../types/database';
import { format, isPast, isFuture } from 'date-fns';
import {
  colors as staticColors,
  spacing,
  borderRadius,
  textStyles,
  commonStyles,
  shadows,
  screenStyles,
} from '../../styles';
import databaseService from '../../services/database/databaseService';
import { TripCard } from '../../components/cards/TripCard';
import { cardEntrance } from '../../utils/animations';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [tripStats, setTripStats] = useState<
    Map<number, { expenseCount: number; totalAmount: number }>
  >(new Map());
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
    }, [loadTrips]),
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
            style={[
              styles.expandButton,
              { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
            ]}
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
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.border,
            },
          ]}>
          <View style={styles.statsFooterContent}>
            <View style={styles.statItem}>
              <Icon name="receipt" size={20} color={colors.primary} />
              <View style={styles.statTextContainer}>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  {stats.expenseCount}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {stats.expenseCount === 1 ? 'EXPENSE' : 'EXPENSES'}
                </Text>
              </View>
            </View>

            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

            <View style={styles.statItem}>
              <Icon name="cash" size={20} color={colors.accent1Dark} />
              <View style={styles.statTextContainer}>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  ${stats.totalAmount.toFixed(2)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>TOTAL SPENT</Text>
              </View>
            </View>
          </View>

          {/* Purpose if available */}
          {trip.purpose && (
            <View style={[styles.purposeSection, { borderTopColor: colors.border }]}>
              <View style={styles.purposeHeader}>
                <Icon name="information-circle-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.purposeLabel, { color: colors.textSecondary }]}>PURPOSE</Text>
              </View>
              <Text style={[styles.purposeText, { color: colors.textPrimary }]}>
                {trip.purpose}
              </Text>
            </View>
          )}
        </Animated.View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={screenStyles.emptyStateContainer}>
      <View
        style={[
          screenStyles.emptyStateIcon,
          { backgroundColor: colors.primaryLight, borderColor: colors.border },
        ]}>
        <Icon name="airplane-outline" size={64} color={colors.primary} />
      </View>
      <Text style={[screenStyles.emptyStateTitle, { color: colors.textPrimary }]}>
        No Trips Found
      </Text>
      <Text style={[screenStyles.emptyStateText, { color: colors.textSecondary }]}>
        {searchQuery
          ? 'No trips match your search criteria'
          : 'Get started by creating your first business trip'}
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          style={[
            screenStyles.emptyStateButton,
            { backgroundColor: colors.primary, borderColor: colors.border },
          ]}
          onPress={handleCreateTrip}>
          <Icon
            name="add-circle"
            size={24}
            color={colors.textInverse}
            style={{ marginRight: spacing.sm }}
          />
          <Text style={[screenStyles.emptyStateButtonText, { color: colors.textInverse }]}>
            CREATE TRIP
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View
      style={[
        screenStyles.screenWithDecorations,
        styles.containerGray,
        { backgroundColor: colors.backgroundSecondary },
      ]}>
      {/* Background geometric decorations */}
      <View style={[screenStyles.bgDecorCircleMedium, { backgroundColor: colors.accent1 }]} />
      <View
        style={[screenStyles.bgDecorCircleLargeBottom, { backgroundColor: colors.secondary }]}
      />
      <View style={[screenStyles.bgDecorSquare, { backgroundColor: colors.accent3 }]} />

      {/* Search Bar */}
      <View style={[styles.searchContainer, { borderBottomColor: colors.border }]}>
        <TextInput
          style={[
            styles.searchInput,
            { backgroundColor: colors.backgroundTertiary, color: colors.textPrimary },
          ]}
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
        contentContainerStyle={screenStyles.listContentPadding}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      />

      {/* Floating Action Button */}
      <View style={[screenStyles.fabContainer, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          style={[screenStyles.fabButton, { backgroundColor: colors.primary }]}
          onPress={handleCreateTrip}>
          <Text style={[screenStyles.fabIconText, { color: colors.textInverse }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Minimal local styles - most styles now use centralized screenStyles
const styles = StyleSheet.create({
  // Container override for gray background
  containerGray: {
    backgroundColor: staticColors.backgroundSecondary,
  },

  // Search container (unique to this screen - no icon)
  searchContainer: {
    backgroundColor: 'transparent',
    padding: spacing.base,
    ...commonStyles.borderBottom,
  },
  searchInput: {
    backgroundColor: staticColors.backgroundTertiary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...textStyles.body,
  },

  // Trip Card Wrapper with Stats
  tripCardWrapper: {
    marginBottom: spacing.lg,
  },

  // Expand Button - unique interaction element
  expandButton: {
    position: 'absolute',
    bottom: spacing.sm,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: staticColors.backgroundElevated,
    borderWidth: 3,
    borderColor: staticColors.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    ...shadows.medium,
  },

  // Stats Footer - unique expandable stats (trip-specific feature)
  statsFooter: {
    overflow: 'hidden',
    backgroundColor: staticColors.backgroundElevated,
    marginTop: -spacing.sm,
    marginHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    borderColor: staticColors.border,
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
    color: staticColors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    ...textStyles.labelSmall,
    fontSize: 9,
    color: staticColors.textSecondary,
  },
  statDivider: {
    width: 3,
    height: 40,
    backgroundColor: staticColors.border,
    marginHorizontal: spacing.md,
  },

  // Purpose Section - trip-specific feature
  purposeSection: {
    borderTopWidth: 3,
    borderTopColor: staticColors.border,
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
    color: staticColors.textSecondary,
  },
  purposeText: {
    ...textStyles.body,
    fontSize: 14,
    color: staticColors.textPrimary,
    lineHeight: 20,
  },
});
