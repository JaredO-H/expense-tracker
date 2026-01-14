/**
 * Expense Detail Screen
 * Displays expense details with edit and delete capabilities
 * Refactored to use centralized screenStyles
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
  Image,
} from 'react-native';
import { useExpenseStore } from '../../stores/expenseStore';
import { ExpenseForm } from '../../components/forms/ExpenseForm';
import { CreateExpenseModel } from '../../types/database';
import { format } from 'date-fns';
import fileService from '../../services/storage/fileService';
import {
  colors as staticColors,
  spacing,
  textStyles,
  commonStyles,
  screenStyles,
  borderRadius,
  shadows,
} from '../../styles';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

interface ExpenseDetailScreenProps {
  route: any;
  navigation: any;
}

export const ExpenseDetailScreen: React.FC<ExpenseDetailScreenProps> = ({ route, navigation }) => {
  const { expenseId } = route.params;
  const { expenses, updateExpense, deleteExpense, isLoading } = useExpenseStore();
  const { colors, themeVersion } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [imageExists, setImageExists] = useState(false);

  const expense = expenses.find(t => t.id === expenseId);

  // Verify receipt image exists
  useEffect(() => {
    const verifyImage = async () => {
      if (expense?.image_path) {
        const exists = await fileService.getReceiptImage(expense.image_path);
        setImageExists(!!exists);
      } else {
        setImageExists(false);
      }
    };

    verifyImage();
  }, [expense?.image_path]);

  useEffect(() => {
    if (!expense) {
      Alert.alert('Error', 'Expense not found', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, [expense, navigation]);

  useEffect(() => {
    if (expense) {
      navigation.setOptions({
        title: expense.merchant,
      });
    }
  }, [expense, navigation]);

  const handleUpdate = async (data: CreateExpenseModel) => {
    if (!expense) {
      return;
    }

    const originalImagePath = expense.image_path;
    const newImagePath = data.image_path;

    try {
      await updateExpense({
        id: expense.id,
        ...data,
      });

      // Clean up replaced image after successful save
      if (originalImagePath && newImagePath !== originalImagePath) {
        try {
          await fileService.deleteReceiptImage(originalImagePath);
        } catch (error) {
          console.error('Failed to cleanup old image:', error);
          // Continue even if cleanup fails
        }
      }

      setIsEditing(false);
      Alert.alert('Success', 'Expense updated successfully');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update expense');
    }
  };

  const handleViewImage = () => {
    if (expense?.image_path && imageExists) {
      navigation.navigate('ReceiptImageViewer' as never, { imagePath: expense.image_path } as never);
    }
  };

  const handleDelete = () => {
    if (!expense) {
      return;
    }

    Alert.alert('Delete Expense', `Are you sure you want to delete "${expense.merchant}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            // Delete expense image first if it exists
            if (expense.image_path) {
              try {
                await fileService.deleteReceiptImage(expense.image_path);
              } catch (error) {
                console.error('Failed to cleanup image:', error);
                // Continue with deletion even if image cleanup fails
              }
            }

            await deleteExpense(expense.id);
            Alert.alert('Success', 'Expense deleted successfully', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          } catch (error) {
            Alert.alert(
              'Error',
              error instanceof Error ? error.message : 'Failed to delete expense',
            );
          }
        },
      },
    ]);
  };

  if (!expense) {
    return (
      <View style={[screenStyles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isEditing) {
    return (
      <View style={[screenStyles.screenContainer, { backgroundColor: colors.background }]}>
        <ExpenseForm
          expense={expense}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isLoading={isLoading}
        />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.containerGray, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={styles.content}>
        {/* Expense Information Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
          ]}>
          <Text style={[screenStyles.sectionTitle, { color: colors.textSecondary }]}>
            Expense Information
          </Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Merchant Name</Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {expense.merchant}
            </Text>
          </View>

          {expense.amount && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Amount</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {expense.amount}
              </Text>
            </View>
          )}

          {expense.tax_amount && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Tax Amount</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {expense.tax_amount}
              </Text>
            </View>
          )}

          {expense.tax_type && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Tax Type</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {expense.tax_type}
              </Text>
            </View>
          )}

          {expense.tax_rate && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Tax Rate</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {expense.tax_rate}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Date</Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {format(new Date(expense.date), 'MMMM dd, yyyy')}
            </Text>
          </View>

          {expense.time && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Time</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{expense.time}</Text>
            </View>
          )}

          {expense.category && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Category</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {expense.category}
              </Text>
            </View>
          )}

          {expense.notes && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Notes</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{expense.notes}</Text>
            </View>
          )}

          {expense.capture_method && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Capture Method</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {expense.capture_method}
              </Text>
            </View>
          )}

          {expense.ai_service_used && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>
                Ai Service Used
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {expense.ai_service_used}
              </Text>
            </View>
          )}
        </View>

        {/* Receipt Image Card */}
        {expense.image_path && imageExists && (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
            ]}>
            <Text style={[screenStyles.sectionTitle, { color: colors.textSecondary }]}>
              Receipt Image
            </Text>
            <View style={styles.receiptImageContainer}>
              {/* Thumbnail */}
              <View style={[styles.thumbnailContainer, { borderColor: colors.border }]}>
                <Image
                  source={{ uri: `file://${expense.image_path}` }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              </View>

              {/* View Button */}
              <View style={styles.receiptActionsContainer}>
                <TouchableOpacity
                  style={styles.receiptActionButton}
                  onPress={handleViewImage}>
                  <Icon name="eye-outline" size={24} color={colors.primary} />
                  <Text style={[styles.receiptActionText, { color: colors.primary }]}>
                    View Full Size
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Metadata Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
          ]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Created</Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
              {format(new Date(expense.created_at), 'MMM dd, yyyy HH:mm')}
            </Text>
          </View>
          {expense.updated_at && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Last Updated</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {format(new Date(expense.updated_at), 'MMM dd, yyyy HH:mm')}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.editButton,
              { backgroundColor: colors.primary, borderColor: colors.border },
            ]}
            onPress={() => setIsEditing(true)}>
            <Text style={[styles.editButtonText, { color: colors.textInverse }]}>Edit Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.deleteButton,
              { backgroundColor: colors.background, borderColor: colors.errorDark },
            ]}
            onPress={handleDelete}>
            <Text style={[styles.deleteButtonText, { color: colors.errorDark }]}>
              Delete Expense
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Gray container for detail view
  containerGray: {
    ...commonStyles.containerGray,
  },

  // Content padding
  content: {
    padding: spacing.base,
  },

  // Card styling
  card: {
    ...commonStyles.card,
    marginBottom: spacing.base,
  },

  // Info Row styling
  infoRow: {
    marginBottom: spacing.md,
  },
  infoLabel: {
    ...textStyles.labelSmall,
    color: staticColors.textTertiary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    ...textStyles.bodyLarge,
  },

  // Action Buttons
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
    backgroundColor: staticColors.background,
    borderWidth: 2,
    borderColor: staticColors.errorDark,
  },
  deleteButtonText: {
    ...textStyles.button,
    color: staticColors.errorDark,
  },

  // Receipt Image Styles
  receiptImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  thumbnailContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    overflow: 'hidden',
    ...shadows.small,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  receiptActionsContainer: {
    flex: 1,
    marginLeft: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptActionButton: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  receiptActionText: {
    ...textStyles.label,
    fontSize: 14,
    marginTop: spacing.xs,
    fontWeight: '700',
  },
});
