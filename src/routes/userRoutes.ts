import express from 'express';
import { deactivateUser, reactivateUser } from '../controllers/userController';

const router = express.Router();

// User routes
router.put('/:id/deactivate', deactivateUser);
router.put('/:id/reactivate', reactivateUser);

export default router;
