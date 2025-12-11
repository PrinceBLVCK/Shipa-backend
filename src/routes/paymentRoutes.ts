import express from 'express';
import {
  initializePayment,
  verifyPayment,
  processOrderPayment,
  handlePaystackWebhook,
  initializeWalletReload,
} from '../controllers/paymentController';

const router = express.Router();

// Payment routes
router.post('/initialize', initializePayment);
router.get('/verify/:reference', verifyPayment);
router.post('/order', processOrderPayment);
router.post('/wallet/reload', initializeWalletReload);
router.post('/webhook', handlePaystackWebhook);

export default router;
