/**
 * TripCard Component
 * Displays current/active trip information on the home screen
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Trip } from '../../types/database';
import { format, differenceInDays } from 'date-fns';
import { colors, spacing, borderRadius, textStyles, shadows } from '../../styles';

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
          <Icon name="location" size={16} color={colors.primary} style={styles.icon} />
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
        <Icon name="arrow-forward" size={16} color={colors.textDisabled} style={styles.dateSeparator} />
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
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginVertical: spacing.sm,
    ...shadows.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  label: {
    ...textStyles.labelSmall,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  tripName: {
    ...textStyles.h4,
    color: colors.textPrimary,
  },
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  badgeActive: {
    backgroundColor: colors.successLight,
  },
  badgeUpcoming: {
    backgroundColor: colors.infoLight,
  },
  badgePast: {
    backgroundColor: colors.backgroundTertiary,
  },
  badgeText: {
    ...textStyles.badge,
    color: colors.success,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    marginRight: spacing.xs + 2,
  },
  destination: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    ...textStyles.labelSmall,
    marginBottom: spacing.xs,
  },
  dateValue: {
    ...textStyles.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dateSeparator: {
    marginHorizontal: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  daysInfo: {
    ...textStyles.bodySmall,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    ...textStyles.h6,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...textStyles.body,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
