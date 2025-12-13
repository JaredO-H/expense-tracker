/**
 * Trip Form Component
 * Reusable form for creating and editing trips
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { format, isValid, parse } from 'date-fns';
import { Trip, CreateTripModel } from '../../types/database';

/**
 * Validates if a date string is in YYYY-MM-DD format and represents a valid date
 */
const isValidDateFormat = (dateString: string): boolean => {
  // Check if format matches YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }

  // Parse and validate the date
  const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
  if (!isValid(parsedDate)) {
    return false;
  }

  // Ensure the parsed date matches the input (catches invalid dates like 2024-13-45)
  const formattedBack = format(parsedDate, 'yyyy-MM-dd');
  return formattedBack === dateString;
};

interface TripFormProps {
  trip?: Trip; // If provided, form is in edit mode
  onSubmit: (data: CreateTripModel) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface TripFormData {
  name: string;
  start_date: string;
  end_date: string;
  destination: string;
  purpose: string;
}

export const TripForm: React.FC<TripFormProps> = ({
  trip,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<TripFormData>({
    defaultValues: {
      name: trip?.name || '',
      start_date: trip?.start_date || format(new Date(), 'yyyy-MM-dd'),
      end_date: trip?.end_date || format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'), // Tomorrow
      destination: trip?.destination || '',
      purpose: trip?.purpose || '',
    },
  });

  const startDate = watch('start_date');

  // Validate that end date is not before start date
  useEffect(() => {
    const endDate = watch('end_date');
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setValue('end_date', startDate);
    }
  }, [startDate, setValue, watch]);

  const onFormSubmit = (data: TripFormData) => {
    // Additional validation
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);

    if (end < start) {
      Alert.alert('Validation Error', 'End date cannot be before start date');
      return;
    }

    // Check maximum trip duration (90 days)
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (duration > 90) {
      Alert.alert('Validation Error', 'Trip duration cannot exceed 90 days for business travel');
      return;
    }

    // Check start date not too far in future (30 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxFutureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (start > maxFutureDate) {
      Alert.alert('Validation Error', 'Start date cannot be more than 30 days in the future');
      return;
    }

    onSubmit({
      name: data.name.trim(),
      start_date: data.start_date,
      end_date: data.end_date,
      destination: data.destination.trim() || undefined,
      purpose: data.purpose.trim() || undefined,
    });
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.formContent}>
        {/* Trip Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Trip Name <Text style={styles.required}>*</Text>
          </Text>
          <Controller
            control={control}
            name="name"
            rules={{
              required: 'Trip name is required',
              minLength: {
                value: 2,
                message: 'Trip name must be at least 2 characters',
              },
              maxLength: {
                value: 100,
                message: 'Trip name cannot exceed 100 characters',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="e.g., London Business Trip"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isLoading}
              />
            )}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
        </View>

        {/* Start Date */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Start Date <Text style={styles.required}>*</Text>
          </Text>
          <Controller
            control={control}
            name="start_date"
            rules={{
              required: 'Start date is required',
              validate: {
                validFormat: value =>
                  isValidDateFormat(value) ||
                  'Invalid date format. Use YYYY-MM-DD (e.g., 2024-12-25)',
              },
            }}
            render={({ field: { onChange, value } }) => (
              <View>
                <TextInput
                  style={[styles.input, errors.start_date && styles.inputError]}
                  placeholder="YYYY-MM-DD"
                  value={value}
                  onChangeText={onChange}
                  editable={!isLoading}
                />
                <Text style={styles.hint}>Format: YYYY-MM-DD</Text>
              </View>
            )}
          />
          {errors.start_date && <Text style={styles.errorText}>{errors.start_date.message}</Text>}
        </View>

        {/* End Date */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            End Date <Text style={styles.required}>*</Text>
          </Text>
          <Controller
            control={control}
            name="end_date"
            rules={{
              required: 'End date is required',
              validate: {
                validFormat: value =>
                  isValidDateFormat(value) ||
                  'Invalid date format. Use YYYY-MM-DD (e.g., 2024-12-25)',
              },
            }}
            render={({ field: { onChange, value } }) => (
              <View>
                <TextInput
                  style={[styles.input, errors.end_date && styles.inputError]}
                  placeholder="YYYY-MM-DD"
                  value={value}
                  onChangeText={onChange}
                  editable={!isLoading}
                />
                <Text style={styles.hint}>Format: YYYY-MM-DD (must be ≥ start date)</Text>
              </View>
            )}
          />
          {errors.end_date && <Text style={styles.errorText}>{errors.end_date.message}</Text>}
        </View>

        {/* Destination */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Destination</Text>
          <Controller
            control={control}
            name="destination"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="e.g., London, UK"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isLoading}
              />
            )}
          />
        </View>

        {/* Purpose */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Business Purpose</Text>
          <Controller
            control={control}
            name="purpose"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g., Client meeting, Conference"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!isLoading}
              />
            )}
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={isLoading}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit(onFormSubmit)}
            disabled={isLoading}>
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Saving...' : trip ? 'Update Trip' : 'Create Trip'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContent: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#e53e3e',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#e53e3e',
  },
  textArea: {
    minHeight: 80,
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#e53e3e',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
