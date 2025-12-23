/**
 * Sample receipt data for testing
 */

export const restaurantReceipt = {
  merchant: 'The Italian Kitchen',
  amount: 87.50,
  date: '2024-03-15',
  time: '19:30:00',
  tax: 7.00,
  taxType: 'GST',
  tip: 15.00,
  subtotal: 65.50,
  category: 'Food',
  items: [
    { name: 'Pasta Carbonara', price: 24.00 },
    { name: 'Caesar Salad', price: 12.50 },
    { name: 'Tiramisu', price: 9.00 },
    { name: 'Wine (Glass)', price: 12.00 },
    { name: 'Sparkling Water', price: 8.00 },
  ],
  paymentMethod: 'Credit Card',
};

export const retailReceipt = {
  merchant: 'Office Supplies Plus',
  amount: 156.78,
  date: '2024-03-14',
  time: '14:22:00',
  tax: 12.54,
  taxType: 'HST',
  subtotal: 144.24,
  category: 'Office Supplies',
  items: [
    { name: 'Printer Paper (5 reams)', price: 45.99 },
    { name: 'Blue Pens (Pack of 12)', price: 8.99 },
    { name: 'Stapler', price: 15.99 },
    { name: 'File Folders (50 pack)', price: 22.50 },
    { name: 'Desk Organizer', price: 28.99 },
    { name: 'USB Flash Drive 32GB', price: 21.78 },
  ],
  paymentMethod: 'Debit Card',
};

export const gasStationReceipt = {
  merchant: 'Shell Gas Station',
  amount: 68.42,
  date: '2024-03-13',
  time: '08:15:00',
  tax: 4.23,
  taxType: 'GST',
  subtotal: 64.19,
  category: 'Transportation',
  items: [
    { name: 'Regular Gasoline (45.2L)', price: 64.19 },
  ],
  paymentMethod: 'Credit Card',
};

export const hotelReceipt = {
  merchant: 'Grand Plaza Hotel',
  amount: 345.00,
  date: '2024-03-12',
  time: '11:00:00',
  tax: 45.00,
  taxType: 'HST',
  subtotal: 300.00,
  category: 'Lodging',
  items: [
    { name: 'Standard Room (1 night)', price: 250.00 },
    { name: 'Room Service Breakfast', price: 35.00 },
    { name: 'Parking', price: 15.00 },
  ],
  paymentMethod: 'Corporate Card',
};

export const coffeeShopReceipt = {
  merchant: 'Starbucks',
  amount: 12.75,
  date: '2024-03-16',
  time: '07:45:00',
  tax: 1.02,
  taxType: 'GST',
  subtotal: 11.73,
  category: 'Food',
  items: [
    { name: 'Grande Latte', price: 5.95 },
    { name: 'Blueberry Muffin', price: 4.50 },
    { name: 'Bottled Water', price: 1.28 },
  ],
  paymentMethod: 'Mobile Payment',
};

export const taxiReceipt = {
  merchant: 'City Taxi Service',
  amount: 34.50,
  date: '2024-03-11',
  time: '16:30:00',
  tax: 2.76,
  taxType: 'GST',
  subtotal: 31.74,
  category: 'Transportation',
  items: [
    { name: 'Fare (12.5 km)', price: 28.00 },
    { name: 'Airport Surcharge', price: 3.74 },
  ],
  paymentMethod: 'Cash',
  tip: 5.00,
};

export const incompleteReceipt = {
  merchant: 'Unknown Store',
  amount: 45.99,
  date: '2024-03-10',
  // Missing time, tax, and other details
  category: 'Other',
};

export const poorQualityReceipt = {
  // Simulates poorly scanned receipt with missing/unclear data
  merchant: 'Unreadable Merch...',
  amount: null, // Could not read amount
  date: '2024-03-??',
  category: null,
};
