/**
 * Trip Form Component
 * Reusable form for creating and editing trips
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useForm, Controller } from 'react-hook-form';
import { format } from 'date-fns';
import { Trip, CreateTripModel } from '../../types/database';
import { colors, spacing, textStyles, commonStyles } from '../../styles';
import { useTheme } from '../../contexts/ThemeContext';
import { getDateFormat } from '../../utils/generalSettings';
import { formatDateToDisplay, parseDisplayToISO } from '../../utils/dateFormatHelpers';

const CURRENCIES = [
  { label: 'US Dollar (USD)', value: 'USD' },
  { label: 'Canadian Dollar (CAD)', value: 'CAD' },
  { label: 'Euro (EUR)', value: 'EUR' },
  { label: 'British Pound (GBP)', value: 'GBP' },
  { label: 'Japanese Yen (JPY)', value: 'JPY' },
  { label: 'Australian Dollar (AUD)', value: 'AUD' },
  { label: 'Swiss Franc (CHF)', value: 'CHF' },
  { label: 'Singapore Dollar (SGD)', value: 'SGD' },
  { label: 'Indian Rupee (INR)', value: 'INR' },
  { label: 'Vietnamese Dong (VND)', value: 'VND' },
];

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
  default_currency: string;
}

export const TripForm: React.FC<TripFormProps> = ({
  trip,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { colors: themeColors } = useTheme();
  const [dateFormat, setDateFormat] = useState<string>('YYYY-MM-DD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDateFormat = async () => {
      try {
        const format = await getDateFormat();
        setDateFormat(format);
      } catch (error) {
        console.error('Failed to load date format:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDateFormat();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<TripFormData>({
    defaultValues: {
      name: trip?.name || '',
      start_date: trip?.start_date || format(new Date(), 'yyyy-MM-dd'),
      end_date: trip?.end_date || format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'), // Tomorrow
      destination: trip?.destination || '',
      purpose: trip?.purpose || '',
      default_currency: trip?.default_currency || 'USD',
    },
  });

  const startDate = watch('start_date');

  // Reset form when trip prop changes (important for edit mode)
  useEffect(() => {
    if (trip) {
      reset({
        name: trip.name || '',
        start_date: trip.start_date || format(new Date(), 'yyyy-MM-dd'),
        end_date: trip.end_date || format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'),
        destination: trip.destination || '',
        purpose: trip.purpose || '',
        default_currency: trip.default_currency || 'USD',
      });
    }
  }, [trip, reset]);

  // Validate that end date is not before start date
  useEffect(() => {
    const endDate = watch('end_date');
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setValue('end_date', startDate);
    }
  }, [startDate, setValue, watch]);

  const onFormSubmit = (data: TripFormData) => {
    // Dates are already in ISO format from form state (converted in onChangeText handlers)
    const startISO = data.start_date;
    const endISO = data.end_date;

    // Additional validation
    const start = new Date(startISO);
    const end = new Date(endISO);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      Alert.alert('Validation Error', `Please enter valid dates in ${dateFormat} format`);
      return;
    }

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
      start_date: startISO,
      end_date: endISO,
      destination: data.destination.trim() || undefined,
      purpose: data.purpose.trim() || undefined,
      default_currency: data.default_currency,
    });
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: themeColors.background }]}>
        <Text style={{ color: themeColors.textPrimary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      keyboardShouldPersistTaps="handled">
      <View style={styles.formContent}>
        {/* Trip Name */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: themeColors.textPrimary }]}>
            Trip Name <Text style={[styles.required, { color: themeColors.error }]}>*</Text>
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
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.backgroundElevated,
                    borderColor: themeColors.border,
                    color: themeColors.textPrimary,
                  },
                  errors.name && styles.inputError,
                ]}
                placeholder="e.g., London Business Trip"
                placeholderTextColor={themeColors.textDisabled}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isLoading}
              />
            )}
          />
          {errors.name && (
            <Text style={[styles.errorText, { color: themeColors.error }]}>
              {errors.name.message}
            </Text>
          )}
        </View>

        {/* Start Date */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: themeColors.textPrimary }]}>
            Start Date <Text style={[styles.required, { color: themeColors.error }]}>*</Text>
          </Text>
          <Controller
            control={control}
            name="start_date"
            rules={{
              required: 'Start date is required',
            }}
            render={({ field: { onChange, value } }) => {
              // Convert ISO date to display format
              const displayValue = value ? formatDateToDisplay(value, dateFormat) : '';

              return (
                <View>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: themeColors.backgroundElevated,
                        borderColor: themeColors.border,
                        color: themeColors.textPrimary,
                      },
                      errors.start_date && styles.inputError,
                    ]}
                    placeholder={dateFormat}
                    placeholderTextColor={themeColors.textDisabled}
                    value={displayValue}
                    onChangeText={text => {
                      // Store in ISO format
                      const isoDate = parseDisplayToISO(text, dateFormat);
                      onChange(isoDate);
                    }}
                    editable={!isLoading}
                  />
                  <Text style={[styles.hint, { color: themeColors.textSecondary }]}>
                    Format: {dateFormat}
                  </Text>
                </View>
              );
            }}
          />
          {errors.start_date && (
            <Text style={[styles.errorText, { color: themeColors.error }]}>
              {errors.start_date.message}
            </Text>
          )}
        </View>

        {/* End Date */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: themeColors.textPrimary }]}>
            End Date <Text style={[styles.required, { color: themeColors.error }]}>*</Text>
          </Text>
          <Controller
            control={control}
            name="end_date"
            rules={{
              required: 'End date is required',
            }}
            render={({ field: { onChange, value } }) => {
              // Convert ISO date to display format
              const displayValue = value ? formatDateToDisplay(value, dateFormat) : '';

              return (
                <View>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: themeColors.backgroundElevated,
                        borderColor: themeColors.border,
                        color: themeColors.textPrimary,
                      },
                      errors.end_date && styles.inputError,
                    ]}
                    placeholder={dateFormat}
                    placeholderTextColor={themeColors.textDisabled}
                    value={displayValue}
                    onChangeText={text => {
                      // Store in ISO format
                      const isoDate = parseDisplayToISO(text, dateFormat);
                      onChange(isoDate);
                    }}
                    editable={!isLoading}
                  />
                  <Text style={[styles.hint, { color: themeColors.textSecondary }]}>
                    Format: {dateFormat} (must be ≥ start date)
                  </Text>
                </View>
              );
            }}
          />
          {errors.end_date && (
            <Text style={[styles.errorText, { color: themeColors.error }]}>
              {errors.end_date.message}
            </Text>
          )}
        </View>

        {/* Destination */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: themeColors.textPrimary }]}>Destination</Text>
          <Controller
            control={control}
            name="destination"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.backgroundElevated,
                    borderColor: themeColors.border,
                    color: themeColors.textPrimary,
                  },
                ]}
                placeholder="e.g., London, UK"
                placeholderTextColor={themeColors.textDisabled}
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
          <Text style={[styles.label, { color: themeColors.textPrimary }]}>Business Purpose</Text>
          <Controller
            control={control}
            name="purpose"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: themeColors.backgroundElevated,
                    borderColor: themeColors.border,
                    color: themeColors.textPrimary,
                  },
                ]}
                placeholder="e.g., Client meeting, Conference"
                placeholderTextColor={themeColors.textDisabled}
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

        {/* Default Currency */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: themeColors.textPrimary }]}>
            Default Currency <Text style={[styles.required, { color: themeColors.error }]}>*</Text>
          </Text>
          <Controller
            control={control}
            name="default_currency"
            rules={{ required: 'Currency is required' }}
            render={({ field: { onChange, value } }) => (
              <View
                style={[
                  styles.pickerContainer,
                  {
                    backgroundColor: themeColors.backgroundElevated,
                    borderColor: themeColors.border,
                  },
                ]}>
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={[styles.picker, { color: themeColors.textPrimary }]}
                  enabled={!isLoading}
                  mode="dropdown"
                  dropdownIconColor={themeColors.textPrimary}>
                  {CURRENCIES.map(currency => (
                    <Picker.Item
                      key={currency.value}
                      label={currency.label}
                      value={currency.value}
                    />
                  ))}
                </Picker>
              </View>
            )}
          />
          <Text style={[styles.hint, { color: themeColors.textSecondary }]}>
            This will be the default currency for expenses in this trip
          </Text>
          {errors.default_currency && (
            <Text style={[styles.errorText, { color: themeColors.error }]}>
              {errors.default_currency.message}
            </Text>
          )}
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.cancelButton,
              { backgroundColor: themeColors.backgroundElevated, borderColor: themeColors.border },
            ]}
            onPress={onCancel}
            disabled={isLoading}>
            <Text style={[styles.cancelButtonText, { color: themeColors.textSecondary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              { backgroundColor: themeColors.primary, borderColor: themeColors.border },
            ]}
            onPress={handleSubmit(onFormSubmit)}
            disabled={isLoading}>
            <Text style={[styles.submitButtonText, { color: themeColors.textInverse }]}>
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
    ...commonStyles.flex1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  formContent: {
    padding: spacing.base,
  },
  fieldContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    ...textStyles.label,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  input: {
    ...commonStyles.input,
  },
  inputError: {
    ...commonStyles.inputError,
  },
  textArea: {
    minHeight: 80,
  },
  hint: {
    ...textStyles.helper,
    marginTop: spacing.xs,
  },
  errorText: {
    ...textStyles.error,
    marginTop: spacing.xs,
  },
  buttonContainer: {
    ...commonStyles.flexRow,
    ...commonStyles.flexBetween,
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  button: {
    ...commonStyles.button,
    flex: 1,
  },
  cancelButton: {
    ...commonStyles.buttonSecondary,
  },
  cancelButtonText: {
    ...textStyles.button,
    color: colors.textSecondary,
  },
  submitButton: {
    ...commonStyles.buttonPrimary,
  },
  submitButtonText: {
    ...textStyles.button,
  },
  pickerContainer: {
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  picker: {
    height: 50,
  },
});
