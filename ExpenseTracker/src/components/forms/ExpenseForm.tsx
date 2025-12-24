/**
 * Expense Form Component - Neo-Memphis Edition
 * Making expense forms actually exciting!
 * Refactored to use centralized screenStyles
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
import { isValidDateFormat } from '../../components/common/DateChecker';
import { useTripStore } from '../../stores/tripStore';
import { useCategoryStore } from '../../stores/categoryStore';
import { colors, spacing, borderRadius, textStyles, commonStyles, shadows, screenStyles } from '../../styles';
import Icon from 'react-native-vector-icons/Ionicons';

interface ExpenseFormProps {
  expense?: Expense; // If provided, form is in edit mode
  onSubmit: (data: CreateExpenseModel) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialTripId?: number; // Pre-fill trip field when creating from home
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

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  expense,
  onSubmit,
  onCancel,
  isLoading = false,
  initialTripId,
}) => {
  // Fetch trips for dropdown
  const { trips, fetchTrips } = useTripStore();
  const [tripsLoading, setTripsLoading] = useState(true);

  // Fetch categories for dropdown
  const { categories, fetchCategories } = useCategoryStore();
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Local state for amount text inputs to preserve decimals while typing
  const [amountText, setAmountText] = useState('');
  const [taxAmountText, setTaxAmountText] = useState('');
  const [taxRateText, setTaxRateText] = useState('');

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
      trip_id: expense?.trip_id || initialTripId || undefined,
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
    },
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
    <View style={screenStyles.screenWithDecorations}>
      {/* Background decorations */}
      <View style={screenStyles.bgDecorSmall} />
      <View style={screenStyles.bgDecorSquareLeft} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={screenStyles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Form Header */}
        <View style={styles.formHeader}>
          <View style={styles.headerIcon}>
            <Icon name="receipt" size={32} color={colors.primary} />
          </View>
          <Text style={styles.formTitle}>
            {expense ? 'Edit Expense' : 'New Expense'}
          </Text>
          <Text style={styles.formSubtitle}>
            Fill in the details below
          </Text>
        </View>

        {/* Trip Selection */}
        <View style={styles.section}>
          <Text style={screenStyles.sectionTitle}>TRIP INFO</Text>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Trip (Optional)</Text>
            {tripsLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
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
                        <Picker.Item key={trip.id} label={trip.name} value={trip.id} />
                      ))}
                    </Picker>
                  </View>
                )}
              />
            )}
          </View>
        </View>

        {/* Merchant & Amount */}
        <View style={styles.section}>
          <Text style={screenStyles.sectionTitle}>BASIC DETAILS</Text>

          {/* Merchant Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Merchant <Text style={styles.required}>*</Text>
            </Text>
            <Controller
              control={control}
              name="merchant"
              rules={{
                required: 'Merchant name is required',
                minLength: { value: 1, message: 'Merchant name must be at least 1 character' },
                maxLength: { value: 100, message: 'Merchant name cannot exceed 100 characters' },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.merchant && styles.inputError]}
                  placeholder="e.g., Starbucks"
                  placeholderTextColor={colors.textDisabled}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isLoading}
                />
              )}
            />
            {errors.merchant && <Text style={styles.errorText}>{errors.merchant.message}</Text>}
          </View>

          {/* Amount - Make it stand out! */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Amount <Text style={styles.required}>*</Text>
            </Text>
            <Controller
              control={control}
              name="amount"
              rules={{
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0.00' },
              }}
              render={({ field: { onChange, onBlur, value } }) => {
                // Initialize amountText from value if not set
                if (amountText === '' && value > 0) {
                  setAmountText(value.toString());
                }

                return (
                  <View style={styles.amountInputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.amountInput}
                      placeholder="0.00"
                      placeholderTextColor={colors.textDisabled}
                      value={amountText}
                      onChangeText={text => {
                        // Remove non-numeric characters except decimal point
                        const cleaned = text.replace(/[^0-9.]/g, '');
                        // Allow only one decimal point
                        const parts = cleaned.split('.');
                        if (parts.length > 2) return;

                        setAmountText(cleaned);

                        // Update form value
                        if (cleaned === '' || cleaned === '.') {
                          onChange(0);
                        } else {
                          const parsed = parseFloat(cleaned);
                          onChange(isNaN(parsed) ? 0 : parsed);
                        }
                      }}
                      onBlur={(e) => {
                        // Clean up trailing decimal on blur
                        if (amountText.endsWith('.')) {
                          setAmountText(amountText.slice(0, -1));
                        }
                        onBlur(e);
                      }}
                      editable={!isLoading}
                      keyboardType="decimal-pad"
                    />
                  </View>
                );
              }}
            />
            {errors.amount && <Text style={styles.errorText}>{errors.amount.message}</Text>}
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
                validate: value => {
                  if (!isValidDateFormat(value)) return 'Date must be in YYYY-MM-DD format';
                  return true;
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.date && styles.inputError]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textDisabled}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isLoading}
                />
              )}
            />
            {errors.date && <Text style={styles.errorText}>{errors.date.message}</Text>}
          </View>

          {/* Time */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Time (Optional)</Text>
            <Controller
              control={control}
              name="time"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textDisabled}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isLoading}
                />
              )}
            />
          </View>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={screenStyles.sectionTitle}>CATEGORY</Text>
          <View style={styles.fieldContainer}>
            {categoriesLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={colors.secondary} />
              </View>
            ) : (
              <Controller
                control={control}
                name="category"
                rules={{ required: 'Category is required' }}
                render={({ field: { onChange, value } }) => (
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={value}
                      onValueChange={onChange}
                      enabled={!isLoading}
                      style={styles.picker}>
                      {categories.map(cat => (
                        <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                      ))}
                    </Picker>
                  </View>
                )}
              />
            )}
          </View>
        </View>

        {/* Tax Info */}
        <View style={styles.section}>
          <Text style={screenStyles.sectionTitle}>TAX (OPTIONAL)</Text>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Tax Amount</Text>
            <Controller
              control={control}
              name="tax_amount"
              rules={{
                validate: value => {
                  if (value === undefined || value === null || value === '') return true;
                  const numValue = typeof value === 'string' ? parseFloat(value) : value;
                  if (numValue < 0) return 'Tax amount cannot be negative';
                  return true;
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => {
                // Initialize taxAmountText from value if not set
                if (taxAmountText === '' && value && value > 0) {
                  setTaxAmountText(value.toString());
                }

                return (
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor={colors.textDisabled}
                    value={taxAmountText}
                    onChangeText={text => {
                      const cleaned = text.replace(/[^0-9.]/g, '');
                      const parts = cleaned.split('.');
                      if (parts.length > 2) return;

                      setTaxAmountText(cleaned);

                      if (cleaned === '' || cleaned === '.') {
                        onChange(undefined);
                      } else {
                        const parsed = parseFloat(cleaned);
                        onChange(isNaN(parsed) ? undefined : parsed);
                      }
                    }}
                    onBlur={(e) => {
                      if (taxAmountText.endsWith('.')) {
                        setTaxAmountText(taxAmountText.slice(0, -1));
                      }
                      onBlur(e);
                    }}
                    editable={!isLoading}
                    keyboardType="decimal-pad"
                  />
                );
              }}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Tax Rate (%)</Text>
            <Controller
              control={control}
              name="tax_rate"
              render={({ field: { onChange, onBlur, value } }) => {
                // Initialize taxRateText from value if not set
                if (taxRateText === '' && value && value > 0) {
                  setTaxRateText(value.toString());
                }

                return (
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 8.5"
                    placeholderTextColor={colors.textDisabled}
                    value={taxRateText}
                    onChangeText={text => {
                      const cleaned = text.replace(/[^0-9.]/g, '');
                      const parts = cleaned.split('.');
                      if (parts.length > 2) return;

                      setTaxRateText(cleaned);

                      if (cleaned === '' || cleaned === '.') {
                        onChange(undefined);
                      } else {
                        const parsed = parseFloat(cleaned);
                        onChange(isNaN(parsed) ? undefined : parsed);
                      }
                    }}
                    onBlur={(e) => {
                      if (taxRateText.endsWith('.')) {
                        setTaxRateText(taxRateText.slice(0, -1));
                      }
                      onBlur(e);
                    }}
                    editable={!isLoading}
                    keyboardType="decimal-pad"
                  />
                );
              }}
            />
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={screenStyles.sectionTitle}>NOTES</Text>
          <View style={styles.fieldContainer}>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Add any additional notes here..."
                  placeholderTextColor={colors.textDisabled}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isLoading}
                  multiline
                  numberOfLines={4}
                />
              )}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit(onFormSubmit)}
            disabled={isLoading}
            activeOpacity={0.8}>
            {isLoading ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <>
                <Icon name="checkmark-circle" size={24} color={colors.textInverse} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>SAVE EXPENSE</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={isLoading}
            activeOpacity={0.8}>
            <Icon name="close-circle" size={24} color={colors.textPrimary} style={styles.buttonIcon} />
            <Text style={[styles.buttonText, styles.cancelButtonText]}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// Minimal local styles - most styles now use centralized screenStyles
const styles = StyleSheet.create({
  // ScrollView basic style
  scrollView: {
    flex: 1,
  },

  // Form Header - Form-specific centered header
  formHeader: {
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  headerIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: colors.border,
  },
  formTitle: {
    ...textStyles.h2,
    marginBottom: spacing.xs,
  },
  formSubtitle: {
    ...textStyles.body,
    color: colors.textSecondary,
  },

  // Sections - Form section spacing
  section: {
    marginBottom: spacing.xl,
  },

  // Fields - Form field layout
  fieldContainer: {
    marginBottom: spacing.base,
  },
  label: {
    ...textStyles.label,
    fontSize: 13,
    marginBottom: spacing.sm,
    color: colors.textPrimary,
  },
  required: {
    color: colors.error,
    fontWeight: '800',
  },

  // Inputs
  input: {
    ...commonStyles.input,
    fontSize: 16,
  },
  inputError: {
    ...commonStyles.inputError,
  },

  // Amount Input - Special highlighted input for main expense amount
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent1Light,
    paddingHorizontal: spacing.md,
    ...shadows.medium,
  },
  currencySymbol: {
    ...textStyles.amountMedium,
    marginRight: spacing.sm,
    color: colors.primary,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    padding: spacing.md,
  },

  // Picker - Dropdown selector styling
  pickerContainer: {
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundElevated,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },

  // Text Area - Multiline input
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },

  // Loading - Inline loading state for pickers
  loadingBox: {
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.borderSubtle,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
  },

  // Error Text
  errorText: {
    ...textStyles.error,
    marginTop: spacing.xs,
  },

  // Buttons
  buttonContainer: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  button: {
    ...commonStyles.button,
    flexDirection: 'row',
    paddingVertical: spacing.base,
    ...shadows.medium,
  },
  submitButton: {
    ...commonStyles.buttonSuccess,
  },
  cancelButton: {
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.border,
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },
  buttonText: {
    ...textStyles.button,
    fontSize: 16,
  },
  cancelButtonText: {
    color: colors.textPrimary,
  },
});
