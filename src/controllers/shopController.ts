import { Request, Response } from 'express';
import Shop from '../models/Shop';
import MenuItem from '../models/MenuItem';

// Create a new shop
export const createShop = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      owner,
      image,
      coverImage,
      address,
      longitude,
      latitude,
      phone,
      email,
      openingHours,
      categories,
    } = req.body;

    // Validate required fields
    if (!name || !owner || !address || !longitude || !latitude || !phone) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
      return;
    }

    // Create shop with geospatial location
    const shop = await Shop.create({
      name,
      description,
      owner,
      image,
      coverImage,
      address,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      phone,
      email,
      openingHours,
      categories,
    });

    res.status(201).json({
      success: true,
      message: 'Shop created successfully',
      data: shop,
    });
  } catch (error: any) {
    console.error('Error creating shop:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating shop',
      error: error.message,
    });
  }
};

// Get shop by ID with menu items
export const getShopById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const shop = await Shop.findById(id).populate('owner', 'name email phone');

    if (!shop) {
      res.status(404).json({
        success: false,
        message: 'Shop not found',
      });
      return;
    }

    // Get menu items for this shop
    const menuItems = await MenuItem.find({ shop: id, isAvailable: true }).sort({ category: 1, name: 1 });

    // Group menu items by category
    const menuByCategory: Record<string, any[]> = {};
    menuItems.forEach((item) => {
      const category = item.category || 'Uncategorized';
      if (!menuByCategory[category]) {
        menuByCategory[category] = [];
      }
      menuByCategory[category].push(item);
    });

    res.status(200).json({
      success: true,
      data: {
        shop,
        menu: menuByCategory,
        totalItems: menuItems.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching shop:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shop',
      error: error.message,
    });
  }
};

// Get all shops
export const getAllShops = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;

    const query: any = { isActive: true };

    if (category) {
      query.categories = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const shops = await Shop.find(query)
      .populate('owner', 'name email')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Shop.countDocuments(query);

    res.status(200).json({
      success: true,
      data: shops,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Error fetching shops:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shops',
      error: error.message,
    });
  }
};

// Search for nearby shops within 20km radius
export const searchNearbyShops = async (req: Request, res: Response): Promise<void> => {
  try {
    const { longitude, latitude, maxDistance = 20000 } = req.query; // maxDistance in meters (20km = 20000m)

    if (!longitude || !latitude) {
      res.status(400).json({
        success: false,
        message: 'Please provide longitude and latitude',
      });
      return;
    }

    const shops = await Shop.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude as string), parseFloat(latitude as string)],
          },
          $maxDistance: parseInt(maxDistance as string),
        },
      },
      isActive: true,
    }).populate('owner', 'name email');

    // Calculate distance for each shop
    const shopsWithDistance = shops.map((shop) => {
      const distance = calculateDistance(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        shop.location.coordinates[1],
        shop.location.coordinates[0]
      );

      return {
        ...shop.toObject(),
        distance: parseFloat(distance.toFixed(2)), // Distance in km
      };
    });

    res.status(200).json({
      success: true,
      data: shopsWithDistance,
      count: shopsWithDistance.length,
    });
  } catch (error: any) {
    console.error('Error searching nearby shops:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching nearby shops',
      error: error.message,
    });
  }
};

// Update shop
export const updateShop = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If updating location
    if (updateData.longitude && updateData.latitude) {
      updateData.location = {
        type: 'Point',
        coordinates: [parseFloat(updateData.longitude), parseFloat(updateData.latitude)],
      };
      delete updateData.longitude;
      delete updateData.latitude;
    }

    const shop = await Shop.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!shop) {
      res.status(404).json({
        success: false,
        message: 'Shop not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Shop updated successfully',
      data: shop,
    });
  } catch (error: any) {
    console.error('Error updating shop:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating shop',
      error: error.message,
    });
  }
};

// Delete shop
export const deleteShop = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const shop = await Shop.findByIdAndDelete(id);

    if (!shop) {
      res.status(404).json({
        success: false,
        message: 'Shop not found',
      });
      return;
    }

    // Also delete all menu items for this shop
    await MenuItem.deleteMany({ shop: id });

    res.status(200).json({
      success: true,
      message: 'Shop deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting shop:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting shop',
      error: error.message,
    });
  }
};

// Deactivate shop
export const deactivateShop = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const shop = await Shop.findById(id);

    if (!shop) {
      res.status(404).json({
        success: false,
        message: 'Shop not found',
      });
      return;
    }

    shop.isActive = false;
    shop.deactivatedAt = new Date();
    await shop.save();

    res.status(200).json({
      success: true,
      message: 'Shop deactivated successfully',
      data: shop,
    });
  } catch (error: any) {
    console.error('Error deactivating shop:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating shop',
      error: error.message,
    });
  }
};

// Reactivate shop
export const reactivateShop = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const shop = await Shop.findById(id);

    if (!shop) {
      res.status(404).json({
        success: false,
        message: 'Shop not found',
      });
      return;
    }

    shop.isActive = true;
    shop.deactivatedAt = undefined;
    await shop.save();

    res.status(200).json({
      success: true,
      message: 'Shop reactivated successfully',
      data: shop,
    });
  } catch (error: any) {
    console.error('Error reactivating shop:', error);
    res.status(500).json({
      success: false,
      message: 'Error reactivating shop',
      error: error.message,
    });
  }
};

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
