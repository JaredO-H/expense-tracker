/**
 * Home Screen - Neo-Memphis Edition
 * Bold, playful dashboard with geometric decorations
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { TripCard } from '../components/cards/TripCard';
import { useTripStore } from '../stores/tripStore';
import { colors, spacing, borderRadius, textStyles, commonStyles, shadows, geometricShapes } from '../styles';
import { float } from '../utils/animations';

type NavigationProp = NativeStackNavigationProp<any>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { trips, fetchTrips } = useTripStore();
  const [isLoading, setIsLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Floating background animations
  const [floatAnim1] = useState(new Animated.Value(0));
  const [floatAnim2] = useState(new Animated.Value(0));
  const [floatAnim3] = useState(new Animated.Value(0));

  // Button staggered animations
  const [button1Anim] = useState(new Animated.Value(0));
  const [button2Anim] = useState(new Animated.Value(0));

  useEffect(() => {
    const loadTrips = async () => {
      try {
        await fetchTrips();
      } catch (error) {
        console.error('Failed to load trips:', error);
      } finally {
        setIsLoading(false);
        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();

        // Staggered button animations
        Animated.sequence([
          Animated.delay(200),
          Animated.parallel([
            Animated.timing(button1Anim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(button2Anim, {
              toValue: 1,
              duration: 500,
              delay: 150,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      }
    };
    loadTrips();
  }, [fetchTrips]);

  // Start floating animations
  useEffect(() => {
    float(floatAnim1, 20, 4500).start();
    float(floatAnim2, 15, 5000).start();
    float(floatAnim3, 18, 3800).start();
  }, []);

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
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your expenses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background geometric decorations with floating animation */}
      <Animated.View style={[styles.bgDecorCircle1, { transform: [{ translateY: floatAnim1 }] }]} />
      <Animated.View style={[styles.bgDecorCircle2, { transform: [{ translateY: floatAnim2 }] }]} />
      <Animated.View style={[styles.bgDecorSquare, { transform: [{ translateY: floatAnim3 }] }]} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header with geometric accent */}
          <View style={styles.header}>
            <View style={styles.headerDecor} />
            <Text style={styles.headerTitle}>Expense{'\n'}Tracker</Text>
          </View>

          {/* Current Trip Card */}
          <View style={styles.section}>
            <TripCard trip={currentTrip} onPress={currentTrip ? handleTripPress : undefined} />
          </View>

          {/* Quick Actions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>

            {/* Capture Expense Button - Primary with staggered animation */}
            <Animated.View
              style={{
                opacity: button1Anim,
                transform: [
                  {
                    translateY: button1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              }}>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={handleCaptureExpense}
                activeOpacity={0.8}>
              <View style={styles.buttonIconContainer}>
                <Icon name="camera" size={28} color={colors.textInverse} />
              </View>
              <View style={styles.buttonContent}>
                <Text style={styles.buttonTitle}>CAPTURE</Text>
                <Text style={styles.buttonSubtitle}>Take a photo of your receipt</Text>
              </View>
              <Icon name="arrow-forward" size={28} color={colors.whiteOverlay80} />

              {/* Decorative element */}
              <View style={styles.buttonDecor} />
              </TouchableOpacity>
            </Animated.View>

            {/* Manual Entry Button - Secondary with staggered animation */}
            <Animated.View
              style={{
                opacity: button2Anim,
                transform: [
                  {
                    translateY: button2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              }}>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={handleManualExpense}
                activeOpacity={0.8}>
              <View style={[styles.buttonIconContainer, styles.secondaryButtonIcon]}>
                <Icon name="create-outline" size={28} color={colors.textOnSecondary} />
              </View>
              <View style={styles.buttonContent}>
                <Text style={[styles.buttonTitle, styles.secondaryButtonTitle]}>
                  MANUAL ENTRY
                </Text>
                <Text style={[styles.buttonSubtitle, styles.secondaryButtonSubtitle]}>
                  Type in the details yourself
                </Text>
              </View>
              <Icon name="arrow-forward" size={28} color={colors.textSecondary} />

              {/* Decorative element */}
              <View style={[styles.buttonDecor, styles.buttonDecorSecondary]} />
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Bottom spacing */}
          <View style={{ height: spacing.massive }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.flex1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  loadingContainer: {
    ...commonStyles.loadingContainer,
  },
  loadingText: {
    ...textStyles.bodyBold,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },

  // Background decorations
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

  // Header
  header: {
    marginBottom: spacing.xxl,
    paddingTop: spacing.base,
    position: 'relative',
  },
  headerDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 6,
    height: 60,
    backgroundColor: colors.primary,
  },
  headerTitle: {
    ...textStyles.display2,
    marginBottom: spacing.xs,
    paddingLeft: spacing.base,
  },
  headerSubtitle: {
    ...textStyles.h6,
    color: colors.textSecondary,
    paddingLeft: spacing.base,
    fontWeight: '500',
  },

  // Section
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...textStyles.labelMedium,
    marginBottom: spacing.base,
    color: colors.textSecondary,
  },

  // Action Buttons - Bold Memphis style
  actionButton: {
    ...commonStyles.flexRow,
    alignItems: 'center',
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.base,
    borderWidth: 3,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.medium,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },

  buttonIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.whiteOverlay30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: colors.whiteOverlay60,
  },
  secondaryButtonIcon: {
    backgroundColor: colors.accent1,
    borderColor: colors.border,
  },

  buttonContent: {
    flex: 1,
  },
  buttonTitle: {
    ...textStyles.h6,
    color: colors.textInverse,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  secondaryButtonTitle: {
    color: colors.textOnSecondary,
  },
  buttonSubtitle: {
    ...textStyles.bodySmall,
    color: colors.whiteOverlay80,
    fontWeight: '500',
  },
  secondaryButtonSubtitle: {
    color: colors.textOnSecondary,
    opacity: 0.8,
  },

  // Geometric button decoration
  buttonDecor: {
    position: 'absolute',
    bottom: -15,
    right: -15,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.whiteOverlay20,
  },
  buttonDecorSecondary: {
    backgroundColor: colors.accent3,
    opacity: 0.4,
  },

  // Info Banner
  infoSection: {
    backgroundColor: colors.accent1Light,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    borderColor: colors.warning,
    position: 'relative',
    overflow: 'hidden',
  },
  infoDecor: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    backgroundColor: colors.accent1,
    opacity: 0.3,
    transform: [{ rotate: '45deg' }],
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: colors.warning,
  },
  infoText: {
    ...textStyles.body,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  infoTextBold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
