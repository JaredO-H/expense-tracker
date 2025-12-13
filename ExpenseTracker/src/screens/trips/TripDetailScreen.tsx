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
        <ActivityIndicator size="large" color="#3b82f6" />
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
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#374151',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  summaryNote: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 8,
  },
  actionButtons: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#3b82f6',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
