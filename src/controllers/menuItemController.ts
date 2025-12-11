import { Request, Response } from 'express';
import MenuItem from '../models/MenuItem';
import Shop from '../models/Shop';

// Upload/Create menu item
export const createMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      shop,
      name,
      description,
      price,
      image,
      category,
      isAvailable,
      preparationTime,
      ingredients,
      allergens,
      nutritionalInfo,
      customizations,
    } = req.body;

    // Validate required fields
    if (!shop || !name || price === undefined) {
      res.status(400).json({
        success: false,
        message: 'Please provide shop, name, and price',
      });
      return;
    }

    // Check if shop exists
    const shopExists = await Shop.findById(shop);
    if (!shopExists) {
      res.status(404).json({
        success: false,
        message: 'Shop not found',
      });
      return;
    }

    const menuItem = await MenuItem.create({
      shop,
      name,
      description,
      price,
      image,
      category,
      isAvailable,
      preparationTime,
      ingredients,
      allergens,
      nutritionalInfo,
      customizations,
    });

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: menuItem,
    });
  } catch (error: any) {
    console.error('Error creating menu item:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating menu item',
      error: error.message,
    });
  }
};

// Get all menu items for a shop
export const getMenuItemsByShop = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shopId } = req.params;
    const { category, available } = req.query;

    const query: any = { shop: shopId };

    if (category) {
      query.category = category;
    }

    if (available !== undefined) {
      query.isAvailable = available === 'true';
    }

    const menuItems = await MenuItem.find(query).sort({ category: 1, name: 1 });

    // Group by category
    const menuByCategory: Record<string, any[]> = {};
    menuItems.forEach((item) => {
      const cat = item.category || 'Uncategorized';
      if (!menuByCategory[cat]) {
        menuByCategory[cat] = [];
      }
      menuByCategory[cat].push(item);
    });

    res.status(200).json({
      success: true,
      data: {
        items: menuItems,
        byCategory: menuByCategory,
        count: menuItems.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu items',
      error: error.message,
    });
  }
};

// Get single menu item
export const getMenuItemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findById(id).populate('shop', 'name address phone');

    if (!menuItem) {
      res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: menuItem,
    });
  } catch (error: any) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu item',
      error: error.message,
    });
  }
};

// Update menu item
export const updateMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const menuItem = await MenuItem.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!menuItem) {
      res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: menuItem,
    });
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating menu item',
      error: error.message,
    });
  }
};

// Delete menu item
export const deleteMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findByIdAndDelete(id);

    if (!menuItem) {
      res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting menu item',
      error: error.message,
    });
  }
};

// Bulk upload menu items
export const bulkUploadMenuItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shopId, items } = req.body;

    if (!shopId || !items || !Array.isArray(items)) {
      res.status(400).json({
        success: false,
        message: 'Please provide shopId and items array',
      });
      return;
    }

    // Check if shop exists
    const shopExists = await Shop.findById(shopId);
    if (!shopExists) {
      res.status(404).json({
        success: false,
        message: 'Shop not found',
      });
      return;
    }

    // Add shopId to each item
    const menuItemsToCreate = items.map((item: any) => ({
      ...item,
      shop: shopId,
    }));

    const createdItems = await MenuItem.insertMany(menuItemsToCreate);

    res.status(201).json({
      success: true,
      message: `${createdItems.length} menu items uploaded successfully`,
      data: createdItems,
    });
  } catch (error: any) {
    console.error('Error bulk uploading menu items:', error);
    res.status(500).json({
      success: false,
      message: 'Error bulk uploading menu items',
      error: error.message,
    });
  }
};

// Deactivate menu item
export const deactivateMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
      return;
    }

    menuItem.isAvailable = false;
    menuItem.deactivatedAt = new Date();
    await menuItem.save();

    res.status(200).json({
      success: true,
      message: 'Menu item deactivated successfully',
      data: menuItem,
    });
  } catch (error: any) {
    console.error('Error deactivating menu item:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating menu item',
      error: error.message,
    });
  }
};

// Reactivate menu item
export const reactivateMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
      return;
    }

    menuItem.isAvailable = true;
    menuItem.deactivatedAt = undefined;
    await menuItem.save();

    res.status(200).json({
      success: true,
      message: 'Menu item reactivated successfully',
      data: menuItem,
    });
  } catch (error: any) {
    console.error('Error reactivating menu item:', error);
    res.status(500).json({
      success: false,
      message: 'Error reactivating menu item',
      error: error.message,
    });
  }
};
