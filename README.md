# Shipa Backend

Node.js backend API for Shipa - a food delivery and shop management platform built with Express, TypeScript, MongoDB, and Paystack integration.

## Features

- **Shop Management**: Create and manage shops with geospatial location support
- **Menu Management**: Upload menu items individually or in bulk with categories, pricing, and customizations
- **Order Management**: Place orders with multiple payment options (wallet, Paystack, cash)
- **Geospatial Search**: Find shops within 20km radius using MongoDB geospatial queries
- **Wallet System**:
  - Create and manage user wallets
  - Reload wallet via Paystack
  - Deduct from wallet for payments
  - Transaction history with detailed audit trail
- **Payment Integration**:
  - Paystack integration for online payments
  - Automatic wallet reloads
  - Order payment processing
  - Webhook handling for payment verification
- **Order Processing**:
  - Multi-item orders with customizations
  - Automatic fee calculation (delivery + service fees)
  - Real-time order status updates
  - Order cancellation with automatic refunds

## Project Structure

```
shipa-backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── routes/         # API routes
│   ├── models/         # Data models
│   ├── middleware/     # Custom middleware
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   └── index.ts        # Application entry point
├── dist/               # Compiled JavaScript (generated)
├── node_modules/       # Dependencies
├── .env                # Environment variables
├── .gitignore          # Git ignore file
├── nodemon.json        # Nodemon configuration
├── package.json        # Project dependencies
├── tsconfig.json       # TypeScript configuration
└── README.md           # This file
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (v6 or higher) - Install locally or use MongoDB Atlas
- Paystack Account (for payment processing)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up MongoDB:
   - **Local MongoDB**: Install MongoDB and ensure it's running on `mongodb://localhost:27017`
   - **MongoDB Atlas**: Create a free cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas) and get your connection string

3. Get Paystack Keys:
   - Sign up at [paystack.com](https://paystack.com)
   - Get your test keys from the dashboard (Settings > API Keys & Webhooks)

4. Create a `.env` file in the root directory with the following variables:
```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/shipa
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=7d
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
```

### Development

Run the development server with hot reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Build

Compile TypeScript to JavaScript:
```bash
npm run build
```

### Production

Run the compiled application:
```bash
npm start
```

## API Endpoints

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Quick Overview

**Shops**
- `POST /api/shops` - Create shop
- `GET /api/shops` - Get all shops
- `GET /api/shops/nearby` - Search shops within 20km radius
- `GET /api/shops/:id` - Get shop with menu

**Menu Items**
- `POST /api/menu-items` - Create menu item
- `POST /api/menu-items/bulk` - Bulk upload menu items
- `GET /api/menu-items/shop/:shopId` - Get shop menu items

**Orders**
- `POST /api/orders` - Place order
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/customer/:customerId` - Get customer orders
- `PUT /api/orders/:id/cancel` - Cancel order

**Wallet**
- `GET /api/wallet/:userId` - Get or create wallet
- `GET /api/wallet/:userId/balance` - Get balance
- `POST /api/wallet/:userId/reload` - Reload wallet
- `GET /api/wallet/:userId/transactions` - Get transaction history

**Payment**
- `POST /api/payment/initialize` - Initialize payment
- `POST /api/payment/wallet/reload` - Initialize wallet reload
- `POST /api/payment/order` - Process order payment
- `GET /api/payment/verify/:reference` - Verify payment

## Technologies

- **Express** - Web framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - NoSQL database with geospatial support
- **Mongoose** - MongoDB ODM
- **Paystack** - Payment processing
- **Axios** - HTTP client for Paystack API
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables management
- **uuid** - Unique ID generation
- **Nodemon** - Development auto-reload
- **ts-node** - TypeScript execution

## Key Features Implementation

### Geospatial Search
Shops are stored with geospatial coordinates and indexed with MongoDB's 2dsphere index, enabling efficient proximity searches within a 20km radius.

### Wallet System
Complete wallet implementation with:
- Automatic balance tracking
- Transaction history with audit trail
- Integration with Paystack for reloads
- Automatic refunds on order cancellation

### Payment Processing
- Paystack integration for secure online payments
- Multiple payment methods (wallet, Paystack, cash)
- Webhook handling for automatic payment verification
- Automatic wallet crediting after successful payments

## Development Notes

1. **Port Configuration**: The server runs on port 3000 by default. Port 5000 is typically used by macOS AirPlay.

2. **Paystack Webhook**: Configure the webhook URL in your Paystack dashboard:
   ```
   https://yourdomain.com/api/payment/webhook
   ```

3. **Coordinates**: MongoDB uses [longitude, latitude] format for geospatial queries.

4. **Order Fees**:
   - Delivery Fee: R25 (fixed)
   - Service Fee: 5% of subtotal
