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
} from 'react-native';
import { useTripStore } from '../../stores/tripStore';
import { Trip } from '../../types/database';
import { format, isPast, isFuture } from 'date-fns';
import { colors, spacing, borderRadius, textStyles, commonStyles, shadows, fontWeights } from '../../styles';
import databaseService from '../../services/database/databaseService';

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

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

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
    const status = getTripStatus(trip);
    const stats = tripStats.get(trip.id) || { expenseCount: 0, totalAmount: 0 };

    return (
      <TouchableOpacity
        style={styles.tripCard}
        onPress={() => handleTripPress(trip)}
        activeOpacity={0.7}>
        <View style={styles.tripCardHeader}>
          <Text style={styles.tripName}>{trip.name}</Text>
          <View style={[styles.statusBadge, styles[`status_${status}`]]}>
            <Text style={styles.statusText}>{status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.tripCardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dates:</Text>
            <Text style={styles.infoValue}>
              {format(new Date(trip.start_date), 'MMM dd, yyyy')} -{' '}
              {format(new Date(trip.end_date), 'MMM dd, yyyy')}
            </Text>
          </View>

          {trip.destination && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Destination:</Text>
              <Text style={styles.infoValue}>{trip.destination}</Text>
            </View>
          )}

          {trip.purpose && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Purpose:</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                {trip.purpose}
              </Text>
            </View>
          )}

          <View style={styles.tripCardFooter}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.expenseCount}</Text>
                <Text style={styles.statLabel}>{stats.expenseCount === 1 ? 'expense' : 'expenses'}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>${stats.totalAmount.toFixed(2)}</Text>
                <Text style={styles.statLabel}>total</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
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
  tripCard: {
    ...commonStyles.card,
    marginBottom: spacing.base,
  },
  tripCardHeader: {
    ...commonStyles.flexRow,
    ...commonStyles.flexBetween,
    ...commonStyles.alignCenter,
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
  },
  tripName: {
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
  tripCardBody: {
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
  tripCardFooter: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundTertiary,
  },
  statsRow: {
    ...commonStyles.flexRow,
    ...commonStyles.flexBetween,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...textStyles.h4,
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.textTertiary,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.backgroundTertiary,
    marginHorizontal: spacing.md,
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
