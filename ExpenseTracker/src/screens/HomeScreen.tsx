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
import { TripCard } from '../components/cards/TripCard';
import { useTripStore } from '../stores/tripStore';

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
    navigation.navigate('CreateExpense');
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
            <Text style={styles.buttonIconText}>📷</Text>
          </View>
          <View style={styles.buttonContent}>
            <Text style={styles.buttonTitle}>Capture Expense</Text>
            <Text style={styles.buttonSubtitle}>Take a photo of your receipt</Text>
          </View>
          <Text style={styles.buttonArrow}>›</Text>
        </TouchableOpacity>

        {/* Manual Entry Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handleManualExpense}
          activeOpacity={0.8}>
          <View style={[styles.buttonIcon, styles.secondaryButtonIcon]}>
            <Text style={styles.buttonIconText}>✏️</Text>
          </View>
          <View style={styles.buttonContent}>
            <Text style={[styles.buttonTitle, styles.secondaryButtonTitle]}>
              Add Expense (Manual)
            </Text>
            <Text style={[styles.buttonSubtitle, styles.secondaryButtonSubtitle]}>
              Enter expense details manually
            </Text>
          </View>
          <Text style={[styles.buttonArrow, styles.secondaryButtonArrow]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          💡 Tip: Use the camera to quickly capture receipts and let AI extract the details
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    marginBottom: 24,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  buttonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  secondaryButtonIcon: {
    backgroundColor: '#f3f4f6',
  },
  buttonIconText: {
    fontSize: 24,
  },
  buttonContent: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  secondaryButtonTitle: {
    color: '#111827',
  },
  buttonSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  secondaryButtonSubtitle: {
    color: '#6b7280',
  },
  buttonArrow: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 8,
  },
  secondaryButtonArrow: {
    color: '#9ca3af',
  },
  infoSection: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
});
