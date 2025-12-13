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

  const loadTrips = useCallback(async () => {
    try {
      await fetchTrips();
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
    // Mock expense count - will be replaced with actual data later
    const expenseCount = 0;

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
            <Text style={styles.expenseCount}>{expenseCount} expenses (coming soon)</Text>
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
          placeholderTextColor="#9ca3af"
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3b82f6']} />
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
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tripName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  status_upcoming: {
    backgroundColor: '#dbeafe',
  },
  status_active: {
    backgroundColor: '#d1fae5',
  },
  status_completed: {
    backgroundColor: '#e5e7eb',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  tripCardBody: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    width: 90,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  tripCardFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  expenseCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  emptyStateButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
});
