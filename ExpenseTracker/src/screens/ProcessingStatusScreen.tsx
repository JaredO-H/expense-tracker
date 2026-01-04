/**
 * Processing Status Screen
 * Display and manage receipt processing queue
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { processingQueue, QueueItem } from '../services/queue/processingQueue';
import { colors as staticColors, spacing, borderRadius, textStyles, commonStyles } from '../styles';
import { AI_SERVICE_CONFIGS } from '../types/aiService';
import { useTheme } from '../contexts/ThemeContext';
import { ProcessingTimeoutDialog } from '../components/ocr/ProcessingTimeoutDialog';

export const ProcessingStatusScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, themeVersion } = useTheme();
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [timeoutDialogVisible, setTimeoutDialogVisible] = useState(false);
  const [timeoutItemId, setTimeoutItemId] = useState<string | null>(null);
  const [timeoutWaitingTime, setTimeoutWaitingTime] = useState(0);
  const [timeoutResolve, setTimeoutResolve] = useState<
    ((value: 'continue' | 'offline') => void) | null
  >(null);

  /**
   * Load queue items
   */
  const loadQueueItems = () => {
    const items = processingQueue.getAllItems();
    // Sort by created date (newest first)
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    setQueueItems(items);
  };

  /**
   * Initialize and subscribe to queue changes
   */
  useEffect(() => {
    loadQueueItems();

    // Set up timeout callback for processing queue
    processingQueue.setTimeoutCallback(async (itemId: string, waitingTime: number) => {
      // Return a promise that will be resolved when user makes a choice
      return new Promise<'continue' | 'offline'>(resolve => {
        setTimeoutItemId(itemId);
        setTimeoutWaitingTime(waitingTime);
        setTimeoutResolve(() => resolve);
        setTimeoutDialogVisible(true);
      });
    });

    // Subscribe to queue updates
    const unsubscribe = processingQueue.subscribe(() => {
      loadQueueItems();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Handle refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    loadQueueItems();
    setRefreshing(false);
  };

  /**
   * Handle user choosing to continue waiting for AI processing
   */
  const handleContinueWaiting = () => {
    if (timeoutResolve) {
      timeoutResolve('continue');
      setTimeoutDialogVisible(false);
      setTimeoutItemId(null);
      setTimeoutResolve(null);
    }
  };

  /**
   * Handle user choosing to switch to offline OCR
   */
  const handleSwitchToOffline = () => {
    if (timeoutResolve) {
      timeoutResolve('offline');
      setTimeoutDialogVisible(false);
      setTimeoutItemId(null);
      setTimeoutResolve(null);
    }
  };

  /**
   * Handle retry failed item
   */
  const handleRetry = async (item: QueueItem) => {
    try {
      await processingQueue.retryItem(item.id);
      Alert.alert('Retry Queued', 'The receipt will be processed again.');
    } catch (error) {
      Alert.alert('Error', 'Failed to retry processing.');
    }
  };

  /**
   * Handle remove item
   */
  const handleRemove = async (item: QueueItem) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item from the queue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await processingQueue.removeItem(item.id);
        },
      },
    ]);
  };

  /**
   * Handle clear completed
   */
  const handleClearCompleted = async () => {
    const completedCount = queueItems.filter(item => item.status === 'completed').length;

    if (completedCount === 0) {
      Alert.alert('No Completed Items', 'There are no completed items to clear.');
      return;
    }

    Alert.alert(
      'Clear Completed',
      `Remove ${completedCount} completed item${completedCount > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await processingQueue.clearCompleted();
            Alert.alert('Success', 'Completed items have been cleared.');
          },
        },
      ],
    );
  };

  /**
   * Handle tapping completed item to verify
   */
  const handleVerifyItem = (item: QueueItem) => {
    if (item.status === 'completed' && item.result) {
      navigation.navigate('ReceiptVerification' as never, { queueItemId: item.id } as never);
    }
  };

  /**
   * Get status color
   */
  const getStatusColor = (status: QueueItem['status']) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'processing':
        return colors.primary;
      case 'completed':
        return colors.success;
      case 'failed':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  /**
   * Get status icon
   */
  const getStatusIconName = (status: QueueItem['status']) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'processing':
        return 'sync-outline';
      case 'completed':
        return 'checkmark-circle';
      case 'failed':
        return 'close-circle';
      default:
        return 'help-circle-outline';
    }
  };

  /**
   * Render queue item
   */
  /**
   * Get processing method badge color and label
   */
  const getProcessingMethodBadge = (serviceId: QueueItem['serviceId']) => {
    if (serviceId === 'mlkit') {
      return { label: 'OCR', color: '#FF8C00', iconName: 'phone-portrait-outline' }; // Orange
    } else if (serviceId === 'openai' || serviceId === 'anthropic' || serviceId === 'gemini') {
      return { label: 'AI', color: colors.primary, iconName: 'hardware-chip-outline' }; // Blue
    } else {
      return { label: 'Manual', color: colors.textSecondary, iconName: 'create-outline' }; // Gray
    }
  };

  const renderItem = ({ item }: { item: QueueItem }) => {
    const serviceName = AI_SERVICE_CONFIGS[item.serviceId].name;
    const statusColor = getStatusColor(item.status);
    const statusIconName = getStatusIconName(item.status);
    const isCompleted = item.status === 'completed' && item.result;
    const methodBadge = getProcessingMethodBadge(item.serviceId);

    const cardContent = (
      <View
        style={[
          styles.itemCard,
          { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
        ]}>
        <View style={styles.itemHeader}>
          <View style={[styles.statusBadge, { backgroundColor: colors.backgroundSecondary }]}>
            <Icon name={statusIconName} size={16} color={statusColor} style={styles.statusIcon} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleRemove(item)} style={styles.removeButton}>
            <Icon name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.itemBody}>
          <View style={styles.serviceRow}>
            <Text style={[styles.serviceText, { color: colors.textPrimary }]}>
              Service: {serviceName}
            </Text>
            <View
              style={[
                styles.methodBadge,
                { backgroundColor: methodBadge.color + '20', borderColor: methodBadge.color },
              ]}>
              <Icon
                name={methodBadge.iconName}
                size={12}
                color={methodBadge.color}
                style={styles.methodIcon}
              />
              <Text style={[styles.methodText, { color: methodBadge.color }]}>
                {methodBadge.label}
              </Text>
            </View>
          </View>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            Created: {new Date(item.createdAt).toLocaleString()}
          </Text>

          {item.status === 'processing' && (
            <View style={styles.processingIndicator}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.processingText, { color: colors.primary }]}>Processing...</Text>
            </View>
          )}

          {item.status === 'completed' && item.result && (
            <View
              style={[
                styles.resultContainer,
                { backgroundColor: colors.backgroundSecondary, borderLeftColor: colors.success },
              ]}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Result:</Text>
              <Text style={[styles.resultText, { color: colors.textPrimary }]}>
                {item.result.merchant} - ${(item.result.amount || 0).toFixed(2)}
              </Text>
              <Text style={[styles.resultDate, { color: colors.textSecondary }]}>
                {item.result.date}
              </Text>
              <Text style={[styles.confidenceText, { color: colors.textSecondary }]}>
                Confidence: {(item.result.confidence * 100).toFixed(0)}%
              </Text>
              {item.processedAt && (
                <Text style={[styles.processedAtText, { color: colors.textSecondary }]}>
                  Processed: {new Date(item.processedAt).toLocaleString()}
                </Text>
              )}
              <View style={styles.tapToVerifyContainer}>
                <Icon
                  name="hand-left-outline"
                  size={16}
                  color={colors.primary}
                  style={styles.tapIcon}
                />
                <Text style={[styles.tapToVerifyText, { color: colors.primary }]}>
                  Tap to verify and create expense
                </Text>
              </View>
            </View>
          )}

          {item.status === 'failed' && (
            <View
              style={[
                styles.errorContainer,
                { backgroundColor: colors.backgroundSecondary, borderLeftColor: colors.error },
              ]}>
              <Text style={[styles.errorLabel, { color: colors.error }]}>Error:</Text>
              <Text style={[styles.errorText, { color: colors.textSecondary }]}>
                {item.error || 'Unknown error'}
              </Text>
              <Text style={[styles.retryText, { color: colors.textSecondary }]}>
                Retry {item.retryCount}/{item.maxRetries}
              </Text>
              {item.retryCount < item.maxRetries && (
                <TouchableOpacity
                  style={[styles.retryButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleRetry(item)}>
                  <Text style={[styles.retryButtonText, { color: colors.textInverse }]}>
                    Retry Now
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {item.status === 'pending' && (
            <View
              style={[styles.pendingContainer, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.pendingText, { color: colors.textSecondary }]}>
                Priority: {item.priority}
              </Text>
              {item.retryCount > 0 && (
                <Text style={[styles.retryText, { color: colors.textSecondary }]}>
                  Retry attempt {item.retryCount}/{item.maxRetries}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    );

    // Wrap completed items in TouchableOpacity to make them tappable
    if (isCompleted) {
      return (
        <TouchableOpacity
          style={styles.completedItemWrapper}
          onPress={() => handleVerifyItem(item)}
          activeOpacity={0.7}>
          {cardContent}
        </TouchableOpacity>
      );
    }

    return cardContent;
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon
        name="clipboard-outline"
        size={64}
        color={colors.textDisabled}
        style={styles.emptyIcon}
      />
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Processing Items</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Capture a receipt to see it appear here for processing.
      </Text>
    </View>
  );

  /**
   * Get queue statistics
   */
  const getQueueStats = () => {
    const pending = queueItems.filter(item => item.status === 'pending').length;
    const processing = queueItems.filter(item => item.status === 'processing').length;
    const completed = queueItems.filter(item => item.status === 'completed').length;
    const failed = queueItems.filter(item => item.status === 'failed').length;

    return { pending, processing, completed, failed };
  };

  const stats = getQueueStats();
  const hasCompleted = stats.completed > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} key={themeVersion}>
      {/* Header Stats */}
      <View
        style={[
          styles.statsContainer,
          { backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stats.pending}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{stats.processing}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Processing</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.success }]}>{stats.completed}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.error }]}>{stats.failed}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Failed</Text>
        </View>
      </View>

      {/* Clear Completed Button */}
      {hasCompleted && (
        <TouchableOpacity
          style={[styles.clearButton, { backgroundColor: colors.error }]}
          onPress={handleClearCompleted}>
          <Text style={[styles.clearButtonText, { color: colors.textInverse }]}>
            Clear Completed
          </Text>
        </TouchableOpacity>
      )}

      {/* Queue List */}
      <FlatList
        data={queueItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />

      {/* Timeout Dialog */}
      <ProcessingTimeoutDialog
        visible={timeoutDialogVisible}
        onContinueWaiting={handleContinueWaiting}
        onSwitchToOffline={handleSwitchToOffline}
        waitingTime={timeoutWaitingTime}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.flex1,
    backgroundColor: staticColors.background,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: staticColors.background,
    borderBottomWidth: 1,
    borderBottomColor: staticColors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...textStyles.h2,
    color: staticColors.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...textStyles.caption,
    color: staticColors.textSecondary,
  },
  clearButton: {
    margin: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: staticColors.error,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  clearButtonText: {
    ...textStyles.button,
    color: staticColors.textInverse,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  itemCard: {
    backgroundColor: staticColors.background,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: staticColors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: staticColors.backgroundSecondary,
    borderRadius: borderRadius.sm,
  },
  statusIcon: {
    marginRight: spacing.xs,
  },
  statusText: {
    ...textStyles.caption,
    fontWeight: '600',
  },
  removeButton: {
    padding: spacing.xs,
  },
  itemBody: {
    gap: spacing.xs,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  serviceText: {
    ...textStyles.body,
    color: staticColors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    marginLeft: spacing.sm,
  },
  methodIcon: {
    marginRight: spacing.xs / 2,
  },
  methodText: {
    ...textStyles.caption,
    fontWeight: '600',
    fontSize: 11,
  },
  dateText: {
    ...textStyles.caption,
    color: staticColors.textSecondary,
  },
  processingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  processingText: {
    ...textStyles.body,
    color: staticColors.primary,
    fontStyle: 'italic',
  },
  resultContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: staticColors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: staticColors.success,
  },
  resultLabel: {
    ...textStyles.caption,
    color: staticColors.textSecondary,
    marginBottom: spacing.xs,
  },
  resultText: {
    ...textStyles.body,
    color: staticColors.textPrimary,
    fontWeight: '600',
  },
  resultDate: {
    ...textStyles.caption,
    color: staticColors.textSecondary,
    marginTop: spacing.xs,
  },
  confidenceText: {
    ...textStyles.caption,
    color: staticColors.textSecondary,
    marginTop: spacing.xs,
  },
  processedAtText: {
    ...textStyles.caption,
    color: staticColors.textSecondary,
    marginTop: spacing.xs,
  },
  errorContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: staticColors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: staticColors.error,
  },
  errorLabel: {
    ...textStyles.caption,
    color: staticColors.error,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  errorText: {
    ...textStyles.caption,
    color: staticColors.textSecondary,
  },
  retryText: {
    ...textStyles.caption,
    color: staticColors.textSecondary,
    marginTop: spacing.xs,
  },
  retryButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: staticColors.primary,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    ...textStyles.caption,
    color: staticColors.textInverse,
    fontWeight: '600',
  },
  pendingContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: staticColors.backgroundSecondary,
    borderRadius: borderRadius.sm,
  },
  pendingText: {
    ...textStyles.caption,
    color: staticColors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...textStyles.h2,
    color: staticColors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...textStyles.body,
    color: staticColors.textSecondary,
    textAlign: 'center',
  },
  tapToVerifyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  tapIcon: {
    marginRight: spacing.xs,
  },
  tapToVerifyText: {
    ...textStyles.caption,
    color: staticColors.primary,
    fontWeight: '600',
  },
  completedItemWrapper: {
    // No additional styles needed, TouchableOpacity handles the touch feedback
  },
});
