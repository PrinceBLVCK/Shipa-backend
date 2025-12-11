import { Request, Response } from 'express';
import axios from 'axios';
import { config } from '../config/config';
import Wallet from '../models/Wallet';
import Transaction from '../models/Transaction';
import Order from '../models/Order';
import { v4 as uuidv4 } from 'uuid';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Initialize payment with Paystack
export const initializePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, amount, metadata, callbackUrl } = req.body;

    if (!email || !amount) {
      res.status(400).json({
        success: false,
        message: 'Please provide email and amount',
      });
      return;
    }

    // Amount should be in kobo (Paystack uses smallest currency unit)
    const amountInKobo = Math.round(amount * 100);

    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: amountInKobo,
        metadata,
        callback_url: callbackUrl || `${process.env.FRONTEND_URL}/payment/callback`,
      },
      {
        headers: {
          Authorization: `Bearer ${config.paystack.secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(200).json({
      success: true,
      message: 'Payment initialized successfully',
      data: response.data.data,
    });
  } catch (error: any) {
    console.error('Error initializing payment:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error initializing payment',
      error: error.response?.data || error.message,
    });
  }
};

// Verify payment
export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reference } = req.params;

    if (!reference) {
      res.status(400).json({
        success: false,
        message: 'Please provide payment reference',
      });
      return;
    }

    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${config.paystack.secretKey}`,
        },
      }
    );

    const paymentData = response.data.data;

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: paymentData,
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.response?.data || error.message,
    });
  }
};

// Process payment for order
export const processOrderPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, email, callbackUrl } = req.body;

    if (!orderId || !email) {
      res.status(400).json({
        success: false,
        message: 'Please provide orderId and email',
      });
      return;
    }

    // Get order
    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    if (order.paymentStatus === 'paid') {
      res.status(400).json({
        success: false,
        message: 'Order has already been paid',
      });
      return;
    }

    // Initialize payment with Paystack
    const amountInKobo = Math.round(order.total * 100);

    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: amountInKobo,
        metadata: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          customerId: order.customer,
        },
        callback_url: callbackUrl || `${process.env.FRONTEND_URL}/payment/callback`,
      },
      {
        headers: {
          Authorization: `Bearer ${config.paystack.secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const paymentData = response.data.data;

    // Update order with payment reference
    order.paymentReference = paymentData.reference;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment initialized for order',
      data: {
        authorizationUrl: paymentData.authorization_url,
        accessCode: paymentData.access_code,
        reference: paymentData.reference,
      },
    });
  } catch (error: any) {
    console.error('Error processing order payment:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error processing order payment',
      error: error.response?.data || error.message,
    });
  }
};

// Handle Paystack webhook
export const handlePaystackWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = req.body;

    // Verify webhook signature
    const hash = req.headers['x-paystack-signature'];

    // In production, you should verify the webhook signature
    // const expectedHash = crypto
    //   .createHmac('sha512', config.paystack.secretKey)
    //   .update(JSON.stringify(req.body))
    //   .digest('hex');

    // if (hash !== expectedHash) {
    //   res.status(401).send('Invalid signature');
    //   return;
    // }

    // Handle successful payment
    if (event.event === 'charge.success') {
      const { reference, amount, metadata, customer } = event.data;

      // Check if it's a wallet reload or order payment
      if (metadata.type === 'wallet_reload') {
        // Handle wallet reload
        const wallet = await Wallet.findOne({ user: metadata.userId });

        if (wallet) {
          const amountInZAR = amount / 100; // Convert from kobo to ZAR
          const balanceBefore = wallet.balance;
          wallet.balance += amountInZAR;
          await wallet.save();

          // Create transaction
          await Transaction.create({
            user: metadata.userId,
            wallet: wallet._id,
            type: 'credit',
            amount: amountInZAR,
            currency: wallet.currency,
            description: 'Wallet reload via Paystack',
            reference,
            status: 'success',
            paymentMethod: 'paystack',
            balanceBefore,
            balanceAfter: wallet.balance,
            metadata: { paystackData: event.data },
          });
        }
      } else if (metadata.orderId) {
        // Handle order payment
        const order = await Order.findById(metadata.orderId);

        if (order) {
          order.paymentStatus = 'paid';
          order.paymentReference = reference;
          await order.save();
        }
      }
    }

    res.status(200).send('Webhook processed');
  } catch (error: any) {
    console.error('Error handling webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Error handling webhook',
      error: error.message,
    });
  }
};

// Initialize wallet reload payment
export const initializeWalletReload = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, email, amount, callbackUrl } = req.body;

    if (!userId || !email || !amount) {
      res.status(400).json({
        success: false,
        message: 'Please provide userId, email, and amount',
      });
      return;
    }

    // Get or create wallet
    let wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      wallet = await Wallet.create({
        user: userId,
        balance: 0,
        currency: 'ZAR',
      });
    }

    // Initialize payment with Paystack
    const amountInKobo = Math.round(amount * 100);

    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: amountInKobo,
        metadata: {
          type: 'wallet_reload',
          userId,
          walletId: wallet._id,
        },
        callback_url: callbackUrl || `${process.env.FRONTEND_URL}/wallet/callback`,
      },
      {
        headers: {
          Authorization: `Bearer ${config.paystack.secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const paymentData = response.data.data;

    res.status(200).json({
      success: true,
      message: 'Wallet reload payment initialized',
      data: {
        authorizationUrl: paymentData.authorization_url,
        accessCode: paymentData.access_code,
        reference: paymentData.reference,
      },
    });
  } catch (error: any) {
    console.error('Error initializing wallet reload:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error initializing wallet reload',
      error: error.response?.data || error.message,
    });
  }
};
