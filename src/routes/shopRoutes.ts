import express from 'express';
import {
  createShop,
  getShopById,
  getAllShops,
  searchNearbyShops,
  updateShop,
  deleteShop,
  deactivateShop,
  reactivateShop,
} from '../controllers/shopController';

const router = express.Router();

// Shop routes
router.post('/', createShop);
router.get('/', getAllShops);
router.get('/nearby', searchNearbyShops);
router.get('/:id', getShopById);
router.put('/:id', updateShop);
router.put('/:id/deactivate', deactivateShop);
router.put('/:id/reactivate', reactivateShop);
router.delete('/:id', deleteShop);

export default router;
