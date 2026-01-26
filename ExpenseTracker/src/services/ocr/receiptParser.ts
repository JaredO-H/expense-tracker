/**
 * Receipt Parser
 * Extract structured expense data from ML Kit OCR text using pattern matching
 */

import { TextBlock } from '@react-native-ml-kit/text-recognition';
import { format } from 'date-fns';
import { MLKitResult } from './mlKitService';
import { ReceiptProcessingResult } from '../../types/aiProcessing';

interface ExtractionResult<T> {
  value: T;
  confidence: number; // 0-1
}

/**
 * Main parser function - Extract receipt data from ML Kit result
 */
export async function parseReceipt(mlKitResult: MLKitResult): Promise<ReceiptProcessingResult> {
  console.log('[Parser] Starting receipt parsing...');

  const merchant = extractMerchant(mlKitResult.blocks, mlKitResult.text);
  const amount = extractAmount(mlKitResult.text);
  const date = extractDate(mlKitResult.text);
  const tax = extractTax(mlKitResult.text);

  const confidence = calculateConfidence({
    merchant: merchant.confidence,
    amount: amount.confidence,
    date: date.confidence,
    tax: tax.confidence,
  });

  console.log('[Parser] Parsing complete. Overall confidence:', confidence);
  console.log('[Parser] Extracted:', {
    merchant: merchant.value,
    amount: amount.value,
    date: date.value,
    tax: tax.value,
  });

  return {
    merchant: merchant.value,
    amount: amount.value,
    date: date.value,
    tax_amount: tax.value,
    confidence,
    processingTime: mlKitResult.processingTime,
    category: 8, // Default to "Uncategorized"
  };
}

/**
 * Extract merchant name from text blocks
 * Strategy: Look at top 30% of image, find likely business names
 */
function extractMerchant(blocks: TextBlock[], _fullText: string): ExtractionResult<string> {
  console.log('[Parser] Extracting merchant...');

  // Sort blocks by vertical position (top to bottom)
  const sortedBlocks = [...blocks].sort((a, b) => {
    const aTop = a.frame?.top ?? 0;
    const bTop = b.frame?.top ?? 0;
    return aTop - bTop;
  });

  // Look at top 30% of blocks
  const topBlocks = sortedBlocks.slice(0, Math.ceil(sortedBlocks.length * 0.3));

  // Business name patterns
  const businessSuffixes = ['LLC', 'INC', 'CORP', 'LTD', 'CO', 'COMPANY', 'STORE', 'SHOP'];
  const excludePatterns = [
    /^\d+$/, // Pure numbers
    /\d{3}[-\s]?\d{3}[-\s]?\d{4}/, // Phone numbers
    /\d+\s+[A-Z][a-z]+\s+(St|Ave|Rd|Blvd|Dr|Ln)/i, // Addresses
    /^(receipt|invoice|bill|order)$/i, // Generic words
  ];

  let bestCandidate = '';
  let bestConfidence = 0;

  // Check each line in top blocks
  for (const block of topBlocks) {
    const text = block.text.trim();

    // Skip if matches exclude patterns
    if (excludePatterns.some(pattern => pattern.test(text))) {
      continue;
    }

    // Skip very short or very long text
    if (text.length < 3 || text.length > 50) {
      continue;
    }

    let confidence = 0.5; // Base confidence

    // Boost confidence for business suffixes
    const upperText = text.toUpperCase();
    if (businessSuffixes.some(suffix => upperText.includes(suffix))) {
      confidence += 0.3;
    }

    // Boost confidence for all-caps (common for business names)
    if (text === upperText && text.length > 3) {
      confidence += 0.2;
    }

    // Boost confidence for position (earlier = more likely)
    const positionBonus = (1 - sortedBlocks.indexOf(block) / sortedBlocks.length) * 0.2;
    confidence += positionBonus;

    if (confidence > bestConfidence) {
      bestCandidate = text;
      bestConfidence = Math.min(confidence, 1.0);
    }
  }

  // Fallback: use first non-trivial line
  if (!bestCandidate && topBlocks.length > 0) {
    bestCandidate = topBlocks[0].text.trim();
    bestConfidence = 0.3;
  }

  // Final fallback
  if (!bestCandidate) {
    bestCandidate = 'Unknown Merchant';
    bestConfidence = 0.1;
  }

  console.log('[Parser] Merchant extracted:', bestCandidate, 'confidence:', bestConfidence);

  return {
    value: bestCandidate,
    confidence: bestConfidence,
  };
}

/**
 * Extract total amount from receipt text
 * Strategy: Find currency patterns near keywords like "total"
 */
function extractAmount(text: string): ExtractionResult<number> {
  console.log('[Parser] Extracting amount...');

  const lines = text.split('\n');

  // Currency patterns - matches $X.XX, X.XX, etc.
  const currencyPatterns = [
    /\$\s*(\d+\.?\d{0,2})/, // $10.50
    /(\d+\.\d{2})/, // 10.50
    /(\d+)/, // 10
  ];

  // Keywords that indicate total
  const totalKeywords = ['total', 'amount', 'sum', 'balance', 'grand', 'subtotal'];

  let bestAmount = 0;
  let bestConfidence = 0;

  // Strategy 1: Look for amount near "total" keyword
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();

    // Check if line contains total keyword
    const hasTotalKeyword = totalKeywords.some(keyword => line.includes(keyword));

    if (hasTotalKeyword) {
      // Try to extract amount from this line or next line
      const linesToCheck = [lines[i], lines[i + 1] || ''].join(' ');

      for (const pattern of currencyPatterns) {
        const match = linesToCheck.match(pattern);
        if (match) {
          const amount = parseFloat(match[1]);

          // Validate reasonable range
          if (amount >= 0.01 && amount <= 10000) {
            const confidence = 0.9; // High confidence when near "total"
            if (confidence > bestConfidence) {
              bestAmount = amount;
              bestConfidence = confidence;
            }
          }
        }
      }
    }
  }

  // Strategy 2: Find largest amount (fallback)
  if (bestAmount === 0) {
    const allAmounts: number[] = [];

    for (const pattern of currencyPatterns) {
      const matches = text.matchAll(new RegExp(pattern, 'g'));
      for (const match of matches) {
        const amount = parseFloat(match[1]);
        if (amount >= 0.01 && amount <= 10000) {
          allAmounts.push(amount);
        }
      }
    }

    if (allAmounts.length > 0) {
      // Use largest amount as fallback
      bestAmount = Math.max(...allAmounts);
      bestConfidence = 0.5; // Medium confidence
    }
  }

  // Final fallback
  if (bestAmount === 0) {
    bestAmount = 0.01;
    bestConfidence = 0.1;
  }

  console.log('[Parser] Amount extracted:', bestAmount, 'confidence:', bestConfidence);

  return {
    value: bestAmount,
    confidence: bestConfidence,
  };
}

/**
 * Extract date from receipt text
 * Strategy: Find date patterns, prefer those near "date" keyword
 */
function extractDate(text: string): ExtractionResult<string> {
  console.log('[Parser] Extracting date...');

  const lines = text.split('\n');

  // Date patterns (MM/DD/YYYY, DD.MM.YYYY, YYYY-MM-DD, etc.)
  const datePatterns = [
    { regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/, format: 'MM/DD/YYYY' }, // 12/25/2024
    { regex: /(\d{1,2})\/(\d{1,2})\/(\d{2})/, format: 'MM/DD/YY' }, // 12/25/24
    { regex: /(\d{1,2})[-.](\d{1,2})[-.](\d{4})/, format: 'DD-MM-YYYY' }, // 25-12-2024
    { regex: /(\d{4})[-/](\d{1,2})[-/](\d{1,2})/, format: 'YYYY-MM-DD' }, // 2024-12-25
  ];

  let bestDate = '';
  let bestConfidence = 0;

  // Strategy 1: Look for date near "date" keyword
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();

    if (line.includes('date') || line.includes('time')) {
      const linesToCheck = [lines[i], lines[i + 1] || ''].join(' ');

      for (const { regex, format } of datePatterns) {
        const match = linesToCheck.match(regex);
        if (match) {
          const dateStr = formatDateMatch(match, format);
          if (dateStr && isValidDate(dateStr)) {
            bestDate = dateStr;
            bestConfidence = 0.8;
            break;
          }
        }
      }
    }
  }

  // Strategy 2: Find any date (fallback)
  if (!bestDate) {
    for (const { regex, format } of datePatterns) {
      const match = text.match(regex);
      if (match) {
        const dateStr = formatDateMatch(match, format);
        if (dateStr && isValidDate(dateStr)) {
          bestDate = dateStr;
          bestConfidence = 0.5;
          break;
        }
      }
    }
  }

  // Final fallback: use today's date
  if (!bestDate) {
    bestDate = format(new Date(), 'yyyy-MM-dd');
    bestConfidence = 0.3;
  }

  console.log('[Parser] Date extracted:', bestDate, 'confidence:', bestConfidence);

  return {
    value: bestDate,
    confidence: bestConfidence,
  };
}

/**
 * Helper: Format date match to YYYY-MM-DD
 */
function formatDateMatch(match: RegExpMatchArray, formatType: string): string | null {
  try {
    if (formatType === 'MM/DD/YYYY' || formatType === 'MM/DD/YY') {
      const month = parseInt(match[1]);
      const day = parseInt(match[2]);
      let year = parseInt(match[3]);

      // Handle 2-digit year
      if (year < 100) {
        year += year > 50 ? 1900 : 2000;
      }

      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    } else if (formatType === 'DD-MM-YYYY') {
      const day = parseInt(match[1]);
      const month = parseInt(match[2]);
      const year = parseInt(match[3]);

      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    } else if (formatType === 'YYYY-MM-DD') {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]);
      const day = parseInt(match[3]);

      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }
  } catch (error) {
    console.warn('[Parser] Date format error:', error);
  }

  return null;
}

/**
 * Helper: Validate date string
 */
function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Extract tax amount from receipt text
 * Strategy: Find amount near tax keywords
 */
function extractTax(text: string): ExtractionResult<number | undefined> {
  console.log('[Parser] Extracting tax...');

  const lines = text.split('\n');

  // Tax keywords
  const taxKeywords = ['tax', 'vat', 'gst', 'hst', 'pst', 'sales tax'];

  // Currency pattern
  const currencyPattern = /\$?\s*(\d+\.?\d{0,2})/;

  // Look for tax amount near keywords
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();

    if (taxKeywords.some(keyword => line.includes(keyword))) {
      const match = line.match(currencyPattern);
      if (match) {
        const amount = parseFloat(match[1]);

        // Validate reasonable tax range
        if (amount >= 0 && amount <= 1000) {
          console.log('[Parser] Tax extracted:', amount, 'confidence: 0.7');
          return {
            value: amount,
            confidence: 0.7,
          };
        }
      }
    }
  }

  console.log('[Parser] No tax found');

  // No tax found - this is acceptable for many receipts
  return {
    value: undefined,
    confidence: 1.0, // High confidence in "no tax"
  };
}

/**
 * Calculate overall confidence score
 * Weighted average of individual field confidences
 */
function calculateConfidence(confidences: {
  merchant: number;
  amount: number;
  date: number;
  tax: number;
}): number {
  // Weights: amount and merchant are most important
  const weights = {
    merchant: 0.3,
    amount: 0.4,
    date: 0.2,
    tax: 0.1,
  };

  const overallConfidence =
    confidences.merchant * weights.merchant +
    confidences.amount * weights.amount +
    confidences.date * weights.date +
    confidences.tax * weights.tax;

  return Math.round(overallConfidence * 100) / 100; // Round to 2 decimals
}
