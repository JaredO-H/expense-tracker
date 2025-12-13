/**
 * Expense Form Component
 * Reusable form for creating and editing expenses
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
import { Expense, CreateExpenseModel } from '../../types/database';



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
    category: ExpenseCategory;
    processed?: boolean;
    ai_service_used?: string;
    manual_entry: boolean;
    }

export const ExpenseForm : React.FC<ExpenseFormProps> = ({
  expense,
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
      category: expense?.category || undefined,
      processed: expense?.processed || undefined,
      ai_service_used: expense?.ai_service_used || undefined,
      manual_entry: expense?.manual_entry || true
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
      trip_id: data.trip_id,
      image_path: data.image_path,
      merchant: data.merchant,
      amount: data.amount,
      tax_amount: data.tax_amount,
      tax_type: data.tax_type,
      tax_rate: data.tax_rate,
      date: data.date,
      category: data.category,
      processed: data.processed,
      ai_service_used: data.ai_service_used,
      manual_entry: data.manual_entry,
    });
  };

  return (
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.formContent}>
          {/* Trip ID */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Trip</Text>
            <Controller
              control={control}
              name="trip_id"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isLoading}
                />
              )}
            />
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
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="e.g., Uber"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isLoading}
                />
              )}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
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
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isLoading}
                />
              )}
            />
          </View>
          {/* Tax Amount */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Tax Amount</Text>
            <Controller
              control={control}
              name="tax_amount"
              rules={{
                min: {
                  value: 0.01,
                  message: 'Tax Amount must be greater than 0.00',
                  }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="5.00"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isLoading}
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
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="e.g. VAT"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isLoading}
                />
              )}
            />
          </View>
          {/* Tax Rate */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Tax Rate</Text>
            <Controller
              control={control}
              name="tax_rate"
              rules={{
                min: {
                  value: 0.01,
                  message: 'Tax Amount must be greater than 0.00',
                  }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="5.00"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isLoading}
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
          {/* Category */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Category <Text style={styles.required}>*</Text>
            </Text>
            <Controller
              control={control}
              name="category"
              rules={{
                required: 'Category is required',
                minLength: {
                  value: 1,
                  message: 'Category name must be at least 1 characters',
                },
                maxLength: {
                  value: 100,
                  message: 'Category name cannot exceed 100 characters',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="e.g., Transport"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isLoading}
                />
              )}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
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
