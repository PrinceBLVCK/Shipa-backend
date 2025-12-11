import express from 'express';
import {
  cleanupAll,
  cleanupShops,
  cleanupMenuItems,
  cleanupUsers,
} from '../controllers/adminController';

const router = express.Router();

// Admin routes for cleanup operations
router.post('/cleanup/all', cleanupAll);
router.post('/cleanup/shops', cleanupShops);
router.post('/cleanup/menu-items', cleanupMenuItems);
router.post('/cleanup/users', cleanupUsers);

export default router;
