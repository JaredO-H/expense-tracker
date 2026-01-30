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
import { useTripStore } from '../../stores/tripStore';
import { useCategoryStore } from '../../stores/categoryStore';
import {
  colors,
  spacing,
  borderRadius,
  textStyles,
  commonStyles,
  shadows,
  screenStyles,
} from '../../styles';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { getDateFormat } from '../../utils/generalSettings';
import { formatDateToDisplay, parseDisplayToISO } from '../../utils/dateFormatHelpers';
import { ReceiptImagePicker } from './ReceiptImagePicker';
import fileService from '../../services/storage/fileService';

const CURRENCIES = [
  { label: 'US Dollar (USD)', value: 'USD', symbol: '$' },
  { label: 'Canadian Dollar (CAD)', value: 'CAD', symbol: 'CA$' },
  { label: 'Euro (EUR)', value: 'EUR', symbol: '€' },
  { label: 'British Pound (GBP)', value: 'GBP', symbol: '£' },
  { label: 'Japanese Yen (JPY)', value: 'JPY', symbol: '¥' },
  { label: 'Australian Dollar (AUD)', value: 'AUD', symbol: 'A$' },
  { label: 'Swiss Franc (CHF)', value: 'CHF', symbol: 'CHF' },
  { label: 'Singapore Dollar (SGD)', value: 'SGD', symbol: 'S$' },
  { label: 'Indian Rupee (INR)', value: 'INR', symbol: '₹' },
  { label: 'Vietnamese Dong (VND)', value: 'VND', symbol: '₫' },
];

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
  currency: string;
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
  const { colors: themeColors } = useTheme();

  // Fetch trips for dropdown
  const { trips, fetchTrips } = useTripStore();
  const [tripsLoading, setTripsLoading] = useState(true);

  // Fetch categories for dropdown
  const { categories, fetchCategories } = useCategoryStore();
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Date format from settings
  const [dateFormat, setDateFormat] = useState<string>('YYYY-MM-DD');

  // Local state for amount text inputs to preserve decimals while typing
  const [amountText, setAmountText] = useState('');
  const [taxAmountText, setTaxAmountText] = useState('');
  const [taxRateText, setTaxRateText] = useState('');

  useEffect(() => {
    const loadDateFormat = async () => {
      try {
        const format = await getDateFormat();
        setDateFormat(format);
      } catch (error) {
        console.error('Failed to load date format:', error);
      }
    };
    loadDateFormat();
  }, []);

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
    watch,
    setValue,
    getValues,
  } = useForm<ExpenseFormData>({
    defaultValues: {
      trip_id: expense?.trip_id || initialTripId || undefined,
      image_path: expense?.image_path || undefined,
      merchant: expense?.merchant || undefined,
      amount: expense?.amount || 0,
      currency: expense?.currency || 'USD',
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

  // Watch for trip changes and update currency if trip has a default currency
  const selectedTripId = watch('trip_id');

  useEffect(() => {
    if (selectedTripId && !expense) {
      const selectedTrip = trips.find(t => t.id === selectedTripId);
      if (selectedTrip?.default_currency) {
        setValue('currency', selectedTrip.default_currency);
      }
    }
  }, [selectedTripId, trips, setValue, expense]);

  // Initialize text fields from expense values (only when expense changes)
  useEffect(() => {
    if (expense) {
      if (expense.amount && expense.amount > 0) {
        setAmountText(expense.amount.toString());
      }
      if (expense.tax_amount && expense.tax_amount > 0) {
        setTaxAmountText(expense.tax_amount.toString());
      }
      if (expense.tax_rate && expense.tax_rate > 0) {
        setTaxRateText(expense.tax_rate.toString());
      }
    }
  }, [expense]);

  // Get currency symbol for display (for future use)
  // const getCurrencySymbol = (currencyCode: string): string => {
  //   const currency = CURRENCIES.find(c => c.value === currencyCode);
  //   return currency?.symbol || currencyCode;
  // };

  const onFormSubmit = (data: ExpenseFormData) => {
    // Date is already in ISO format from form state (converted in onChangeText handler)
    const dateISO = data.date;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expenseDate = new Date(dateISO);

    if (isNaN(expenseDate.getTime())) {
      Alert.alert('Validation Error', `Please enter a valid date in ${dateFormat} format`);
      return;
    }

    // Allow dates up to 1 day in the future to account for timezone differences
    const maxAllowedDate = new Date(today);
    maxAllowedDate.setDate(maxAllowedDate.getDate() + 1);

    if (expenseDate > maxAllowedDate) {
      Alert.alert('Validation Error', 'Date cannot be more than 1 day in the future');
      return;
    }

    onSubmit({
      trip_id: data.trip_id || undefined,
      image_path: data.image_path,
      merchant: data.merchant,
      amount: data.amount,
      currency: data.currency,
      tax_amount: data.tax_amount,
      tax_type: data.tax_type,
      tax_rate: data.tax_rate,
      date: dateISO,
      time: data.time,
      category: data.category,
      ai_service_used: data.ai_service_used,
      capture_method: data.capture_method,
      notes: data.notes,
    });
  };

  const handleCancel = async () => {
    const currentImagePath = getValues('image_path');

    // If user added an image but is canceling, clean it up
    // For create mode: any image is new and should be deleted
    // For edit mode: only delete if image differs from original
    if (currentImagePath && (!expense || expense.image_path !== currentImagePath)) {
      try {
        await fileService.deleteReceiptImage(currentImagePath);
      } catch (error) {
        console.error('Failed to cleanup image on cancel:', error);
        // Continue with cancel even if cleanup fails
      }
    }

    onCancel();
  };

  return (
    <View style={[screenStyles.screenWithDecorations, { backgroundColor: themeColors.background }]}>
      {/* Background decorations */}
      <View style={[screenStyles.bgDecorSmall, { backgroundColor: themeColors.primaryLight }]} />
      <View
        style={[screenStyles.bgDecorSquareLeft, { backgroundColor: themeColors.accent2Light }]}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={screenStyles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Form Header */}
        <View style={styles.formHeader}>
          <View
            style={[
              styles.headerIcon,
              { backgroundColor: themeColors.primaryLight, borderColor: themeColors.border },
            ]}>
            <Icon name="receipt" size={32} color={themeColors.primary} />
          </View>
          <Text style={[styles.formTitle, { color: themeColors.textPrimary }]}>
            {expense ? 'Edit Expense' : 'New Expense'}
          </Text>
          <Text style={[styles.formSubtitle, { color: themeColors.textSecondary }]}>
            Fill in the details below
          </Text>
        </View>

        {/* Trip Selection */}
        <View style={styles.section}>
          <Text style={screenStyles.sectionTitle}>TRIP INFO</Text>
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: themeColors.textPrimary }]}>Trip (Optional)</Text>
            {tripsLoading ? (
              <View
                style={[
                  styles.loadingBox,
                  {
                    borderColor: themeColors.borderSubtle,
                    backgroundColor: themeColors.backgroundSecondary,
                  },
                ]}>
                <ActivityIndicator size="small" color={themeColors.primary} />
              </View>
            ) : (
              <Controller
                control={control}
                name="trip_id"
                render={({ field: { onChange, value } }) => (
                  <View
                    style={[
                      styles.pickerContainer,
                      {
                        borderColor: themeColors.border,
                        backgroundColor: themeColors.backgroundElevated,
                      },
                    ]}>
                    <Picker
                      testID="trip-picker"
                      selectedValue={value}
                      onValueChange={onChange}
                      enabled={!isLoading}
                      mode="dropdown"
                      style={[styles.picker, { color: themeColors.textPrimary }]}
                      dropdownIconColor={themeColors.textPrimary}>
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
            <Text style={[styles.label, { color: themeColors.textPrimary }]}>
              Merchant <Text style={[styles.required, { color: themeColors.error }]}>*</Text>
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
                  style={[
                    styles.input,
                    {
                      backgroundColor: themeColors.backgroundElevated,
                      borderColor: themeColors.border,
                      color: themeColors.textPrimary,
                    },
                    errors.merchant && styles.inputError,
                  ]}
                  placeholder="e.g., Starbucks"
                  placeholderTextColor={themeColors.textDisabled}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isLoading}
                />
              )}
            />
            {errors.merchant && (
              <Text style={[styles.errorText, { color: themeColors.error }]}>
                {errors.merchant.message}
              </Text>
            )}
          </View>

          {/* Amount - Make it stand out! */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: themeColors.textPrimary }]}>
              Amount <Text style={[styles.required, { color: themeColors.error }]}>*</Text>
            </Text>
            <Controller
              control={control}
              name="amount"
              rules={{
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0.00' },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[
                    styles.amountInputContainer,
                    {
                      borderColor: themeColors.border,
                      backgroundColor: themeColors.backgroundElevated,
                    },
                  ]}>
                  <TextInput
                    testID="amount-input"
                    style={[styles.amountInput, { color: themeColors.textPrimary }]}
                    placeholder="0.00"
                    placeholderTextColor={themeColors.textDisabled}
                    value={amountText || (value > 0 ? value.toString() : '')}
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
                    onBlur={() => {
                      // Clean up trailing decimal on blur
                      if (amountText.endsWith('.')) {
                        setAmountText(amountText.slice(0, -1));
                      }
                      onBlur();
                    }}
                    editable={!isLoading}
                    keyboardType="decimal-pad"
                  />
                </View>
              )}
            />
            {errors.amount && (
              <Text style={[styles.errorText, { color: themeColors.error }]}>
                {errors.amount.message}
              </Text>
            )}
          </View>

          {/* Currency */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: themeColors.textPrimary }]}>
              Currency <Text style={[styles.required, { color: themeColors.error }]}>*</Text>
            </Text>
            <Controller
              control={control}
              name="currency"
              rules={{ required: 'Currency is required' }}
              render={({ field: { onChange, value } }) => (
                <View
                  style={[
                    styles.pickerContainer,
                    {
                      borderColor: themeColors.border,
                      backgroundColor: themeColors.backgroundElevated,
                    },
                  ]}>
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
                    enabled={!isLoading}
                    mode="dropdown"
                    style={[styles.picker, { color: themeColors.textPrimary }]}
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
            <Text style={[styles.hint, { color: themeColors.textTertiary }]}>
              {selectedTripId && trips.find(t => t.id === selectedTripId)?.default_currency
                ? 'Defaulted from trip currency'
                : 'Select the currency for this expense'}
            </Text>
            {errors.currency && (
              <Text style={[styles.errorText, { color: themeColors.error }]}>
                {errors.currency.message}
              </Text>
            )}
          </View>

          {/* Date */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: themeColors.textPrimary }]}>
              Date <Text style={[styles.required, { color: themeColors.error }]}>*</Text>
            </Text>
            <Controller
              control={control}
              name="date"
              rules={{
                required: 'Date is required',
              }}
              render={({ field: { onChange, onBlur, value } }) => {
                // Convert ISO date to display format
                const displayValue = value ? formatDateToDisplay(value, dateFormat) : '';

                return (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: themeColors.backgroundElevated,
                        borderColor: themeColors.border,
                        color: themeColors.textPrimary,
                      },
                      errors.date && styles.inputError,
                    ]}
                    placeholder={dateFormat}
                    placeholderTextColor={themeColors.textDisabled}
                    value={displayValue}
                    onChangeText={text => {
                      // Store in ISO format
                      const isoDate = parseDisplayToISO(text, dateFormat);
                      onChange(isoDate);
                    }}
                    onBlur={onBlur}
                    editable={!isLoading}
                  />
                );
              }}
            />
            {errors.date && (
              <Text style={[styles.errorText, { color: themeColors.error }]}>
                {errors.date.message}
              </Text>
            )}
          </View>

          {/* Time */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: themeColors.textPrimary }]}>Time (Optional)</Text>
            <Controller
              control={control}
              name="time"
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
                  placeholder="HH:MM"
                  placeholderTextColor={themeColors.textDisabled}
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
              <View
                style={[
                  styles.loadingBox,
                  {
                    borderColor: themeColors.borderSubtle,
                    backgroundColor: themeColors.backgroundSecondary,
                  },
                ]}>
                <ActivityIndicator size="small" color={themeColors.secondary} />
              </View>
            ) : (
              <Controller
                control={control}
                name="category"
                rules={{ required: 'Category is required' }}
                render={({ field: { onChange, value } }) => (
                  <View
                    style={[
                      styles.pickerContainer,
                      {
                        borderColor: themeColors.border,
                        backgroundColor: themeColors.backgroundElevated,
                      },
                    ]}>
                    <Picker
                      testID="category-picker"
                      selectedValue={value}
                      onValueChange={onChange}
                      enabled={!isLoading}
                      mode="dropdown"
                      style={[styles.picker, { color: themeColors.textPrimary }]}
                      dropdownIconColor={themeColors.textPrimary}>
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
            <Text style={[styles.label, { color: themeColors.textPrimary }]}>Tax Amount</Text>
            <Controller
              control={control}
              name="tax_amount"
              rules={{
                validate: value => {
                  if (value === undefined || value === null) return true;
                  const numValue = typeof value === 'string' ? parseFloat(value) : value;
                  if (isNaN(numValue)) return true;
                  if (numValue < 0) return 'Tax amount cannot be negative';
                  return true;
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
                  ]}
                  placeholder="0.00"
                  placeholderTextColor={themeColors.textDisabled}
                  value={taxAmountText || (value && value > 0 ? value.toString() : '')}
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
                  onBlur={() => {
                    if (taxAmountText.endsWith('.')) {
                      setTaxAmountText(taxAmountText.slice(0, -1));
                    }
                    onBlur();
                  }}
                  editable={!isLoading}
                  keyboardType="decimal-pad"
                />
              )}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: themeColors.textPrimary }]}>Tax Rate (%)</Text>
            <Controller
              control={control}
              name="tax_rate"
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
                  placeholder="e.g., 8.5"
                  placeholderTextColor={themeColors.textDisabled}
                  value={taxRateText || (value && value > 0 ? value.toString() : '')}
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
                  onBlur={() => {
                    if (taxRateText.endsWith('.')) {
                      setTaxRateText(taxRateText.slice(0, -1));
                    }
                    onBlur();
                  }}
                  editable={!isLoading}
                  keyboardType="decimal-pad"
                />
              )}
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
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      backgroundColor: themeColors.backgroundElevated,
                      borderColor: themeColors.border,
                      color: themeColors.textPrimary,
                    },
                  ]}
                  placeholder="Add any additional notes here..."
                  placeholderTextColor={themeColors.textDisabled}
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

        {/* Receipt Image (Optional) */}
        <View style={styles.section}>
          <Text style={screenStyles.sectionTitle}>RECEIPT IMAGE (OPTIONAL)</Text>
          <Controller
            control={control}
            name="image_path"
            render={({ field: { onChange, value } }) => (
              <ReceiptImagePicker value={value} onChange={onChange} editable={!isLoading} />
            )}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit(onFormSubmit)}
            disabled={isLoading}
            activeOpacity={0.8}>
            {isLoading ? (
              <ActivityIndicator testID="loading-indicator" color={themeColors.textInverse} />
            ) : (
              <>
                <Icon
                  name="checkmark-circle"
                  size={24}
                  color={themeColors.textInverse}
                  style={styles.buttonIcon}
                />
                <Text style={[styles.buttonText, { color: themeColors.textInverse }]}>
                  SAVE EXPENSE
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.cancelButton,
              { backgroundColor: themeColors.backgroundElevated, borderColor: themeColors.border },
            ]}
            onPress={handleCancel}
            disabled={isLoading}
            activeOpacity={0.8}>
            <Icon
              name="close-circle"
              size={24}
              color={themeColors.textPrimary}
              style={styles.buttonIcon}
            />
            <Text
              style={[
                styles.buttonText,
                styles.cancelButtonText,
                { color: themeColors.textPrimary },
              ]}>
              CANCEL
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

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
  hint: {
    ...textStyles.helper,
    marginTop: spacing.xs,
    fontSize: 12,
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
