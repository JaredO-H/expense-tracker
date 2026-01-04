/**
 * Processing Queue
 * Manages async processing of receipt images with AI services
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIServiceId, ReceiptProcessingResult } from '../../types/aiService';
import { processImageForAI } from '../ai/imageProcessor';
import { processReceiptWithAI } from '../ai/aiServiceClient';
import { recognizeText } from '../ocr/mlKitService';
import { parseReceipt } from '../ocr/receiptParser';

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
  startedProcessingAt?: Date;
  result?: ReceiptProcessingResult;
  error?: string;
  retryCount: number;
  maxRetries: number;
  timeoutExtended?: boolean;
  switchToOffline?: boolean;
}

interface ProcessingQueueState {
  items: QueueItem[];
  isProcessing: boolean;
  concurrentLimit: number;
}

export type TimeoutCallback = (
  itemId: string,
  waitingTime: number,
) => Promise<'continue' | 'offline'>;

const QUEUE_STORAGE_KEY = '@ExpenseTracker:ProcessingQueue';
const MAX_CONCURRENT = 2;
const MAX_RETRIES = 3;
const INITIAL_TIMEOUT = 30000; // 30 seconds
const EXTENDED_TIMEOUT = 30000; // Additional 30 seconds

class ProcessingQueue {
  private state: ProcessingQueueState = {
    items: [],
    isProcessing: false,
    concurrentLimit: MAX_CONCURRENT,
  };

  private listeners: Array<() => void> = [];
  private timeoutCallback?: TimeoutCallback;

  /**
   * Set callback for timeout events
   */
  setTimeoutCallback(callback: TimeoutCallback): void {
    this.timeoutCallback = callback;
  }

  //Initialize queue from storage
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

  //Add item to queue
  async addItem(
    imageUri: string,
    serviceId: AIServiceId,
    priority: QueuePriority = 'normal',
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

  //Get queue item by ID
  getItem(id: string): QueueItem | undefined {
    return this.state.items.find(item => item.id === id);
  }

  //Get all queue items
  getAllItems(): QueueItem[] {
    return [...this.state.items];
  }

  //Get pending items count
  getPendingCount(): number {
    return this.state.items.filter(
      item => item.status === 'pending' || item.status === 'processing',
    ).length;
  }

  //Remove item from queue
  async removeItem(id: string): Promise<void> {
    this.state.items = this.state.items.filter(item => item.id !== id);
    await this.saveQueue();
    this.notifyListeners();
  }

  //Clear completed items
  async clearCompleted(): Promise<void> {
    this.state.items = this.state.items.filter(item => item.status !== 'completed');
    await this.saveQueue();
    this.notifyListeners();
  }

  //Retry failed item
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

  //Start processing queue
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

  //Check if there are items to process
  private hasItemsToProcess(): boolean {
    return this.state.items.some(
      item => item.status === 'pending' && item.retryCount < item.maxRetries,
    );
  }

  //Process next batch of items
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

  //Process single queue item
  private async processItem(item: QueueItem): Promise<void> {
    try {
      // Update status to processing
      item.status = 'processing';
      item.startedProcessingAt = new Date();
      await this.saveQueue();
      this.notifyListeners();

      console.log(`Processing receipt ${item.id} with ${item.serviceId}`);

      // Preprocess image
      const processedImage = await processImageForAI(item.imageUri);

      // Process with AI service with timeout handling
      const result = await this.processWithTimeout(item, processedImage.base64);

      if (result) {
        // Mark as completed
        item.status = 'completed';
        item.result = result;
        item.processedAt = new Date();
        item.error = undefined;

        console.log(`Successfully processed receipt ${item.id}`);
      }
    } catch (error) {
      console.error(`Failed to process receipt ${item.id}:`, error);

      item.retryCount++;

      if (item.retryCount >= item.maxRetries) {
        // Check if user chose to switch to offline
        if (item.switchToOffline) {
          console.log(`[Queue] User chose offline OCR for ${item.id}`);
          try {
            const offlineResult = await this.processWithOfflineOCR(item.imageUri);
            item.status = 'completed';
            item.result = offlineResult;
            item.serviceId = 'mlkit' as any;
            item.processedAt = new Date();
            item.error = undefined;
            console.log(`[Queue] Offline OCR successful for receipt ${item.id}`);
          } catch (ocrError) {
            console.error(`[Queue] Offline OCR also failed for ${item.id}:`, ocrError);
            item.status = 'failed';
            item.error = 'Offline processing failed. Please try manual entry.';
          }
        } else {
          // AI processing failed after all retries - try offline OCR as fallback
          console.log(
            `[Queue] AI processing exhausted retries. Attempting offline OCR fallback for ${item.id}`,
          );

          try {
            const offlineResult = await this.processWithOfflineOCR(item.imageUri);
            item.status = 'completed';
            item.result = offlineResult;
            item.serviceId = 'mlkit' as any;
            item.processedAt = new Date();
            item.error = undefined;
            console.log(`[Queue] Offline OCR successful for receipt ${item.id}`);
          } catch (ocrError) {
            console.error(`[Queue] Offline OCR also failed for ${item.id}:`, ocrError);
            item.status = 'failed';
            item.error = 'Both AI and offline processing failed. Please try manual entry.';
          }
        }
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
   * Process with AI service with timeout handling and user choice
   */
  private async processWithTimeout(
    item: QueueItem,
    base64Image: string,
  ): Promise<ReceiptProcessingResult | null> {
    const timeout = item.timeoutExtended ? EXTENDED_TIMEOUT : INITIAL_TIMEOUT;
    const waitingTime = timeout / 1000; // Convert to seconds

    return new Promise<ReceiptProcessingResult | null>((resolve, reject) => {
      // eslint-disable-next-line prefer-const
      let timeoutId: NodeJS.Timeout;
      let isResolved = false;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
      };

      // Start AI processing
      processReceiptWithAI(item.serviceId, base64Image)
        .then(result => {
          if (!isResolved) {
            cleanup();
            isResolved = true;
            resolve(result);
          }
        })
        .catch(error => {
          if (!isResolved) {
            cleanup();
            isResolved = true;
            reject(error);
          }
        });

      // Set up timeout
      timeoutId = setTimeout(async () => {
        if (isResolved) return;

        console.log(`[Queue] Timeout reached for ${item.id} after ${waitingTime}s`);

        // Call timeout callback if available
        if (this.timeoutCallback) {
          try {
            const userChoice = await this.timeoutCallback(item.id, waitingTime);

            if (userChoice === 'continue') {
              // User chose to continue waiting
              console.log(`[Queue] User chose to continue waiting for ${item.id}`);
              item.timeoutExtended = true;

              // Give it more time by creating a new timeout
              setTimeout(async () => {
                if (!isResolved) {
                  console.log(`[Queue] Extended timeout also reached for ${item.id}`);
                  // After extended timeout, treat as failure and let normal retry logic handle it
                  isResolved = true;
                  reject(new Error('Processing timeout exceeded even after extension'));
                }
              }, EXTENDED_TIMEOUT);

              // Wait for either the process to complete or extended timeout
              return;
            } else {
              // User chose to switch to offline
              console.log(`[Queue] User chose offline OCR for ${item.id}`);
              item.switchToOffline = true;
              isResolved = true;
              reject(new Error('User chose to switch to offline OCR'));
            }
          } catch (callbackError) {
            console.error(`[Queue] Timeout callback error:`, callbackError);
            // If callback fails, treat as timeout and reject
            isResolved = true;
            reject(new Error('Processing timeout'));
          }
        } else {
          // No callback available, treat as normal timeout
          isResolved = true;
          reject(new Error('Processing timeout'));
        }
      }, timeout);
    });
  }

  /**
   * Process receipt using offline OCR (ML Kit)
   * Used as fallback when AI processing fails
   */
  private async processWithOfflineOCR(imageUri: string): Promise<ReceiptProcessingResult> {
    console.log('[Queue] Starting offline OCR processing...');

    // Step 1: Run ML Kit text recognition
    const mlKitResult = await recognizeText(imageUri);

    // Step 2: Parse extracted text to structured data
    const parsedResult = await parseReceipt(mlKitResult);

    console.log('[Queue] Offline OCR processing complete');

    return parsedResult;
  }

  //Save queue to storage
  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        QUEUE_STORAGE_KEY,
        JSON.stringify({
          items: this.state.items,
        }),
      );
    } catch (error) {
      console.error('Failed to save processing queue:', error);
    }
  }

  //Subscribe to queue changes
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  //Notify all listeners of state change
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

// Export singleton instance
export const processingQueue = new ProcessingQueue();
