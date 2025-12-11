import { Request, Response } from 'express';
import Order from '../models/Order';
import MenuItem from '../models/MenuItem';
import Shop from '../models/Shop';
import Wallet from '../models/Wallet';
import Transaction from '../models/Transaction';
import { v4 as uuidv4 } from 'uuid';

// Place a new order
export const placeOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      customer,
      shop,
      items,
      deliveryAddress,
      deliveryInstructions,
      paymentMethod,
      notes,
    } = req.body;

    // Validate required fields
    if (!customer || !shop || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Please provide customer, shop, and items',
      });
      return;
    }

    if (!deliveryAddress) {
      res.status(400).json({
        success: false,
        message: 'Please provide delivery address',
      });
      return;
    }

    if (!paymentMethod || !['wallet', 'paystack', 'cash'].includes(paymentMethod)) {
      res.status(400).json({
        success: false,
        message: 'Please provide valid payment method (wallet, paystack, or cash)',
      });
      return;
    }

    // Verify shop exists
    const shopExists = await Shop.findById(shop);
    if (!shopExists) {
      res.status(404).json({
        success: false,
        message: 'Shop not found',
      });
      return;
    }

    // Calculate order totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);

      if (!menuItem) {
        res.status(404).json({
          success: false,
          message: `Menu item ${item.menuItem} not found`,
        });
        return;
      }

      if (!menuItem.isAvailable) {
        res.status(400).json({
          success: false,
          message: `${menuItem.name} is currently unavailable`,
        });
        return;
      }

      let itemSubtotal = menuItem.price * item.quantity;

      // Add customization costs
      if (item.customizations && Array.isArray(item.customizations)) {
        item.customizations.forEach((custom: any) => {
          itemSubtotal += custom.price * item.quantity;
        });
      }

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        customizations: item.customizations || [],
        subtotal: itemSubtotal,
      });

      subtotal += itemSubtotal;
    }

    // Calculate fees
    const deliveryFee = 25; // Fixed delivery fee
    const serviceFee = subtotal * 0.05; // 5% service fee
    const total = subtotal + deliveryFee + serviceFee;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // If payment method is wallet, check balance and deduct
    if (paymentMethod === 'wallet') {
      const wallet = await Wallet.findOne({ user: customer });

      if (!wallet) {
        res.status(404).json({
          success: false,
          message: 'Wallet not found',
        });
        return;
      }

      if (wallet.balance < total) {
        res.status(400).json({
          success: false,
          message: 'Insufficient wallet balance',
          data: {
            required: total,
            available: wallet.balance,
            shortfall: total - wallet.balance,
          },
        });
        return;
      }

      // Deduct from wallet
      const balanceBefore = wallet.balance;
      wallet.balance -= total;
      await wallet.save();

      // Create transaction
      await Transaction.create({
        user: customer,
        wallet: wallet._id,
        type: 'debit',
        amount: total,
        currency: wallet.currency,
        description: `Payment for order ${orderNumber}`,
        reference: `order-${orderNumber}`,
        status: 'success',
        paymentMethod: 'wallet',
        balanceBefore,
        balanceAfter: wallet.balance,
        metadata: { orderId: orderNumber },
      });
    }

    // Create order
    const order = await Order.create({
      orderNumber,
      customer,
      shop,
      items: orderItems,
      subtotal,
      deliveryFee,
      serviceFee,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'wallet' ? 'paid' : 'pending',
      paymentReference: paymentMethod === 'wallet' ? `order-${orderNumber}` : undefined,
      deliveryAddress,
      deliveryInstructions,
      notes,
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes from now
    });

    // Populate order details
    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('shop', 'name address phone')
      .populate('items.menuItem', 'name image');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: populatedOrder,
    });
  } catch (error: any) {
    console.error('Error placing order:', error);
    res.status(500).json({
      success: false,
      message: 'Error placing order',
      error: error.message,
    });
  }
};

// Get order by ID
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('customer', 'name email phone')
      .populate('shop', 'name address phone image')
      .populate('items.menuItem', 'name image price');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message,
    });
  }
};

// Get orders by customer
export const getCustomerOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = { customer: customerId };

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('shop', 'name address phone image')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer orders',
      error: error.message,
    });
  }
};

// Get orders by shop
export const getShopOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shopId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = { shop: shopId };

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Error fetching shop orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shop orders',
      error: error.message,
    });
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'completed', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid status',
      });
      return;
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('customer', 'name email phone')
      .populate('shop', 'name address phone');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message,
    });
  }
};

// Cancel order
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    // Only allow cancellation if order is pending or confirmed
    if (!['pending', 'confirmed'].includes(order.status)) {
      res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage',
      });
      return;
    }

    // If paid via wallet, refund
    if (order.paymentMethod === 'wallet' && order.paymentStatus === 'paid') {
      const wallet = await Wallet.findOne({ user: order.customer });

      if (wallet) {
        const balanceBefore = wallet.balance;
        wallet.balance += order.total;
        await wallet.save();

        // Create refund transaction
        await Transaction.create({
          user: order.customer,
          wallet: wallet._id,
          type: 'credit',
          amount: order.total,
          currency: wallet.currency,
          description: `Refund for cancelled order ${order.orderNumber}`,
          reference: `refund-${order.orderNumber}-${uuidv4()}`,
          status: 'success',
          paymentMethod: 'wallet',
          balanceBefore,
          balanceAfter: wallet.balance,
          metadata: { orderId: order._id },
        });

        order.paymentStatus = 'refunded';
      }
    }

    order.status = 'cancelled';
    order.cancelReason = cancelReason || 'Cancelled by user';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message,
    });
  }
};
