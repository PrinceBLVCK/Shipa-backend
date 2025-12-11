import express from 'express';
import {
  placeOrder,
  getOrderById,
  getCustomerOrders,
  getShopOrders,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/orderController';

const router = express.Router();

// Order routes
router.post('/', placeOrder);
router.get('/:id', getOrderById);
router.get('/customer/:customerId', getCustomerOrders);
router.get('/shop/:shopId', getShopOrders);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/cancel', cancelOrder);

export default router;
