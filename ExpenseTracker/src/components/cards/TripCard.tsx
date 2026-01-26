/**
 * TripCard Component - Neo-Memphis Edition
 * Bold, geometric trip card for the home screen
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Trip } from '../../types/database';
import { format, differenceInDays } from 'date-fns';
import { colors as staticColors, spacing, borderRadius, textStyles, shadows } from '../../styles';
import { cardEntrance } from '../../utils/animations';
import { useTheme } from '../../contexts/ThemeContext';

interface TripCardProps {
  trip: Trip | null;
  onPress?: () => void;
  animationTrigger?: number; // Change this value to trigger re-animation
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onPress, animationTrigger }) => {
  const { colors } = useTheme();
  // Entrance animation
  const [opacityAnim] = useState(new Animated.Value(0));
  const [translateAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    // Trigger entrance animation when trip changes or animationTrigger changes
    opacityAnim.setValue(0);
    translateAnim.setValue(30);
    cardEntrance(opacityAnim, translateAnim, 0).start();
    // Animation refs are stable and don't need to be in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip?.id, animationTrigger]);

  if (!trip) {
    return (
      <View
        style={[
          styles.card,
          { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
        ]}>
        {/* Decorative elements for empty state */}
        <View style={[styles.emptyDecorCircle, { backgroundColor: colors.accent2 }]} />
        <View style={[styles.emptyDecorSquare, { backgroundColor: colors.accent4 }]} />

        <View style={styles.emptyState}>
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: colors.primaryLight, borderColor: colors.border },
            ]}>
            <Icon name="airplane" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No Active Trip</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
            Create a trip to start tracking your expenses
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
        <View
          style={[
            styles.badge,
            styles.badgeActive,
            { backgroundColor: colors.successLight, borderColor: colors.success },
          ]}>
          <View style={[styles.badgeDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.badgeText, { color: colors.success }]}>ACTIVE</Text>
        </View>
      );
    } else if (isUpcoming) {
      return (
        <View
          style={[
            styles.badge,
            styles.badgeUpcoming,
            { backgroundColor: colors.infoLight, borderColor: colors.info },
          ]}>
          <View
            style={[styles.badgeDot, styles.badgeDotUpcoming, { backgroundColor: colors.info }]}
          />
          <Text style={[styles.badgeText, styles.badgeTextUpcoming, { color: colors.info }]}>
            UPCOMING
          </Text>
        </View>
      );
    } else {
      return (
        <View
          style={[
            styles.badge,
            styles.badgePast,
            { backgroundColor: colors.backgroundTertiary, borderColor: colors.borderLight },
          ]}>
          <Icon name="checkmark-circle" size={14} color={colors.textSecondary} />
          <Text style={[styles.badgeText, styles.badgeTextPast, { color: colors.textSecondary }]}>
            COMPLETED
          </Text>
        </View>
      );
    }
  };

  const getDaysInfo = () => {
    if (isActive) {
      return daysRemaining === 0
        ? 'Last day!'
        : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`;
    } else if (isUpcoming) {
      const daysUntilStart = differenceInDays(startDate, today);
      return `Starts in ${daysUntilStart} day${daysUntilStart !== 1 ? 's' : ''}`;
    }
    return 'Trip completed';
  };

  const CardContent = (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundElevated,
          borderColor: colors.border,
          opacity: opacityAnim,
          transform: [{ translateY: translateAnim }],
        },
      ]}>
      {/* Geometric decorations */}
      <View style={[styles.cardDecor1, { backgroundColor: colors.accent1 }]} />
      <View style={[styles.cardDecor2, { backgroundColor: colors.secondary }]} />

      {/* Header */}
      <View style={styles.header}>
        <View
          style={[
            styles.headerIcon,
            { backgroundColor: colors.primaryLight, borderColor: colors.border },
          ]}>
          <Icon name="airplane" size={24} color={colors.primary} />
        </View>
        <View style={styles.headerContent}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>CURRENT TRIP</Text>
          <Text style={[styles.tripName, { color: colors.textPrimary }]} numberOfLines={2}>
            {trip.name}
          </Text>
        </View>
        {getStatusBadge()}
      </View>

      {/* Destination */}
      {trip.destination && (
        <View style={styles.destinationContainer}>
          <View
            style={[
              styles.destinationIcon,
              { backgroundColor: colors.secondaryLight, borderColor: colors.border },
            ]}>
            <Icon name="location" size={18} color={colors.secondary} />
          </View>
          <Text style={[styles.destination, { color: colors.textPrimary }]}>
            {trip.destination}
          </Text>
        </View>
      )}

      {/* Date Section */}
      <View style={[styles.dateSection, { borderColor: colors.border }]}>
        <View
          style={[
            styles.dateCard,
            { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
          ]}>
          <View
            style={[
              styles.dateIconContainer,
              { backgroundColor: colors.accent1Light, borderColor: colors.border },
            ]}>
            <Icon name="calendar-outline" size={20} color={colors.accent1Dark} />
          </View>
          <View style={styles.dateContent}>
            <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>START</Text>
            <Text style={[styles.dateValue, { color: colors.textPrimary }]}>
              {format(startDate, 'MMM dd')}
            </Text>
            <Text style={[styles.dateYear, { color: colors.textTertiary }]}>
              {format(startDate, 'yyyy')}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.dateSeparator,
            { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
          ]}>
          <Icon name="arrow-forward" size={20} color={colors.primary} />
        </View>

        <View
          style={[
            styles.dateCard,
            { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
          ]}>
          <View
            style={[
              styles.dateIconContainer,
              { backgroundColor: colors.accent1Light, borderColor: colors.border },
            ]}>
            <Icon name="calendar" size={20} color={colors.accent1Dark} />
          </View>
          <View style={styles.dateContent}>
            <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>END</Text>
            <Text style={[styles.dateValue, { color: colors.textPrimary }]}>
              {format(endDate, 'MMM dd')}
            </Text>
            <Text style={[styles.dateYear, { color: colors.textTertiary }]}>
              {format(endDate, 'yyyy')}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.daysInfoContainer}>
          <Icon
            name={isActive ? 'time' : isUpcoming ? 'hourglass-outline' : 'checkmark-done'}
            size={18}
            color={isActive ? colors.success : isUpcoming ? colors.secondary : colors.textSecondary}
          />
          <Text
            style={[
              styles.daysInfo,
              { color: colors.textSecondary },
              isActive && { color: colors.success },
              isUpcoming && { color: colors.secondary },
            ]}>
            {getDaysInfo()}
          </Text>
        </View>

        {onPress && (
          <View
            style={[
              styles.viewMoreContainer,
              { backgroundColor: colors.primaryLight, borderColor: colors.border },
            ]}>
            <Text style={[styles.viewMoreText, { color: colors.primary }]}>View Details</Text>
            <Icon name="arrow-forward" size={16} color={colors.primary} />
          </View>
        )}
      </View>
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: staticColors.backgroundElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    borderWidth: 3,
    borderColor: staticColors.border,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.large,
  },

  // Card Decorations
  cardDecor1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: staticColors.accent1,
    opacity: 0.15,
  },
  cardDecor2: {
    position: 'absolute',
    bottom: -15,
    left: -15,
    width: 60,
    height: 60,
    backgroundColor: staticColors.secondary,
    opacity: 0.15,
    transform: [{ rotate: '25deg' }],
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.base,
    gap: spacing.sm,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: staticColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: staticColors.border,
  },
  headerContent: {
    flex: 1,
  },
  label: {
    ...textStyles.labelSmall,
    fontSize: 10,
    color: staticColors.textSecondary,
    marginBottom: spacing.xs,
  },
  tripName: {
    ...textStyles.h4,
    lineHeight: 26,
  },

  // Status Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    gap: spacing.xs,
  },
  badgeActive: {
    backgroundColor: staticColors.successLight,
    borderColor: staticColors.success,
  },
  badgeUpcoming: {
    backgroundColor: staticColors.infoLight,
    borderColor: staticColors.info,
  },
  badgePast: {
    backgroundColor: staticColors.backgroundTertiary,
    borderColor: staticColors.borderLight,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: staticColors.success,
  },
  badgeDotUpcoming: {
    backgroundColor: staticColors.info,
  },
  badgeText: {
    ...textStyles.badge,
    fontSize: 9,
    color: staticColors.success,
  },
  badgeTextUpcoming: {
    color: staticColors.info,
  },
  badgeTextPast: {
    color: staticColors.textSecondary,
  },

  // Destination
  destinationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
    gap: spacing.sm,
  },
  destinationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: staticColors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: staticColors.border,
  },
  destination: {
    ...textStyles.bodyBold,
    fontSize: 16,
    color: staticColors.textPrimary,
  },

  // Date Section
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
    paddingVertical: spacing.md,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: staticColors.border,
    gap: spacing.sm,
  },
  dateCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: staticColors.backgroundSecondary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: staticColors.border,
    gap: spacing.sm,
  },
  dateIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: staticColors.accent1Light,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: staticColors.border,
  },
  dateContent: {
    flex: 1,
  },
  dateLabel: {
    ...textStyles.labelSmall,
    fontSize: 9,
    color: staticColors.textSecondary,
    marginBottom: 2,
  },
  dateValue: {
    ...textStyles.bodyBold,
    fontSize: 15,
    color: staticColors.textPrimary,
  },
  dateYear: {
    ...textStyles.caption,
    fontSize: 11,
    color: staticColors.textTertiary,
  },
  dateSeparator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: staticColors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: staticColors.border,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  daysInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  daysInfo: {
    ...textStyles.bodyBold,
    fontSize: 14,
    color: staticColors.textSecondary,
  },
  daysInfoActive: {
    color: staticColors.success,
  },
  daysInfoUpcoming: {
    color: staticColors.secondary,
  },
  viewMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: staticColors.primaryLight,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: staticColors.border,
  },
  viewMoreText: {
    ...textStyles.bodyBold,
    fontSize: 12,
    color: staticColors.primary,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    position: 'relative',
  },
  emptyDecorCircle: {
    position: 'absolute',
    top: 20,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: staticColors.accent2,
    opacity: 0.2,
  },
  emptyDecorSquare: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    width: 50,
    height: 50,
    backgroundColor: staticColors.accent4,
    opacity: 0.2,
    transform: [{ rotate: '20deg' }],
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: staticColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: staticColors.border,
  },
  emptyTitle: {
    ...textStyles.h5,
    color: staticColors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...textStyles.body,
    color: staticColors.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
