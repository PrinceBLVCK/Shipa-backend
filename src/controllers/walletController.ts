import { Request, Response } from 'express';
import Wallet from '../models/Wallet';
import Transaction from '../models/Transaction';
import User from '../models/User';
import { v4 as uuidv4 } from 'uuid';

// Get or create wallet for user
export const getOrCreateWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Try to find existing wallet
    let wallet = await Wallet.findOne({ user: userId });

    // If wallet doesn't exist, create one
    if (!wallet) {
      wallet = await Wallet.create({
        user: userId,
        balance: 0,
        currency: 'ZAR',
      });
    }

    res.status(200).json({
      success: true,
      data: wallet,
    });
  } catch (error: any) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wallet',
      error: error.message,
    });
  }
};

// Get wallet balance
export const getWalletBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      res.status(404).json({
        success: false,
        message: 'Wallet not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        balance: wallet.balance,
        currency: wallet.currency,
        walletId: wallet._id,
      },
    });
  } catch (error: any) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wallet balance',
      error: error.message,
    });
  }
};

// Reload wallet (credit)
export const reloadWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { amount, paymentReference, description } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid amount',
      });
      return;
    }

    // Get wallet
    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      res.status(404).json({
        success: false,
        message: 'Wallet not found',
      });
      return;
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amount;

    // Update wallet balance
    wallet.balance = balanceAfter;
    await wallet.save();

    // Create transaction record
    const transaction = await Transaction.create({
      user: userId,
      wallet: wallet._id,
      type: 'credit',
      amount,
      currency: wallet.currency,
      description: description || 'Wallet reload',
      reference: paymentReference || `reload-${uuidv4()}`,
      status: 'success',
      paymentMethod: 'paystack',
      balanceBefore,
      balanceAfter,
    });

    res.status(200).json({
      success: true,
      message: 'Wallet reloaded successfully',
      data: {
        wallet,
        transaction,
      },
    });
  } catch (error: any) {
    console.error('Error reloading wallet:', error);
    res.status(500).json({
      success: false,
      message: 'Error reloading wallet',
      error: error.message,
    });
  }
};

// Deduct from wallet (debit)
export const deductFromWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { amount, description, reference } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid amount',
      });
      return;
    }

    // Get wallet
    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      res.status(404).json({
        success: false,
        message: 'Wallet not found',
      });
      return;
    }

    // Check if wallet has sufficient balance
    if (wallet.balance < amount) {
      res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance',
        data: {
          required: amount,
          available: wallet.balance,
          shortfall: amount - wallet.balance,
        },
      });
      return;
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - amount;

    // Update wallet balance
    wallet.balance = balanceAfter;
    await wallet.save();

    // Create transaction record
    const transaction = await Transaction.create({
      user: userId,
      wallet: wallet._id,
      type: 'debit',
      amount,
      currency: wallet.currency,
      description: description || 'Wallet deduction',
      reference: reference || `debit-${uuidv4()}`,
      status: 'success',
      paymentMethod: 'wallet',
      balanceBefore,
      balanceAfter,
    });

    res.status(200).json({
      success: true,
      message: 'Amount deducted successfully',
      data: {
        wallet,
        transaction,
      },
    });
  } catch (error: any) {
    console.error('Error deducting from wallet:', error);
    res.status(500).json({
      success: false,
      message: 'Error deducting from wallet',
      error: error.message,
    });
  }
};

// Get wallet transaction history
export const getWalletTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, type } = req.query;

    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      res.status(404).json({
        success: false,
        message: 'Wallet not found',
      });
      return;
    }

    const query: any = { wallet: wallet._id };

    if (type && (type === 'credit' || type === 'debit')) {
      query.type = type;
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Error fetching wallet transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wallet transactions',
      error: error.message,
    });
  }
};
