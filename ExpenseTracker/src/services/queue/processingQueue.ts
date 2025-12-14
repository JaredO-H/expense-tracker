/**
 * Processing Queue
 * Manages async processing of receipt images with AI services
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIServiceId, ReceiptProcessingResult } from '../../types/aiService';
import { processImageForAI } from '../ai/imageProcessor';
import { processReceiptWithAI } from '../ai/aiServiceClient';

export type QueueItemStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type QueuePriority = 'immediate' | 'normal' | 'retry';

export interface QueueItem {
  id: string;
  imageUri: string;
  serviceId: AIServiceId;
  status: QueueItemStatus;
  priority: QueuePriority;
  createdAt: Date;
  processedAt?: Date;
  result?: ReceiptProcessingResult;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

interface ProcessingQueueState {
  items: QueueItem[];
  isProcessing: boolean;
  concurrentLimit: number;
}

const QUEUE_STORAGE_KEY = '@ExpenseTracker:ProcessingQueue';
const MAX_CONCURRENT = 2;
const MAX_RETRIES = 3;

class ProcessingQueue {
  private state: ProcessingQueueState = {
    items: [],
    isProcessing: false,
    concurrentLimit: MAX_CONCURRENT,
  };

  private listeners: Array<() => void> = [];

  /**
   * Initialize queue from storage
   */
  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.state.items = parsed.items.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          processedAt: item.processedAt ? new Date(item.processedAt) : undefined,
        }));

        // Reset processing status for items that were interrupted
        this.state.items.forEach(item => {
          if (item.status === 'processing') {
            item.status = 'pending';
          }
        });

        await this.saveQueue();
      }
    } catch (error) {
      console.error('Failed to initialize processing queue:', error);
    }
  }

  /**
   * Add item to queue
   */
  async addItem(
    imageUri: string,
    serviceId: AIServiceId,
    priority: QueuePriority = 'normal'
  ): Promise<string> {
    const item: QueueItem = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      imageUri,
      serviceId,
      status: 'pending',
      priority,
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: MAX_RETRIES,
    };

    this.state.items.push(item);
    await this.saveQueue();
    this.notifyListeners();

    // Start processing if not already
    if (!this.state.isProcessing) {
      this.startProcessing();
    }

    return item.id;
  }

  /**
   * Get queue item by ID
   */
  getItem(id: string): QueueItem | undefined {
    return this.state.items.find(item => item.id === id);
  }

  /**
   * Get all queue items
   */
  getAllItems(): QueueItem[] {
    return [...this.state.items];
  }

  /**
   * Get pending items count
   */
  getPendingCount(): number {
    return this.state.items.filter(
      item => item.status === 'pending' || item.status === 'processing'
    ).length;
  }

  /**
   * Remove item from queue
   */
  async removeItem(id: string): Promise<void> {
    this.state.items = this.state.items.filter(item => item.id !== id);
    await this.saveQueue();
    this.notifyListeners();
  }

  /**
   * Clear completed items
   */
  async clearCompleted(): Promise<void> {
    this.state.items = this.state.items.filter(item => item.status !== 'completed');
    await this.saveQueue();
    this.notifyListeners();
  }

  /**
   * Retry failed item
   */
  async retryItem(id: string): Promise<void> {
    const item = this.state.items.find(i => i.id === id);
    if (item && item.status === 'failed') {
      item.status = 'pending';
      item.retryCount = 0;
      item.error = undefined;
      await this.saveQueue();
      this.notifyListeners();

      if (!this.state.isProcessing) {
        this.startProcessing();
      }
    }
  }

  /**
   * Start processing queue
   */
  private async startProcessing(): Promise<void> {
    if (this.state.isProcessing) {
      return;
    }

    this.state.isProcessing = true;
    this.notifyListeners();

    while (this.hasItemsToProcess()) {
      await this.processNextBatch();
    }

    this.state.isProcessing = false;
    this.notifyListeners();
  }

  /**
   * Check if there are items to process
   */
  private hasItemsToProcess(): boolean {
    return this.state.items.some(
      item =>
        item.status === 'pending' &&
        item.retryCount < item.maxRetries
    );
  }

  /**
   * Process next batch of items
   */
  private async processNextBatch(): Promise<void> {
    // Get pending items sorted by priority
    const pending = this.state.items
      .filter(item => item.status === 'pending')
      .sort((a, b) => {
        const priorityOrder = { immediate: 0, normal: 1, retry: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

    // Process up to concurrent limit
    const batch = pending.slice(0, this.state.concurrentLimit);

    if (batch.length === 0) {
      return;
    }

    await Promise.all(batch.map(item => this.processItem(item)));
  }

  /**
   * Process single queue item
   */
  private async processItem(item: QueueItem): Promise<void> {
    try {
      // Update status to processing
      item.status = 'processing';
      await this.saveQueue();
      this.notifyListeners();

      console.log(`Processing receipt ${item.id} with ${item.serviceId}`);

      // Preprocess image
      const processedImage = await processImageForAI(item.imageUri);

      // Process with AI service
      const result = await processReceiptWithAI(item.serviceId, processedImage.base64);

      // Mark as completed
      item.status = 'completed';
      item.result = result;
      item.processedAt = new Date();
      item.error = undefined;

      console.log(`Successfully processed receipt ${item.id}`);
    } catch (error) {
      console.error(`Failed to process receipt ${item.id}:`, error);

      item.retryCount++;

      if (item.retryCount >= item.maxRetries) {
        item.status = 'failed';
        item.error = error instanceof Error ? error.message : 'Unknown error';
      } else {
        item.status = 'pending';
        item.priority = 'retry';
      }
    } finally {
      await this.saveQueue();
      this.notifyListeners();
    }
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        QUEUE_STORAGE_KEY,
        JSON.stringify({
          items: this.state.items,
        })
      );
    } catch (error) {
      console.error('Failed to save processing queue:', error);
    }
  }

  /**
   * Subscribe to queue changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

// Export singleton instance
export const processingQueue = new ProcessingQueue();
