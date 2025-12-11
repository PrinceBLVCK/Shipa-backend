import express from 'express';
import {
  getOrCreateWallet,
  getWalletBalance,
  reloadWallet,
  deductFromWallet,
  getWalletTransactions,
} from '../controllers/walletController';

const router = express.Router();

// Wallet routes
router.get('/:userId', getOrCreateWallet);
router.get('/:userId/balance', getWalletBalance);
router.post('/:userId/reload', reloadWallet);
router.post('/:userId/deduct', deductFromWallet);
router.get('/:userId/transactions', getWalletTransactions);

export default router;
