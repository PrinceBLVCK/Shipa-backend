import { Request, Response } from 'express';
import User from '../models/User';

// Deactivate user
export const deactivateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    user.isActive = false;
    user.deactivatedAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        deactivatedAt: user.deactivatedAt,
      },
    });
  } catch (error: any) {
    console.error('Error deactivating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating user',
      error: error.message,
    });
  }
};

// Reactivate user
export const reactivateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    user.isActive = true;
    user.deactivatedAt = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User reactivated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        deactivatedAt: user.deactivatedAt,
      },
    });
  } catch (error: any) {
    console.error('Error reactivating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error reactivating user',
      error: error.message,
    });
  }
};
