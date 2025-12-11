import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config/config';
import { connectDatabase } from './config/database';

// Import routes
import shopRoutes from './routes/shopRoutes';
import menuItemRoutes from './routes/menuItemRoutes';
import orderRoutes from './routes/orderRoutes';
import walletRoutes from './routes/walletRoutes';
import paymentRoutes from './routes/paymentRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

connectDatabase();

const app: Application = express();

const corsOptions = {
  origin: true,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Shipa Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      shops: '/api/shops',
      menuItems: '/api/menu-items',
      orders: '/api/orders',
      wallet: '/api/wallet',
      payment: '/api/payment',
    }
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/shops', shopRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

const PORT = config.port || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${config.env}`);
});

export default app;
