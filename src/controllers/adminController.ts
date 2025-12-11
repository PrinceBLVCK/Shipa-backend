import { Request, Response } from 'express';
import {
  cleanupAllDeactivated,
  cleanupDeactivatedShops,
  cleanupDeactivatedMenuItems,
  cleanupDeactivatedUsers,
} from '../utils/cleanupDeactivated';

// Cleanup all deactivated records
export const cleanupAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await cleanupAllDeactivated();

    res.status(200).json({
      success: result.success,
      message: 'Cleanup completed',
      data: result.results,
    });
  } catch (error: any) {
    console.error('Error running cleanup:', error);
    res.status(500).json({
      success: false,
      message: 'Error running cleanup',
      error: error.message,
    });
  }
};

// Cleanup deactivated shops only
export const cleanupShops = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await cleanupDeactivatedShops();

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error cleaning up shops:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning up shops',
      error: error.message,
    });
  }
};

// Cleanup deactivated menu items only
export const cleanupMenuItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await cleanupDeactivatedMenuItems();

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error cleaning up menu items:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning up menu items',
      error: error.message,
    });
  }
};

// Cleanup deactivated users only
export const cleanupUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await cleanupDeactivatedUsers();

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error cleaning up users:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning up users',
      error: error.message,
    });
  }
};
