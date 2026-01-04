/**
 * Trip Detail Screen
 * Displays trip details with edit and delete capabilities
 * Refactored to use centralized screenStyles
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTripStore } from '../../stores/tripStore';
import { TripForm } from '../../components/forms/TripForm';
import { CreateTripModel } from '../../types/database';
import { format } from 'date-fns';
import {
  colors as staticColors,
  spacing,
  textStyles,
  commonStyles,
  screenStyles,
} from '../../styles';
import databaseService from '../../services/database/databaseService';
import { useTheme } from '../../contexts/ThemeContext';

interface TripDetailScreenProps {
  route: any;
  navigation: any;
}

export const TripDetailScreen: React.FC<TripDetailScreenProps> = ({ route, navigation }) => {
  const { tripId } = route.params;
  const { trips, updateTrip, deleteTrip, isLoading } = useTripStore();
  const { colors, themeVersion } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [tripStats, setTripStats] = useState({ expenseCount: 0, totalAmount: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  const trip = trips.find(t => t.id === tripId);

  useEffect(() => {
    if (!trip) {
      Alert.alert('Error', 'Trip not found', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    }
  }, [trip, navigation]);

  useEffect(() => {
    if (trip) {
      navigation.setOptions({
        title: trip.name,
      });
    }
  }, [trip, navigation]);

  // Reload stats whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (trip) {
        const loadStats = async () => {
          setLoadingStats(true);
          try {
            const stats = await databaseService.getTripStatistics(trip.id);
            setTripStats(stats);
          } catch (error) {
            console.error('Failed to load trip statistics:', error);
          } finally {
            setLoadingStats(false);
          }
        };
        loadStats();
      }
    }, [trip]),
  );

  const handleUpdate = async (data: CreateTripModel) => {
    if (!trip) {
      return;
    }

    try {
      await updateTrip({
        id: trip.id,
        ...data,
      });
      setIsEditing(false);
      Alert.alert('Success', 'Trip updated successfully');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update trip');
    }
  };

  const handleDelete = () => {
    if (!trip) {
      return;
    }

    Alert.alert(
      'Delete Trip',
      `Are you sure you want to delete "${trip.name}"?\n\nNote: Trips with expenses cannot be deleted. You must delete or reassign expenses first.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTrip(trip.id);
              Alert.alert('Success', 'Trip deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to delete trip',
              );
            }
          },
        },
      ],
    );
  };

  if (!trip) {
    return (
      <View style={[screenStyles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isEditing) {
    return (
      <View style={[screenStyles.screenContainer, { backgroundColor: colors.background }]}>
        <TripForm
          trip={trip}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isLoading={isLoading}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.containerGray, { backgroundColor: colors.backgroundSecondary }]}
      key={themeVersion}>
      <View style={styles.content}>
        {/* Trip Information Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
          ]}>
          <Text style={[screenStyles.sectionTitle, { color: colors.textSecondary }]}>
            Trip Information
          </Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Name</Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{trip.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Start Date</Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {format(new Date(trip.start_date), 'MMMM dd, yyyy')}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>End Date</Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {format(new Date(trip.end_date), 'MMMM dd, yyyy')}
            </Text>
          </View>

          {trip.destination && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Destination</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {trip.destination}
              </Text>
            </View>
          )}

          {trip.purpose && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Purpose</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{trip.purpose}</Text>
            </View>
          )}
        </View>

        {/* Expense Summary Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
          ]}>
          <View style={styles.summaryHeader}>
            <Text style={[screenStyles.sectionTitle, { color: colors.textSecondary }]}>
              Expense Summary
            </Text>
            {tripStats.expenseCount > 0 && (
              <TouchableOpacity
                style={styles.viewExpensesButton}
                onPress={() => navigation.navigate('ExpensesTab', { tripId: trip.id })}>
                <Text style={[styles.viewExpensesButtonText, { color: colors.primary }]}>
                  View Expenses →
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {loadingStats ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {tripStats.expenseCount}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                  {tripStats.expenseCount === 1 ? 'expense' : 'expenses'}
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  ${tripStats.totalAmount.toFixed(2)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>total amount</Text>
              </View>
            </View>
          )}

          {!loadingStats && tripStats.expenseCount === 0 && (
            <TouchableOpacity
              style={[styles.addExpensePrompt, { backgroundColor: colors.backgroundTertiary }]}
              onPress={() => navigation.navigate('CreateExpense')}>
              <Text style={[styles.addExpenseText, { color: colors.textSecondary }]}>
                No expenses yet. Tap to add one.
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Metadata Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
          ]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Created</Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {format(new Date(trip.created_at), 'MMM dd, yyyy HH:mm')}
            </Text>
          </View>
          {trip.updated_at && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Last Updated</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {format(new Date(trip.updated_at), 'MMM dd, yyyy HH:mm')}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {tripStats.expenseCount > 0 && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.exportButton,
                { backgroundColor: colors.success, borderColor: colors.border },
              ]}
              onPress={() => navigation.navigate('ExportScreen', { tripId: trip.id })}>
              <Text style={[styles.exportButtonText, { color: colors.textInverse }]}>
                Export Trip
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.editButton,
              { backgroundColor: colors.primary, borderColor: colors.border },
            ]}
            onPress={() => setIsEditing(true)}>
            <Text style={[styles.editButtonText, { color: colors.textInverse }]}>Edit Trip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.deleteButton,
              { backgroundColor: colors.background, borderColor: colors.errorDark },
            ]}
            onPress={handleDelete}>
            <Text style={[styles.deleteButtonText, { color: colors.errorDark }]}>Delete Trip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

// Minimal local styles - colors are applied dynamically via inline styles
const styles = StyleSheet.create({
  // Gray container for detail view
  containerGray: {
    flex: 1,
  },

  // Content padding
  content: {
    padding: spacing.base,
  },

  // Card - uses common card style
  card: {
    ...commonStyles.card,
    marginBottom: spacing.base,
  },

  // Info Row - Key-value pair display pattern
  infoRow: {
    marginBottom: spacing.md,
  },
  infoLabel: {
    ...textStyles.labelSmall,
    marginBottom: spacing.xs,
  },
  infoValue: {
    ...textStyles.bodyLarge,
  },

  // Summary Header - Header with action link
  summaryHeader: {
    ...commonStyles.flexRow,
    ...commonStyles.flexBetween,
    ...commonStyles.alignCenter,
    marginBottom: spacing.md,
  },
  viewExpensesButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  viewExpensesButtonText: {
    ...textStyles.caption,
    fontWeight: '600',
  },

  // Stats Display
  statsContainer: {
    ...commonStyles.flexRow,
    ...commonStyles.flexBetween,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...textStyles.h3,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...textStyles.caption,
  },
  statDivider: {
    width: 1,
    height: 40,
    marginHorizontal: spacing.lg,
  },

  // Empty State Prompt
  addExpensePrompt: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.sm,
    alignItems: 'center',
  },
  addExpenseText: {
    ...textStyles.body,
  },

  // Action Buttons
  actionButtons: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionButton: {
    ...commonStyles.button,
  },
  exportButton: {
    // Background color applied dynamically
  },
  exportButtonText: {
    ...textStyles.button,
  },
  editButton: {
    // Background color applied dynamically
  },
  editButtonText: {
    ...textStyles.button,
  },
  deleteButton: {
    borderWidth: 2,
  },
  deleteButtonText: {
    ...textStyles.button,
  },
});
