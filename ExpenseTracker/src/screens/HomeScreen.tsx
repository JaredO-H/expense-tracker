/**
 * Home Screen - Neo-Memphis Edition
 * Bold, playful dashboard with geometric decorations
 * Refactored to use centralized screenStyles
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
import { spacing, screenStyles } from '../styles';
import { float } from '../utils/animations';
import { useTheme } from '../contexts/ThemeContext';

type NavigationProp = NativeStackNavigationProp<any>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { trips, fetchTrips } = useTripStore();
  const { colors } = useTheme();
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
      <View style={[screenStyles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[screenStyles.loadingText, { color: colors.textPrimary }]}>Loading your expenses...</Text>
      </View>
    );
  }

  return (
    <View style={[screenStyles.screenWithDecorations, { backgroundColor: colors.background }]}>
      {/* Background geometric decorations with floating animation */}
      <Animated.View style={[screenStyles.bgDecorCircleMedium, { backgroundColor: colors.accent1, transform: [{ translateY: floatAnim1 }] }]} />
      <Animated.View style={[screenStyles.bgDecorCircleLargeBottom, { backgroundColor: colors.secondary, transform: [{ translateY: floatAnim2 }] }]} />
      <Animated.View style={[screenStyles.bgDecorSquare, { backgroundColor: colors.accent3, transform: [{ translateY: floatAnim3 }] }]} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={screenStyles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header with geometric accent */}
          <View style={screenStyles.headerWithAccent}>
            <View style={[screenStyles.decorativeAccentBar, { backgroundColor: colors.primary }]} />
            <Text style={[screenStyles.headerTitle, { color: colors.textPrimary }]}>Expense{'\n'}Tracker</Text>
          </View>

          {/* Current Trip Card */}
          <View style={screenStyles.section}>
            <TripCard trip={currentTrip} onPress={currentTrip ? handleTripPress : undefined} />
          </View>

          {/* Quick Actions Section */}
          <View style={screenStyles.section}>
            <Text style={[screenStyles.sectionTitle, { color: colors.textSecondary }]}>QUICK ACTIONS</Text>

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
                style={[screenStyles.actionButtonLarge, { backgroundColor: colors.primary, borderColor: colors.border }]}
                onPress={handleCaptureExpense}
                activeOpacity={0.8}>
                <View style={[screenStyles.actionButtonIcon, { backgroundColor: colors.whiteOverlay30, borderColor: colors.whiteOverlay60 }]}>
                  <Icon name="camera" size={28} color={colors.textInverse} />
                </View>
                <View style={screenStyles.actionButtonContent}>
                  <Text style={[screenStyles.actionButtonTitle, { color: colors.textInverse }]}>CAPTURE</Text>
                  <Text style={[screenStyles.actionButtonSubtitle, { color: colors.whiteOverlay80 }]}>Take a photo of your receipt</Text>
                </View>
                <Icon name="arrow-forward" size={28} color={colors.whiteOverlay80} />

                {/* Decorative element */}
                <View style={[screenStyles.buttonGeometricDecor, { backgroundColor: colors.whiteOverlay30 }]} />
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
                style={[screenStyles.actionButtonLarge, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                onPress={handleManualExpense}
                activeOpacity={0.8}>
                <View style={[screenStyles.actionButtonIcon, { backgroundColor: colors.accent1, borderColor: colors.border }]}>
                  <Icon name="create-outline" size={28} color={colors.textOnSecondary} />
                </View>
                <View style={screenStyles.actionButtonContent}>
                  <Text style={[screenStyles.actionButtonTitle, { color: colors.textOnSecondary }]}>
                    MANUAL ENTRY
                  </Text>
                  <Text style={[screenStyles.actionButtonSubtitle, { color: colors.textOnSecondary, opacity: 0.8 }]}>
                    Type in the details yourself
                  </Text>
                </View>
                <Icon name="arrow-forward" size={28} color={colors.textOnSecondary} />

                {/* Decorative element */}
                <View style={[screenStyles.buttonGeometricDecor, { backgroundColor: colors.accent1, opacity: 0.3 }]} />
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

// Minimal local styles - most styles now use centralized screenStyles
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});
