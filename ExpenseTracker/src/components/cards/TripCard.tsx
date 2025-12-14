/**
 * TripCard Component
 * Displays current/active trip information on the home screen
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Trip } from '../../types/database';
import { format, differenceInDays } from 'date-fns';

interface TripCardProps {
  trip: Trip | null;
  onPress?: () => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onPress }) => {
  if (!trip) {
    return (
      <View style={styles.card}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Active Trip</Text>
          <Text style={styles.emptySubtitle}>
            Create a trip to start tracking expenses
          </Text>
        </View>
      </View>
    );
  }

  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysRemaining = differenceInDays(endDate, today);
  const isActive = today >= startDate && today <= endDate;
  const isUpcoming = today < startDate;

  const getStatusBadge = () => {
    if (isActive) {
      return (
        <View style={[styles.badge, styles.badgeActive]}>
          <Text style={styles.badgeText}>Active</Text>
        </View>
      );
    } else if (isUpcoming) {
      return (
        <View style={[styles.badge, styles.badgeUpcoming]}>
          <Text style={styles.badgeText}>Upcoming</Text>
        </View>
      );
    } else {
      return (
        <View style={[styles.badge, styles.badgePast]}>
          <Text style={styles.badgeText}>Completed</Text>
        </View>
      );
    }
  };

  const getDaysInfo = () => {
    if (isActive) {
      return daysRemaining === 0
        ? 'Last day'
        : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`;
    } else if (isUpcoming) {
      const daysUntilStart = differenceInDays(startDate, today);
      return `Starts in ${daysUntilStart} day${daysUntilStart !== 1 ? 's' : ''}`;
    }
    return 'Trip completed';
  };

  const CardContent = (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.label}>Current Trip</Text>
          <Text style={styles.tripName}>{trip.name}</Text>
        </View>
        {getStatusBadge()}
      </View>

      {trip.destination && (
        <View style={styles.row}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.destination}>{trip.destination}</Text>
        </View>
      )}

      <View style={styles.dateRow}>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Start</Text>
          <Text style={styles.dateValue}>
            {format(startDate, 'MMM dd, yyyy')}
          </Text>
        </View>
        <Text style={styles.dateSeparator}>→</Text>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>End</Text>
          <Text style={styles.dateValue}>
            {format(endDate, 'MMM dd, yyyy')}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.daysInfo}>{getDaysInfo()}</Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  tripName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: '#dcfce7',
  },
  badgeUpcoming: {
    backgroundColor: '#dbeafe',
  },
  badgePast: {
    backgroundColor: '#f3f4f6',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 16,
    marginRight: 6,
  },
  destination: {
    fontSize: 14,
    color: '#374151',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  dateSeparator: {
    fontSize: 16,
    color: '#9ca3af',
    marginHorizontal: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  daysInfo: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
