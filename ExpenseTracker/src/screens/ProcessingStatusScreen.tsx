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
import { processingQueue, QueueItem } from '../services/queue/processingQueue';
import { colors, spacing, borderRadius, textStyles, commonStyles } from '../styles';
import { AI_SERVICE_CONFIGS } from '../types/aiService';

export const ProcessingStatusScreen: React.FC = () => {
  const navigation = useNavigation();
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from the queue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await processingQueue.removeItem(item.id);
          },
        },
      ]
    );
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
      ]
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
  const getStatusIcon = (status: QueueItem['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'processing':
        return '🔄';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '❓';
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
      return { label: 'OCR', color: '#FF8C00', icon: '📱' }; // Orange
    } else if (serviceId === 'openai' || serviceId === 'anthropic' || serviceId === 'gemini') {
      return { label: 'AI', color: colors.primary, icon: '🤖' }; // Blue
    } else {
      return { label: 'Manual', color: colors.textSecondary, icon: '✍️' }; // Gray
    }
  };

  const renderItem = ({ item }: { item: QueueItem }) => {
    const serviceName = AI_SERVICE_CONFIGS[item.serviceId].name;
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);
    const isCompleted = item.status === 'completed' && item.result;
    const methodBadge = getProcessingMethodBadge(item.serviceId);

    const cardContent = (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusIcon}>{statusIcon}</Text>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleRemove(item)}
            style={styles.removeButton}
          >
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.itemBody}>
          <View style={styles.serviceRow}>
            <Text style={styles.serviceText}>Service: {serviceName}</Text>
            <View style={[styles.methodBadge, { backgroundColor: methodBadge.color + '20', borderColor: methodBadge.color }]}>
              <Text style={styles.methodIcon}>{methodBadge.icon}</Text>
              <Text style={[styles.methodText, { color: methodBadge.color }]}>
                {methodBadge.label}
              </Text>
            </View>
          </View>
          <Text style={styles.dateText}>
            Created: {new Date(item.createdAt).toLocaleString()}
          </Text>

          {item.status === 'processing' && (
            <View style={styles.processingIndicator}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.processingText}>Processing...</Text>
            </View>
          )}

          {item.status === 'completed' && item.result && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultLabel}>Result:</Text>
              <Text style={styles.resultText}>
                {item.result.merchant} - ${(item.result.amount || 0).toFixed(2)}
              </Text>
              <Text style={styles.resultDate}>
                {item.result.date}
              </Text>
              <Text style={styles.confidenceText}>
                Confidence: {(item.result.confidence * 100).toFixed(0)}%
              </Text>
              {item.processedAt && (
                <Text style={styles.processedAtText}>
                  Processed: {new Date(item.processedAt).toLocaleString()}
                </Text>
              )}
              <Text style={styles.tapToVerifyText}>
                👆 Tap to verify and create expense
              </Text>
            </View>
          )}

          {item.status === 'failed' && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorLabel}>Error:</Text>
              <Text style={styles.errorText}>{item.error || 'Unknown error'}</Text>
              <Text style={styles.retryText}>
                Retry {item.retryCount}/{item.maxRetries}
              </Text>
              {item.retryCount < item.maxRetries && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => handleRetry(item)}
                >
                  <Text style={styles.retryButtonText}>Retry Now</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {item.status === 'pending' && (
            <View style={styles.pendingContainer}>
              <Text style={styles.pendingText}>
                Priority: {item.priority}
              </Text>
              {item.retryCount > 0 && (
                <Text style={styles.retryText}>
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
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No Processing Items</Text>
      <Text style={styles.emptyText}>
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
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {stats.processing}
          </Text>
          <Text style={styles.statLabel}>Processing</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.success }]}>
            {stats.completed}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.error }]}>
            {stats.failed}
          </Text>
          <Text style={styles.statLabel}>Failed</Text>
        </View>
      </View>

      {/* Clear Completed Button */}
      {hasCompleted && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearCompleted}
        >
          <Text style={styles.clearButtonText}>Clear Completed</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.flex1,
    backgroundColor: colors.background,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...textStyles.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  clearButton: {
    margin: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  clearButtonText: {
    ...textStyles.button,
    color: colors.textInverse,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  itemCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
  },
  statusIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  statusText: {
    ...textStyles.caption,
    fontWeight: '600',
  },
  removeButton: {
    padding: spacing.xs,
  },
  removeButtonText: {
    ...textStyles.h3,
    color: colors.textSecondary,
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
    color: colors.textPrimary,
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
    fontSize: 12,
    marginRight: spacing.xs / 2,
  },
  methodText: {
    ...textStyles.caption,
    fontWeight: '600',
    fontSize: 11,
  },
  dateText: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  processingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  processingText: {
    ...textStyles.body,
    color: colors.primary,
    fontStyle: 'italic',
  },
  resultContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  resultLabel: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  resultText: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  resultDate: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  confidenceText: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  processedAtText: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  errorContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  errorLabel: {
    ...textStyles.caption,
    color: colors.error,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  errorText: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  retryText: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  retryButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    ...textStyles.caption,
    color: colors.textInverse,
    fontWeight: '600',
  },
  pendingContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
  },
  pendingText: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...textStyles.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tapToVerifyText: {
    ...textStyles.caption,
    color: colors.primary,
    marginTop: spacing.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  completedItemWrapper: {
    // No additional styles needed, TouchableOpacity handles the touch feedback
  },
});
