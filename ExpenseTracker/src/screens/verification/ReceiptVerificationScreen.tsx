/**
 * ReceiptVerificationScreen
 * Full-screen verification interface with sliding drawer overlay
 * Combines receipt image viewer and editable expense form
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { ReceiptImageViewer } from '../../components/verification/ReceiptImageViewer';
import { SlidingDrawer } from '../../components/verification/SlidingDrawer';
import { VerificationForm } from '../../components/verification/VerificationForm';
import { processingQueue } from '../../services/queue/processingQueue';
import { useExpenseStore } from '../../stores/expenseStore';
import { mapQueueItemToExpense } from '../../utils/expenseMapper';
import { CreateExpenseModel } from '../../types/database';
import { QueueItem } from '../../services/queue/processingQueue';
import { useTheme } from '../../contexts/ThemeContext';

interface ReceiptVerificationScreenProps {
  route: {
    params: {
      queueItemId: string;
    };
  };
}

export const ReceiptVerificationScreen: React.FC<ReceiptVerificationScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { createExpense } = useExpenseStore();
  const { colors, themeVersion } = useTheme(); // Theme hook for consistency, child components handle their own theming

  const [queueItem, setQueueItem] = useState<QueueItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load queue item on mount
  useEffect(() => {
    const loadQueueItem = () => {
      const item = processingQueue.getItem(route.params.queueItemId);

      if (!item) {
        Alert.alert(
          'Item Not Found',
          'The receipt processing item could not be found.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
        return;
      }

      if (item.status !== 'completed' || !item.result) {
        Alert.alert(
          'Not Ready',
          'This receipt has not been processed yet.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
        return;
      }

      setQueueItem(item);
      setIsLoading(false);
    };

    loadQueueItem();
  }, [route.params.queueItemId, navigation]);

  // Handle save - create expense and remove from queue
  const handleSave = async (expenseData: CreateExpenseModel) => {
    if (!queueItem) return;

    try {
      setIsSaving(true);

      // Create expense in database
      await createExpense(expenseData);

      // Remove item from processing queue
      await processingQueue.removeItem(queueItem.id);

      // Show success message
      Alert.alert(
        'Expense Created',
        'Your expense has been saved successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Failed to save expense:', error);
      Alert.alert(
        'Save Failed',
        'Failed to save the expense. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel - confirm if user wants to discard
  const handleCancel = () => {
    Alert.alert(
      'Discard Changes?',
      'Are you sure you want to discard this receipt? You can verify it later from the processing queue.',
      [
        {
          text: 'Keep Editing',
          style: 'cancel',
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  // Handle image load error
  const handleImageError = () => {
    Alert.alert(
      'Image Error',
      'Failed to load the receipt image. The file may be corrupted or missing.',
      [{ text: 'OK' }]
    );
  };

  if (isLoading || !queueItem) {
    return <View style={styles.container} />;
  }

  const initialData = mapQueueItemToExpense(queueItem);

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Background: Receipt Image */}
      <ReceiptImageViewer
        imageUri={queueItem.imageUri}
        onLoadError={handleImageError}
      />

      {/* Foreground: Sliding Drawer with Form */}
      <SlidingDrawer
        snapPoints={[0.25, 0.5, 0.9]}
        initialSnapPoint={2} // Start at 90%
        onClose={handleCancel}>
        <VerificationForm
          queueItem={queueItem}
          initialData={initialData}
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isSaving}
        />
      </SlidingDrawer>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
