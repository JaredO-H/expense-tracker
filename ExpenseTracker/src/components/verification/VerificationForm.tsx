/**
 * VerificationForm Component
 * Form for verifying and editing AI-extracted expense data
 * Optimized for use within the sliding drawer interface
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { format } from 'date-fns';
import { Picker } from '@react-native-picker/picker';
import { CreateExpenseModel, TaxType } from '../../types/database';
import { QueueItem } from '../../services/queue/processingQueue';
import { useCategoryStore } from '../../stores/categoryStore';
import { colors, spacing, borderRadius, textStyles, commonStyles } from '../../styles';

interface VerificationFormProps {
  queueItem: QueueItem;
  initialData: Partial<CreateExpenseModel>;
  onSave: (data: CreateExpenseModel) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormData {
  merchant: string;
  amount: number;
  date: string;
  category: number;
  tax_amount?: number;
  tax_type?: TaxType;
  notes?: string;
}

export const VerificationForm: React.FC<VerificationFormProps> = ({
  queueItem,
  initialData,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const { categories, fetchCategories } = useCategoryStore();
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Determine processing method for display
  const getProcessingMethod = () => {
    if (queueItem.serviceId === 'mlkit') {
      return { label: 'Processed with Offline OCR', icon: '📱', color: '#FF8C00' };
    } else if (queueItem.serviceId) {
      return { label: `Processed with AI (${queueItem.serviceId.toUpperCase()})`, icon: '🤖', color: colors.primary };
    } else {
      return { label: 'Manual Entry', icon: '✍️', color: colors.textSecondary };
    }
  };

  const processingMethod = getProcessingMethod();

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
  } = useForm<FormData>({
    defaultValues: {
      merchant: initialData.merchant || '',
      amount: initialData.amount || 0,
      date: initialData.date || format(new Date(), 'yyyy-MM-dd'),
      category: initialData.category || 8,
      tax_amount: initialData.tax_amount,
      tax_type: initialData.tax_type,
      notes: initialData.notes,
    },
  });

  const onFormSubmit = async (data: FormData) => {
    // Build complete expense model
    const expenseData: CreateExpenseModel = {
      ...initialData,
      merchant: data.merchant,
      amount: data.amount,
      date: data.date,
      category: data.category,
      tax_amount: data.tax_amount,
      tax_type: data.tax_type,
      notes: data.notes,
      verification_status: 'verified', // Mark as verified after user review
    };

    await onSave(expenseData);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}>
        {/* Processing Method Indicator */}
        <View style={[styles.processingMethodBadge, { backgroundColor: processingMethod.color + '20', borderColor: processingMethod.color }]}>
          <Text style={styles.processingIcon}>{processingMethod.icon}</Text>
          <Text style={[styles.processingText, { color: processingMethod.color }]}>
            {processingMethod.label}
          </Text>
        </View>

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
              minLength: {
                value: 1,
                message: 'Merchant name required',
              },
              maxLength: {
                value: 100,
                message: 'Max 100 characters',
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
                autoCapitalize="words"
              />
            )}
          />
          {errors.merchant && (
            <Text style={styles.errorText}>{errors.merchant.message}</Text>
          )}
        </View>

        {/* Amount */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Amount <Text style={styles.required}>*</Text>
          </Text>
          <Controller
            control={control}
            name="amount"
            rules={{
              required: 'Amount is required',
              min: {
                value: 0.01,
                message: 'Amount must be at least $0.01',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.amount && styles.inputError]}
                placeholder="0.00"
                value={value ? value.toString() : ''}
                onChangeText={(text) => onChange(parseFloat(text) || 0)}
                onBlur={onBlur}
                keyboardType="decimal-pad"
                editable={!isLoading}
              />
            )}
          />
          {errors.amount && (
            <Text style={styles.errorText}>{errors.amount.message}</Text>
          )}
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
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.date && styles.inputError]}
                placeholder="YYYY-MM-DD"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isLoading}
              />
            )}
          />
          {errors.date && (
            <Text style={styles.errorText}>{errors.date.message}</Text>
          )}
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
              rules={{ required: 'Category is required' }}
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
          {errors.category && (
            <Text style={styles.errorText}>{errors.category.message}</Text>
          )}
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
                style={[styles.input, errors.tax_amount && styles.inputError]}
                placeholder="0.00"
                value={value ? value.toString() : ''}
                onChangeText={(text) => onChange(text ? parseFloat(text) : undefined)}
                onBlur={onBlur}
                keyboardType="decimal-pad"
                editable={!isLoading}
              />
            )}
          />
          {errors.tax_amount && (
            <Text style={styles.errorText}>{errors.tax_amount.message}</Text>
          )}
        </View>

        {/* Tax Type */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Tax Type (Optional)</Text>
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

        {/* Notes */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add any additional notes..."
                value={value || ''}
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

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={isLoading}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit(onFormSubmit)}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <Text style={styles.saveButtonText}>Save Expense</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  processingMethodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.lg,
    alignSelf: 'flex-start',
  },
  processingIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  processingText: {
    ...textStyles.caption,
    fontWeight: '600',
  },
  fieldContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    ...textStyles.labelSmall,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.error,
  },
  input: {
    ...commonStyles.input,
    backgroundColor: colors.backgroundTertiary,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  textArea: {
    height: 80,
    paddingTop: spacing.md,
  },
  errorText: {
    ...textStyles.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  pickerContainer: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  picker: {
    ...textStyles.body,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.backgroundTertiary,
  },
  cancelButtonText: {
    ...textStyles.button,
    color: colors.textPrimary,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    ...textStyles.button,
    color: colors.textInverse,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
