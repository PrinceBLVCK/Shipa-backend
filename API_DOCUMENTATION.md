# Shipa Backend API Documentation

Base URL: `http://localhost:3000`

## Table of Contents
1. [Shops API](#shops-api)
2. [Menu Items API](#menu-items-api)
3. [Orders API](#orders-api)
4. [Wallet API](#wallet-api)
5. [Payment API](#payment-api)

---

## Shops API

### 1. Create Shop
**POST** `/api/shops`

Create a new shop with geospatial location support.

**Request Body:**
```json
{
  "name": "Pizza Palace",
  "description": "Best pizza in town",
  "owner": "userId",
  "image": "https://example.com/shop-image.jpg",
  "coverImage": "https://example.com/cover.jpg",
  "address": {
    "street": "123 Main St",
    "city": "Johannesburg",
    "state": "Gauteng",
    "country": "South Africa"
  },
  "longitude": 28.0473,
  "latitude": -26.2041,
  "phone": "+27123456789",
  "email": "contact@pizzapalace.com",
  "openingHours": {
    "monday": { "open": "09:00", "close": "22:00" },
    "tuesday": { "open": "09:00", "close": "22:00" }
  },
  "categories": ["Pizza", "Italian", "Fast Food"]
}
```

### 2. Get Shop by ID (with Menu)
**GET** `/api/shops/:id`

Returns shop details along with menu items grouped by category.

**Response:**
```json
{
  "success": true,
  "data": {
    "shop": { /* shop object */ },
    "menu": {
      "Pizza": [ /* array of menu items */ ],
      "Drinks": [ /* array of menu items */ ]
    },
    "totalItems": 25
  }
}
```

### 3. Get All Shops
**GET** `/api/shops?page=1&limit=10&category=Pizza&search=palace`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `category`: Filter by category
- `search`: Search by name or description

### 4. Search Nearby Shops
**GET** `/api/shops/nearby?longitude=28.0473&latitude=-26.2041&maxDistance=20000`

Find shops within a specified radius (default: 20km).

**Query Parameters:**
- `longitude`: User's longitude (required)
- `latitude`: User's latitude (required)
- `maxDistance`: Maximum distance in meters (default: 20000m = 20km)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      /* shop object */,
      "distance": 5.24
    }
  ],
  "count": 10
}
```

### 5. Update Shop
**PUT** `/api/shops/:id`

### 6. Delete Shop
**DELETE** `/api/shops/:id`

---

## Menu Items API

### 1. Create Menu Item
**POST** `/api/menu-items`

**Request Body:**
```json
{
  "shop": "shopId",
  "name": "Margherita Pizza",
  "description": "Classic pizza with tomato and mozzarella",
  "price": 89.99,
  "image": "https://example.com/pizza.jpg",
  "category": "Pizza",
  "isAvailable": true,
  "preparationTime": 20,
  "ingredients": ["Dough", "Tomato Sauce", "Mozzarella"],
  "allergens": ["Gluten", "Dairy"],
  "nutritionalInfo": {
    "calories": 800,
    "protein": 30,
    "carbs": 100,
    "fat": 25
  },
  "customizations": [
    {
      "name": "Extra Toppings",
      "options": [
        { "name": "Extra Cheese", "price": 15 },
        { "name": "Mushrooms", "price": 10 }
      ]
    }
  ]
}
```

### 2. Bulk Upload Menu Items
**POST** `/api/menu-items/bulk`

**Request Body:**
```json
{
  "shopId": "shopId",
  "items": [
    { "name": "Item 1", "price": 50, /* ... */ },
    { "name": "Item 2", "price": 75, /* ... */ }
  ]
}
```

### 3. Get Menu Items by Shop
**GET** `/api/menu-items/shop/:shopId?category=Pizza&available=true`

**Query Parameters:**
- `category`: Filter by category
- `available`: Filter by availability (true/false)

### 4. Get Menu Item by ID
**GET** `/api/menu-items/:id`

### 5. Update Menu Item
**PUT** `/api/menu-items/:id`

### 6. Delete Menu Item
**DELETE** `/api/menu-items/:id`

---

## Orders API

### 1. Place Order
**POST** `/api/orders`

**Request Body:**
```json
{
  "customer": "userId",
  "shop": "shopId",
  "items": [
    {
      "menuItem": "menuItemId",
      "quantity": 2,
      "customizations": [
        {
          "name": "Extra Toppings",
          "option": "Extra Cheese",
          "price": 15
        }
      ]
    }
  ],
  "deliveryAddress": {
    "street": "456 Oak Ave",
    "city": "Johannesburg",
    "state": "Gauteng",
    "country": "South Africa",
    "coordinates": {
      "latitude": -26.2041,
      "longitude": 28.0473
    }
  },
  "deliveryInstructions": "Ring the doorbell",
  "paymentMethod": "wallet",
  "notes": "Extra napkins please"
}
```

**Payment Methods:**
- `wallet`: Pay from user wallet (requires sufficient balance)
- `paystack`: Pay via Paystack (will return payment URL)
- `cash`: Cash on delivery

**Response:**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "orderNumber": "ORD-1234567890-ABC123",
    "total": 189.99,
    "status": "pending",
    "estimatedDeliveryTime": "2024-01-15T14:30:00.000Z",
    /* ... order details */
  }
}
```

### 2. Get Order by ID
**GET** `/api/orders/:id`

### 3. Get Customer Orders
**GET** `/api/orders/customer/:customerId?status=pending&page=1&limit=10`

**Query Parameters:**
- `status`: Filter by order status
- `page`: Page number
- `limit`: Items per page

**Order Statuses:**
- `pending`
- `confirmed`
- `preparing`
- `ready`
- `delivering`
- `completed`
- `cancelled`

### 4. Get Shop Orders
**GET** `/api/orders/shop/:shopId?status=confirmed&page=1&limit=10`

### 5. Update Order Status
**PUT** `/api/orders/:id/status`

**Request Body:**
```json
{
  "status": "confirmed"
}
```

### 6. Cancel Order
**PUT** `/api/orders/:id/cancel`

**Request Body:**
```json
{
  "cancelReason": "Customer changed mind"
}
```

**Note:** Orders can only be cancelled if status is `pending` or `confirmed`. If paid via wallet, amount will be automatically refunded.

---

## Wallet API

### 1. Get or Create Wallet
**GET** `/api/wallet/:userId`

Fetches user's wallet or creates one if it doesn't exist.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "walletId",
    "user": "userId",
    "balance": 500.00,
    "currency": "ZAR",
    "isActive": true
  }
}
```

### 2. Get Wallet Balance
**GET** `/api/wallet/:userId/balance`

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 500.00,
    "currency": "ZAR",
    "walletId": "walletId"
  }
}
```

### 3. Reload Wallet
**POST** `/api/wallet/:userId/reload`

**Request Body:**
```json
{
  "amount": 200.00,
  "paymentReference": "paystack-ref-123",
  "description": "Wallet top-up"
}
```

### 4. Deduct from Wallet
**POST** `/api/wallet/:userId/deduct`

**Request Body:**
```json
{
  "amount": 50.00,
  "description": "Order payment",
  "reference": "order-ref-123"
}
```

**Error Response (Insufficient Balance):**
```json
{
  "success": false,
  "message": "Insufficient wallet balance",
  "data": {
    "required": 50.00,
    "available": 30.00,
    "shortfall": 20.00
  }
}
```

### 5. Get Wallet Transactions
**GET** `/api/wallet/:userId/transactions?page=1&limit=20&type=credit`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `type`: Filter by type (`credit` or `debit`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "transactionId",
      "type": "credit",
      "amount": 200.00,
      "description": "Wallet reload",
      "reference": "reload-123",
      "status": "success",
      "balanceBefore": 300.00,
      "balanceAfter": 500.00,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

## Payment API

### 1. Initialize Payment
**POST** `/api/payment/initialize`

Initialize a generic Paystack payment.

**Request Body:**
```json
{
  "email": "user@example.com",
  "amount": 100.00,
  "metadata": {
    "userId": "userId",
    "purpose": "wallet_reload"
  },
  "callbackUrl": "https://yourapp.com/payment/callback"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment initialized successfully",
  "data": {
    "authorization_url": "https://checkout.paystack.com/xxx",
    "access_code": "xxx",
    "reference": "xxx"
  }
}
```

### 2. Verify Payment
**GET** `/api/payment/verify/:reference`

Verify a Paystack payment using the transaction reference.

### 3. Initialize Wallet Reload
**POST** `/api/payment/wallet/reload`

Initialize Paystack payment specifically for wallet reload.

**Request Body:**
```json
{
  "userId": "userId",
  "email": "user@example.com",
  "amount": 200.00,
  "callbackUrl": "https://yourapp.com/wallet/callback"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Wallet reload payment initialized",
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/xxx",
    "accessCode": "xxx",
    "reference": "xxx"
  }
}
```

**Usage Flow:**
1. Call this endpoint to get Paystack authorization URL
2. Redirect user to the authorization URL
3. User completes payment on Paystack
4. Paystack redirects to your callback URL
5. Paystack sends webhook to `/api/payment/webhook`
6. Webhook handler automatically updates wallet balance

### 4. Process Order Payment
**POST** `/api/payment/order`

Initialize Paystack payment for an order.

**Request Body:**
```json
{
  "orderId": "orderId",
  "email": "user@example.com",
  "callbackUrl": "https://yourapp.com/order/callback"
}
```

### 5. Paystack Webhook
**POST** `/api/payment/webhook`

This endpoint handles Paystack webhooks automatically. Configure this URL in your Paystack dashboard.

**Webhook Events Handled:**
- `charge.success`: Updates wallet balance or order payment status

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

---

## Notes

1. **Geospatial Search**: The shops collection has a 2dsphere index on the location field for efficient proximity queries.

2. **Wallet Transactions**: All wallet operations (reload, deduct) automatically create transaction records for audit purposes.

3. **Order Fees**:
   - Delivery Fee: R25 (fixed)
   - Service Fee: 5% of subtotal
   - Total = Subtotal + Delivery Fee + Service Fee

4. **Paystack Integration**:
   - Make sure to set your Paystack keys in the `.env` file
   - Test keys start with `pk_test_` and `sk_test_`
   - Production keys start with `pk_live_` and `sk_live_`

5. **Currency**: All amounts are in South African Rand (ZAR)

6. **Coordinates Format**:
   - MongoDB uses [longitude, latitude] format
   - Most other systems use [latitude, longitude]
   - Make sure to pass coordinates in the correct order
