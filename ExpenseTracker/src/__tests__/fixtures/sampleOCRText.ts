/**
 * Sample OCR text output for testing receipt parsing
 */

export const restaurantOCR = `The Italian Kitchen
456 Elm Street
Toronto, ON M5H 2N2

Server: John
Table: 12
Date: 03/15/2024
Time: 7:30 PM

Pasta Carbonara         $24.00
Caesar Salad            $12.50
Tiramisu                 $9.00
Wine (Glass)            $12.00
Sparkling Water          $8.00

Subtotal               $65.50
GST (8%)                $7.00
                       -------
Total                  $87.50

Suggested Tip:
15%   $9.83
18%  $11.79
20%  $13.13

Payment Method: VISA ****1234
Thank you for dining with us!`;

export const retailOCR = `OFFICE SUPPLIES PLUS
www.officesuppliesplus.com
789 Business Blvd, Suite 200
Vancouver, BC V6B 1A1

Receipt #: 45678-2024
Date: March 14, 2024 2:22 PM

Items Purchased:
1  Printer Paper (5 reams)      $45.99
1  Blue Pens (Pack of 12)        $8.99
1  Stapler                      $15.99
1  File Folders (50 pack)       $22.50
1  Desk Organizer               $28.99
1  USB Flash Drive 32GB         $21.78
                               -------
Subtotal                       $144.24
HST (13%)                       $12.54
                               -------
TOTAL                          $156.78

Payment: Debit Card
Card: ****5678

Thank you for shopping with us!
Return policy: 30 days with receipt`;

export const gasStationOCR = `SHELL
Gas Station #8452
123 Highway 1
Calgary, AB T2P 1A1

Date: 03/13/2024
Time: 08:15 AM

Pump: 3
Product: Regular Gasoline

Liters: 45.2 L
Price/L: $1.42
Amount: $64.19

GST (5%): $4.23

TOTAL: $68.42

Payment: VISA ****9012
Odometer: 52,341 km

Thank you for your business!`;

export const hotelOCR = `GRAND PLAZA HOTEL
****
1000 Luxury Lane
Montreal, QC H3A 1A1

GUEST RECEIPT

Guest: [Redacted for privacy]
Room: 1205
Check-in: March 11, 2024
Check-out: March 12, 2024

CHARGES:
Standard Room (1 night)        $250.00
Room Service Breakfast          $35.00
Parking Fee                     $15.00
                              --------
Subtotal                       $300.00
HST (15%)                       $45.00
                              --------
TOTAL                          $345.00

Payment Method: Corporate Card
Card: Amex ****3456

We hope you enjoyed your stay!`;

export const coffeeShopOCR = `Starbucks
Store #2471
567 Main Street
Toronto, ON

03/16/2024  7:45 AM
Register: 2  Cashier: Sarah

Grande Latte              5.95
Blueberry Muffin          4.50
Bottled Water             1.28
                        ------
Subtotal                 11.73
GST 8%                    1.02
                        ------
TOTAL                    12.75

Payment: Apple Pay

Thank you!
Visit starbucks.com`;

export const taxiOCR = `CITY TAXI SERVICE
License #: TX-8472
Vehicle #: 234

Trip Details:
Date: March 11, 2024
Time: 4:30 PM

Pick-up: Downtown Convention Center
Drop-off: International Airport

Distance: 12.5 km
Duration: 18 minutes

Base Fare             $5.00
Distance (12.5km)    $23.00
Airport Surcharge     $3.74
                    -------
Subtotal             $31.74
GST (8%)              $2.76
                    -------
TOTAL                $34.50

Payment Method: CASH

Driver: Mike Johnson
Thank you for riding with us!`;

export const poorQualityOCR = `Un...ble Merch...
123 ... Street

Da.. 03/.../2024

Item 1    ...99
Item 2    2..50

Tot...   ...99

Th... you`;

export const noTaxOCR = `Bob's Roadside Stand
Fresh Produce

Date: 03/17/2024

Apples (3 lbs)      $8.50
Oranges (2 lbs)     $6.00
Bananas (bunch)     $3.50

TOTAL              $18.00

CASH
Thanks!`;

export const multiCurrencyOCR = `INTERNATIONAL SHOP
Airport Terminal 2

Date: 15/03/2024

Item 1    €45.99 EUR
Item 2    £32.50 GBP
Item 3    $28.00 USD

Total: $102.87 USD
(Converted at today's rate)

Payment: Credit Card`;

export const handwrittenReceiptOCR = `Bob's Diner
(handwritten)

3/15/24

2 burgers    $18
fries         $5
2 cokes       $4
            ----
Total       $27

cash

Thanks!`;
