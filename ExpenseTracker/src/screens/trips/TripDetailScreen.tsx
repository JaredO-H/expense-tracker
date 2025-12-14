/**
 * Trip Detail Screen
 * Displays trip details with edit and delete capabilities
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTripStore } from '../../stores/tripStore';
import { TripForm } from '../../components/forms/TripForm';
import { CreateTripModel } from '../../types/database';
import { format } from 'date-fns';
import { colors, spacing, textStyles, commonStyles } from '../../styles';

interface TripDetailScreenProps {
  route: any;
  navigation: any;
}

export const TripDetailScreen: React.FC<TripDetailScreenProps> = ({ route, navigation }) => {
  const { tripId } = route.params;
  const { trips, updateTrip, deleteTrip, isLoading } = useTripStore();
  const [isEditing, setIsEditing] = useState(false);

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isEditing) {
    return (
      <View style={styles.container}>
        <TripForm
          trip={trip}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isLoading={isLoading}
        />
      </View>
    );
  }

  // Mock expense count - will be replaced with actual data later
  const expenseCount = 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Trip Information Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Trip Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{trip.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Start Date</Text>
            <Text style={styles.infoValue}>
              {format(new Date(trip.start_date), 'MMMM dd, yyyy')}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>End Date</Text>
            <Text style={styles.infoValue}>{format(new Date(trip.end_date), 'MMMM dd, yyyy')}</Text>
          </View>

          {trip.destination && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Destination</Text>
              <Text style={styles.infoValue}>{trip.destination}</Text>
            </View>
          )}

          {trip.purpose && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Purpose</Text>
              <Text style={styles.infoValue}>{trip.purpose}</Text>
            </View>
          )}
        </View>

        {/* Expense Summary Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Expense Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={styles.summaryValue}>{expenseCount} expenses</Text>
          </View>
          <Text style={styles.summaryNote}>
            Expense tracking will be available in a future update
          </Text>
        </View>

        {/* Metadata Card */}
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>
              {format(new Date(trip.created_at), 'MMM dd, yyyy HH:mm')}
            </Text>
          </View>
          {trip.updated_at && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Updated</Text>
              <Text style={styles.infoValue}>
                {format(new Date(trip.updated_at), 'MMM dd, yyyy HH:mm')}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => setIsEditing(true)}>
            <Text style={styles.editButtonText}>Edit Trip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Trip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.containerGray,
  },
  loadingContainer: {
    ...commonStyles.loadingContainer,
  },
  content: {
    padding: spacing.base,
  },
  card: {
    ...commonStyles.card,
    marginBottom: spacing.base,
  },
  sectionTitle: {
    ...textStyles.h5,
    marginBottom: spacing.base,
  },
  infoRow: {
    marginBottom: spacing.md,
  },
  infoLabel: {
    ...textStyles.labelSmall,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    ...textStyles.bodyLarge,
  },
  summaryRow: {
    ...commonStyles.flexRow,
    ...commonStyles.flexBetween,
    ...commonStyles.alignCenter,
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...textStyles.bodyLarge,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...textStyles.bodyLarge,
    fontWeight: textStyles.label.fontWeight,
  },
  summaryNote: {
    ...textStyles.caption,
    color: colors.textDisabled,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  actionButtons: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionButton: {
    ...commonStyles.button,
  },
  editButton: {
    ...commonStyles.buttonPrimary,
  },
  editButtonText: {
    ...textStyles.button,
  },
  deleteButton: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.errorDark,
  },
  deleteButtonText: {
    ...textStyles.button,
    color: colors.errorDark,
  },
});
