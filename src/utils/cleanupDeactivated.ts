import User from '../models/User';
import Shop from '../models/Shop';
import MenuItem from '../models/MenuItem';

/**
 * Cleanup utility to delete deactivated records after specified periods:
 * - Shops: 36 months (3 years)
 * - MenuItems: 24 months (2 years)
 * - Users: 60 months (5 years)
 */

export const cleanupDeactivatedShops = async (): Promise<{
  success: boolean;
  deletedCount: number;
  message: string;
}> => {
  try {
    const thirtyEarliestMonthsAgo = new Date();
    thirtyEarliestMonthsAgo.setMonth(thirtyEarliestMonthsAgo.getMonth() - 36);

    const result = await Shop.deleteMany({
      isActive: false,
      deactivatedAt: { $lte: thirtyEarliestMonthsAgo },
    });

    console.log(`Cleaned up ${result.deletedCount} shops deactivated for 36+ months`);

    return {
      success: true,
      deletedCount: result.deletedCount,
      message: `Deleted ${result.deletedCount} shops deactivated for 36+ months`,
    };
  } catch (error: any) {
    console.error('Error cleaning up deactivated shops:', error);
    return {
      success: false,
      deletedCount: 0,
      message: error.message,
    };
  }
};

export const cleanupDeactivatedMenuItems = async (): Promise<{
  success: boolean;
  deletedCount: number;
  message: string;
}> => {
  try {
    const twentyFourMonthsAgo = new Date();
    twentyFourMonthsAgo.setMonth(twentyFourMonthsAgo.getMonth() - 24);

    const result = await MenuItem.deleteMany({
      isAvailable: false,
      deactivatedAt: { $lte: twentyFourMonthsAgo },
    });

    console.log(`Cleaned up ${result.deletedCount} menu items deactivated for 24+ months`);

    return {
      success: true,
      deletedCount: result.deletedCount,
      message: `Deleted ${result.deletedCount} menu items deactivated for 24+ months`,
    };
  } catch (error: any) {
    console.error('Error cleaning up deactivated menu items:', error);
    return {
      success: false,
      deletedCount: 0,
      message: error.message,
    };
  }
};

export const cleanupDeactivatedUsers = async (): Promise<{
  success: boolean;
  deletedCount: number;
  message: string;
}> => {
  try {
    const sixtyMonthsAgo = new Date();
    sixtyMonthsAgo.setMonth(sixtyMonthsAgo.getMonth() - 60);

    const result = await User.deleteMany({
      isActive: false,
      deactivatedAt: { $lte: sixtyMonthsAgo },
    });

    console.log(`Cleaned up ${result.deletedCount} users deactivated for 60+ months`);

    return {
      success: true,
      deletedCount: result.deletedCount,
      message: `Deleted ${result.deletedCount} users deactivated for 60+ months`,
    };
  } catch (error: any) {
    console.error('Error cleaning up deactivated users:', error);
    return {
      success: false,
      deletedCount: 0,
      message: error.message,
    };
  }
};

/**
 * Run all cleanup operations
 */
export const cleanupAllDeactivated = async (): Promise<{
  success: boolean;
  results: {
    shops: { success: boolean; deletedCount: number; message: string };
    menuItems: { success: boolean; deletedCount: number; message: string };
    users: { success: boolean; deletedCount: number; message: string };
  };
}> => {
  console.log('Starting cleanup of deactivated records...');

  const shopResult = await cleanupDeactivatedShops();
  const menuItemResult = await cleanupDeactivatedMenuItems();
  const userResult = await cleanupDeactivatedUsers();

  const totalDeleted = shopResult.deletedCount + menuItemResult.deletedCount + userResult.deletedCount;

  console.log(`Cleanup completed. Total records deleted: ${totalDeleted}`);

  return {
    success: shopResult.success && menuItemResult.success && userResult.success,
    results: {
      shops: shopResult,
      menuItems: menuItemResult,
      users: userResult,
    },
  };
};
