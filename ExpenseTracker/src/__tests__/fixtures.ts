/**
 * Test Fixtures
 * Mock data for testing AI service responses and OCR results
 */

// Valid API Keys
export const validAPIKeys = {
  // OpenAI format: sk- + 48+ chars
  openai: 'sk-proj-abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  // Anthropic format: sk-ant- + 95+ chars
  anthropic: 'sk-ant-api03-abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890ABCDEF',
  // Gemini format: AIza + exactly 35 chars (total 39)
  gemini: 'AIzaSyAbcdefghijklmnopqrstuvwxyz1234567',
};

// Invalid API Keys
export const invalidAPIKeys = {
  openaiWrongPrefix: 'pk-proj-abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  openaiTooShort: 'sk-proj-short',
  openaiInvalidChars: 'sk-proj-!!!###$$$%%%^^^&&&***!!!###$$$%%%^^^&&&***!!!###$$$%%%^^^&&&***',
  anthropicWrongPrefix: 'sk-api-abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890ABCDEF',
  anthropicTooShort: 'sk-ant-api03-short',
  geminiWrongPrefix: 'BIzaSyAbcdefghijklmnopqrstuvwxyz1234567',
  geminiTooShort: 'AIzaSyShort',
};

// Valid AI Response with Markdown
export const validMarkdownResponse = `\`\`\`json
{
  "merchant": "The Italian Kitchen",
  "amount": 87.50,
  "tax_amount": 7.50,
  "date": "2024-03-15",
  "time": "19:30:00",
  "category": "Food & Drink",
  "confidence": 0.95
}
\`\`\``;

// Valid Plain JSON Response
export const validPlainJSONResponse = `{
  "merchant": "Office Supplies Plus",
  "amount": 156.78,
  "tax_amount": 12.54,
  "date": "2024-03-10",
  "category": "Office Supplies",
  "confidence": 0.92
}`;

// Response with Escaped Characters
export const escapedCharactersResponse = `{
  "merchant": "Joe's \\"Fancy\\" Diner",
  "amount": 45.00,
  "date": "2024-03-15"
}`;

// Complex Nested Response
export const complexNestedResponse = `{
  "merchant": "Department Store",
  "amount": 234.56,
  "date": "2024-03-15",
  "items": [
    {"name": "Item 1", "price": 50.00},
    {"name": "Item 2", "price": 100.00},
    {"name": "Item 3", "price": 84.56}
  ]
}`;

// Multiple JSON Objects
export const multipleJSONResponse = `{"merchant": "Store A", "amount": 10.00}
Some text in between
{"merchant": "Store B", "amount": 20.00}`;

// Invalid JSON Response
export const invalidJSONResponse = `{
  "merchant": "Invalid Store",
  "amount": "not a number",
  invalid syntax here
}`;

// Empty Response
export const emptyResponse = '';

// No JSON Response
export const noJSONResponse = 'This is just plain text with no JSON data';

// Restaurant OCR Text
export const restaurantOCR = `The Italian Kitchen
123 Main Street
New York, NY 10001

Receipt #12345
Date: 03/15/2024 7:30 PM

Margherita Pizza    $18.00
Caesar Salad        $12.00
Tiramisu            $8.50
Iced Tea            $3.50

Subtotal:           $42.00
Tax (8.875%):       $3.73
Tip (20%):          $8.40
Total:              $54.13

Thank you for dining with us!`;

// Retail Receipt OCR Text
export const retailOCR = `BEST BUY
www.bestbuy.com
Store #1234

USB-C Cable          $19.99
Laptop Stand         $49.99
Wireless Mouse       $39.99
Subtotal:           $109.97
Tax:                 $8.80
Total:              $118.77

03/15/2024 14:25
Transaction: 789456123`;

// Gas Station OCR Text
export const gasStationOCR = `SHELL
Station #5678
123 Highway Rd

Regular Unleaded
15.234 gal @ $3.45/gal
Fuel:                $52.56
Tax:                  $4.20
Total:               $56.76

03/15/2024 08:15 AM
Pump 3`;

// Hotel Receipt OCR Text
export const hotelOCR = `GRAND HOTEL
456 Park Avenue
New York, NY

Guest: John Doe
Check-in: 03/14/2024
Check-out: 03/16/2024

Room Charges (2 nights)  $450.00
Resort Fee               $50.00
Tax (14.75%)            $73.75
Total:                  $573.75

Thank you for staying with us`;

// Coffee Shop OCR Text
export const coffeeShopOCR = `Starbucks
Store #4321

Caffe Latte (Gr)     $5.45
Croissant            $4.25
Subtotal:            $9.70
Tax:                 $0.78
Total:              $10.48

03/15/2024 09:30
Card ending in 1234`;

// Poor Quality OCR Text
export const poorQualityOCR = `???STORE
Un??de???le t?xt
T?tal: $?5.??
D?te: 03/?5/2024`;

// Receipt without Tax
export const noTaxOCR = `Small Business Co.
Cash Sale

Item 1:  $10.00
Item 2:   $8.00

Total:   $18.00

Thank you!
03/15/2024`;

// Receipt Image Fixtures (for setup tests)
export const restaurantReceipt = {
  uri: 'file:///mock/restaurant-receipt.jpg',
  width: 1024,
  height: 1536,
  size: 500000,
};

export const retailReceipt = {
  uri: 'file:///mock/retail-receipt.jpg',
  width: 1024,
  height: 1536,
  size: 450000,
};

export const gasStationReceipt = {
  uri: 'file:///mock/gas-receipt.jpg',
  width: 1024,
  height: 1536,
  size: 300000,
};

// Response with Missing Required Fields
export const missingFieldsResponse = `{
  "merchant": "Test Store",
  "date": "2024-03-15"
}`;

// Response with Invalid Field Types
export const invalidTypesResponse = `{
  "merchant": "Test Store",
  "amount": "not a number",
  "date": "2024-03-15"
}`;

// Response with Special Characters in Amounts
export const specialCharactersAmountResponse = `{
  "merchant": "Test Store",
  "amount": "$1,234.56",
  "date": "2024-03-15"
}`;
