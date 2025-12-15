/**
 * Home Screen
 * Main landing screen with quick actions and current trip overview
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { TripCard } from '../components/cards/TripCard';
import { useTripStore } from '../stores/tripStore';
import { colors, spacing, borderRadius, textStyles, commonStyles, shadows } from '../styles';

type NavigationProp = NativeStackNavigationProp<any>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { trips, fetchTrips } = useTripStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTrips = async () => {
      try {
        await fetchTrips();
      } catch (error) {
        console.error('Failed to load trips:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTrips();
  }, [fetchTrips]);

  // Get the current or most recent active trip
  const getCurrentTrip = () => {
    if (trips.length === 0) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // First, try to find an active trip
    const activeTrip = trips.find(trip => {
      const startDate = new Date(trip.start_date);
      const endDate = new Date(trip.end_date);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      return today >= startDate && today <= endDate && trip.status === 'active';
    });

    if (activeTrip) return activeTrip;

    // If no active trip, find the next upcoming trip
    const upcomingTrip = trips
      .filter(trip => {
        const startDate = new Date(trip.start_date);
        startDate.setHours(0, 0, 0, 0);
        return today < startDate && trip.status === 'active';
      })
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())[0];

    if (upcomingTrip) return upcomingTrip;

    // Otherwise, return the most recent trip
    return trips.sort(
      (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    )[0];
  };

  const currentTrip = getCurrentTrip();

  const handleCaptureExpense = () => {
    navigation.navigate('Camera');
  };

  const handleManualExpense = () => {
    navigation.navigate('CreateExpense', { tripId: currentTrip?.id });
  };

  const handleTripPress = () => {
    if (currentTrip) {
      navigation.navigate('TripDetail', { tripId: currentTrip.id });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Expense Tracker</Text>
        <Text style={styles.headerSubtitle}>Track your business expenses easily</Text>
      </View>

      {/* Current Trip Card */}
      <View style={styles.section}>
        <TripCard trip={currentTrip} onPress={currentTrip ? handleTripPress : undefined} />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        {/* Capture Expense Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleCaptureExpense}
          activeOpacity={0.8}>
          <View style={styles.buttonIcon}>
            <Icon name="camera" size={24} color={colors.textInverse} />
          </View>
          <View style={styles.buttonContent}>
            <Text style={styles.buttonTitle}>Capture Expense</Text>
            <Text style={styles.buttonSubtitle}>Take a photo of your receipt</Text>
          </View>
          <Icon name="chevron-forward" size={24} color={colors.whiteOverlay60} />
        </TouchableOpacity>

        {/* Manual Entry Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handleManualExpense}
          activeOpacity={0.8}>
          <View style={[styles.buttonIcon, styles.secondaryButtonIcon]}>
            <Icon name="create-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.buttonContent}>
            <Text style={[styles.buttonTitle, styles.secondaryButtonTitle]}>
              Add Expense (Manual)
            </Text>
            <Text style={[styles.buttonSubtitle, styles.secondaryButtonSubtitle]}>
              Enter expense details manually
            </Text>
          </View>
          <Icon name="chevron-forward" size={24} color={colors.textDisabled} />
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.infoContent}>
          <Icon name="bulb" size={20} color={colors.primary} style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Tip: Use the camera to quickly capture receipts and let AI extract the details
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.flex1,
    backgroundColor: colors.backgroundSecondary,
  },
  contentContainer: {
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    ...commonStyles.loadingContainer,
  },
  loadingText: {
    ...commonStyles.loadingText,
  },
  header: {
    marginBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
  headerTitle: {
    ...textStyles.h2,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...textStyles.bodyLarge,
    color: colors.textTertiary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...textStyles.h5,
    marginBottom: spacing.md,
  },
  actionButton: {
    ...commonStyles.flexRow,
    alignItems: 'center',
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.whiteOverlay20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  secondaryButtonIcon: {
    backgroundColor: colors.backgroundTertiary,
  },
  buttonContent: {
    flex: 1,
  },
  buttonTitle: {
    ...textStyles.h6,
    color: colors.textInverse,
    marginBottom: 2,
  },
  secondaryButtonTitle: {
    color: colors.textPrimary,
  },
  buttonSubtitle: {
    ...textStyles.bodySmall,
    color: colors.whiteOverlay80,
  },
  secondaryButtonSubtitle: {
    color: colors.textTertiary,
  },
  infoSection: {
    backgroundColor: colors.infoBg,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: spacing.sm,
  },
  infoText: {
    ...textStyles.body,
    color: colors.info,
    flex: 1,
  },
});
