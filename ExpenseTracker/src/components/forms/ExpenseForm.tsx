/**
 * Expense Form Component
 * Reusable form for creating and editing expenses
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
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { format } from 'date-fns';
import { Picker } from '@react-native-picker/picker';
import { Expense, CreateExpenseModel, TaxType } from '../../types/database';
import {isValidDateFormat} from '../../components/common/DateChecker';
import { useTripStore } from '../../stores/tripStore';
import { useCategoryStore } from '../../stores/categoryStore';
import { colors, spacing, borderRadius, textStyles, commonStyles } from '../../styles';



interface ExpenseFormProps {
  expense?: Expense; // If provided, form is in edit mode
  onSubmit: (data: CreateExpenseModel) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface ExpenseFormData {
    trip_id?: number;
    image_path?: string;
    merchant?: string;
    amount: number;
    tax_amount?: number;
    tax_type?: TaxType;
    tax_rate?: number;
    date: string;
    time?: string;
    category: number;
    ai_service_used?: string;
    capture_method: string;
    notes?: string;
    verification_status: string;
    }

export const ExpenseForm : React.FC<ExpenseFormProps> = ({
  expense,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  // Fetch trips for dropdown
  const { trips, fetchTrips } = useTripStore();
  const [tripsLoading, setTripsLoading] = useState(true);

  // Fetch categories for dropdown
  const { categories, fetchCategories } = useCategoryStore();
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const loadTrips = async () => {
      try {
        await fetchTrips();
      } catch (error) {
        console.error('Failed to load trips:', error);
      } finally {
        setTripsLoading(false);
      }
    };
    loadTrips();
  }, [fetchTrips]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        await fetchCategories();
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, [fetchCategories]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    defaultValues: {
      trip_id: expense?.trip_id || undefined,
      image_path: expense?.image_path || undefined,
      merchant: expense?.merchant || undefined,
      amount: expense?.amount || 0,
      tax_amount: expense?.tax_amount || undefined,
      tax_type: expense?.tax_type || undefined,
      tax_rate: expense?.tax_rate || undefined,
      date: expense?.date || format(new Date(), 'yyyy-MM-dd'),
      time: expense?.time || undefined,
      category: expense?.category || 8,
      ai_service_used: expense?.ai_service_used || undefined,
      capture_method: expense?.capture_method || 'manual',
      notes: expense?.notes || undefined,
      verification_status: expense?.verification_status || 'pending',
      }
  });

  const onFormSubmit = (data: ExpenseFormData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (data.date > today.toISOString()) {
      Alert.alert('Validation Error', 'Date cannot be in the future');
      return;
    }

    onSubmit({
      trip_id: data.trip_id || undefined,
      image_path: data.image_path,
      merchant: data.merchant,
      amount: data.amount,
      tax_amount: data.tax_amount,
      tax_type: data.tax_type,
      tax_rate: data.tax_rate,
      date: data.date,
      time: data.time,
      category: data.category,
      ai_service_used: data.ai_service_used,
      capture_method: data.capture_method,
      notes: data.notes,
    });
  };

  return (
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.formContent}>
          {/* Trip Selection */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Trip (Optional)</Text>
            {tripsLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Controller
                control={control}
                name="trip_id"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={value}
                      onValueChange={onChange}
                      enabled={!isLoading}
                      style={styles.picker}>
                      <Picker.Item label="No trip (unassigned)" value={undefined} />
                      {trips.map(trip => (
                        <Picker.Item
                          key={trip.id}
                          label={trip.name}
                          value={trip.id}
                        />
                      ))}
                    </Picker>
                  </View>
                )}
              />
            )}
          </View>
          {/* Merchant Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Merchant Name <Text style={styles.required}>*</Text>
            </Text>
            <Controller
              control={control}
              name="merchant"
              rules={{
                required: 'Merchant name is required',
                minLength: {
                  value: 1,
                  message: 'Merchant name must be at least 1 characters',
                },
                maxLength: {
                  value: 100,
                  message: 'Merchant name cannot exceed 100 characters',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.merchant && styles.inputError]}
                  placeholder="e.g., Uber"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isLoading}
                />
              )}
            />
            {errors.merchant && <Text style={styles.errorText}>{errors.merchant.message}</Text>}
          </View>
          {/* Amount */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Amount</Text>
            <Controller
              control={control}
              name="amount"
              rules={{
                required: 'Amount is required',
                min: {
                  value: 0.01,
                  message: 'Amount must be greater than 0.00',
                  }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="5.00"
                  value={value?.toString() || ''}
                  onChangeText={(text) => onChange(parseFloat(text) || 0)}
                  onBlur={onBlur}
                  editable={!isLoading}
                  keyboardType="decimal-pad"
                />
              )}
            />
          </View>
          {/* Tax Amount */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Tax Amount (Optional)</Text>
            <Controller
              control={control}
              name="tax_amount"
              rules={{
                validate: (value) => {
                  // Allow empty/null values (field is optional)
                  if (value === undefined || value === null || value === '') {
                    return true;
                  }
                  // If a value is provided, ensure it's not negative
                  const numValue = typeof value === 'string' ? parseFloat(value) : value;
                  if (numValue < 0) {
                    return 'Tax amount cannot be negative';
                  }
                  return true;
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={value?.toString() || ''}
                  onChangeText={(text) => onChange(text ? parseFloat(text) : undefined)}
                  onBlur={onBlur}
                  editable={!isLoading}
                  keyboardType="decimal-pad"
                />
              )}
            />
          </View>
          {/* Tax Type */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Tax Type</Text>
            <Controller
              control={control}
              name="tax_type"
              render={({ field: { onChange, value } }) => (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
                    enabled={!isLoading}
                    style={styles.picker}>
                    <Picker.Item label="None" value={undefined} />
                    <Picker.Item label="GST" value={TaxType.GST} />
                    <Picker.Item label="HST" value={TaxType.HST} />
                    <Picker.Item label="PST" value={TaxType.PST} />
                    <Picker.Item label="VAT" value={TaxType.VAT} />
                    <Picker.Item label="Sales Tax" value={TaxType.SALES_TAX} />
                    <Picker.Item label="Other" value={TaxType.OTHER} />
                  </Picker>
                </View>
              )}
            />
          </View>
          {/* Tax Rate */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Tax Rate (Optional)</Text>
            <Controller
              control={control}
              name="tax_rate"
              rules={{
                validate: (value) => {
                  // Allow empty/null values (field is optional)
                  if (value === undefined || value === null || value === '') {
                    return true;
                  }
                  // If a value is provided, ensure it's valid
                  const numValue = typeof value === 'string' ? parseFloat(value) : value;
                  if (numValue < 0) {
                    return 'Tax rate cannot be negative';
                  }
                  if (numValue > 100) {
                    return 'Tax rate cannot exceed 100%';
                  }
                  return true;
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={value?.toString() || ''}
                  onChangeText={(text) => onChange(text ? parseFloat(text) : undefined)}
                  onBlur={onBlur}
                  editable={!isLoading}
                  keyboardType="decimal-pad"
                />
              )}
            />
          </View>
          {/* Date */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Date <Text style={styles.required}>*</Text>
            </Text>
            <Controller
              control={control}
              name="date"
              rules={{
                required: 'Date is required',
                validate: {
                  validFormat: value =>
                    isValidDateFormat(value) ||
                    'Invalid date format. Use YYYY-MM-DD (e.g., 2024-12-25)',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <View>
                  <TextInput
                    style={[styles.input, errors.date && styles.inputError]}
                    placeholder="YYYY-MM-DD"
                    value={value}
                    onChangeText={onChange}
                    editable={!isLoading}
                  />
                  <Text style={styles.hint}>Format: YYYY-MM-DD</Text>
                </View>
              )}
            />
            {errors.date && <Text style={styles.errorText}>{errors.date.message}</Text>}
          </View>
          {/* Time */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Time <Text style={styles.required}>*</Text>
            </Text>
            <Controller
              control={control}
              name="time"
              render={({ field: { onChange, value } }) => (
                <View>
                  <TextInput
                    style={[styles.input, errors.time && styles.inputError]}
                    placeholder="hh:mm:ss"
                    value={value}
                    onChangeText={onChange}
                    editable={!isLoading}
                  />
                  <Text style={styles.hint}>Format: HH:MM:SS</Text>
                </View>
              )}
            />
          </View>
          {/* Category */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Category <Text style={styles.required}>*</Text>
            </Text>
            {categoriesLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Controller
                control={control}
                name="category"
                rules={{
                  required: 'Category is required',
                }}
                render={({ field: { onChange, value } }) => (
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={value}
                      onValueChange={onChange}
                      enabled={!isLoading}
                      style={styles.picker}>
                      {categories.map(category => (
                        <Picker.Item
                          key={category.id}
                          label={category.name}
                          value={category.id}
                        />
                      ))}
                    </Picker>
                  </View>
                )}
              />
            )}
            {errors.category && <Text style={styles.errorText}>{errors.category.message}</Text>}
          </View>
          {/* Notes */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Notes</Text>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.notes && styles.inputError]}
                  placeholder="Optional notes about this expense"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isLoading}
                  multiline
                  numberOfLines={3}
                />
              )}
            />
            {errors.notes && <Text style={styles.errorText}>{errors.notes.message}</Text>}
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
                {isLoading ? 'Saving...' : expense ? 'Update Expense' : 'Create Expense'}
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
  },
  picker: {
    fontSize: textStyles.body.fontSize,
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
});
