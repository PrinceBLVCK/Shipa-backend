import express from 'express';
import {
  createMenuItem,
  getMenuItemsByShop,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  bulkUploadMenuItems,
  deactivateMenuItem,
  reactivateMenuItem,
} from '../controllers/menuItemController';

const router = express.Router();

// Menu item routes
router.post('/', createMenuItem);
router.post('/bulk', bulkUploadMenuItems);
router.get('/shop/:shopId', getMenuItemsByShop);
router.get('/:id', getMenuItemById);
router.put('/:id', updateMenuItem);
router.put('/:id/deactivate', deactivateMenuItem);
router.put('/:id/reactivate', reactivateMenuItem);
router.delete('/:id', deleteMenuItem);

export default router;
