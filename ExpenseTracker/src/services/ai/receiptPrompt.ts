/**
 * Receipt Processing Prompt Templates
 * Structured prompts for AI services to extract receipt data
 */

export const RECEIPT_PROCESSING_PROMPT = `Analyze this receipt image and extract expense information. Return ONLY valid JSON with this exact structure, no other text:

{
  "merchant": "business name from receipt",
  "amount": 25.99,
  "tax_amount": 2.50,
  "tax_type": "VAT" | "GST" | "HST" | "PST" | "Sales Tax" | "Service Tax" | null,
  "tax_rate": 10.5,
  "date": "2024-01-15",
  "time": "14:30:00",
  "category": "meal" | "transport" | "accommodation" | "office" | "other",
  "confidence": 0.95,
  "currency": "USD",
  "notes": "any additional relevant information"
}

CRITICAL REQUIREMENTS:
1. Return ONLY the JSON object, no markdown, no code blocks, no explanations
2. Extract merchant name exactly as printed on receipt
3. Parse total amount as a number (no currency symbols or commas)
4. Identify tax information if present (amount, type, and rate)
5. Date must be in YYYY-MM-DD format
6. Time in HH:MM:SS format (24-hour) if visible, otherwise null
7. Classify expense category based on merchant type:
   - "meal": Restaurants, cafes, food delivery, grocery stores
   - "transport": Airlines, trains, taxis, ride-share, parking, fuel, tolls
   - "accommodation": Hotels, Airbnb, extended stay, lodging
   - "office": Office supplies, software, equipment, co-working spaces, printing
   - "other": Everything else not fitting above categories
8. Confidence score must be between 0.0 and 1.0 reflecting extraction certainty
9. Currency as ISO 4217 code (USD, EUR, GBP, CAD, etc.)
10. Use null for any information not found or unclear
11. Notes field for any important details (payment method, itemized info, special notes)

VALIDATION RULES:
- amount must be positive number
- tax_amount must be less than or equal to amount
- tax_rate must be between 0 and 100 (percentage)
- confidence must be between 0.0 and 1.0
- date must be valid and not in the future

Return the JSON object immediately without any preamble or explanation.`;

/**
 * Get category ID from category name
 */
export function getCategoryIdFromName(categoryName: string): number {
  const categoryMap: Record<string, number> = {
    meal: 1,
    transport: 2,
    accommodation: 3,
    office: 4,
    other: 8,
  };

  return categoryMap[categoryName.toLowerCase()] || 8; // Default to "other"
}

/**
 * Map tax type string to TaxType enum
 */
export function mapTaxType(taxType: string | null): string | undefined {
  if (!taxType) return undefined;

  const normalized = taxType.toUpperCase().replace(/\s+/g, '_');

  const taxTypeMap: Record<string, string> = {
    VAT: 'VAT',
    GST: 'GST',
    HST: 'HST',
    PST: 'PST',
    SALES_TAX: 'SALES_TAX',
    SERVICE_TAX: 'SERVICE_TAX',
  };

  return taxTypeMap[normalized] || 'OTHER';
}
