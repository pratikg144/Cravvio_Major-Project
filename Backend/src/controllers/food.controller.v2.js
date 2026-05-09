const foodModel = require('../models/food.model');
const orderModel = require('../models/order.model');
const storageService = require('../services/storage.service');
const { v4: uuid } = require('uuid');

// Create a new food item (Vendor)
const createFood = async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const { foodName, description, price } = req.body;

    if (!foodName) {
      return res.status(400).json({ message: 'foodName is required' });
    }

    let imageUrl = '';
    if (req.file && req.file.buffer) {
      const uploadedImage = await storageService.uploadImage(req.file.buffer, uuid());
      imageUrl = uploadedImage?.url || '';
    }

    const newFood = await foodModel.create({
      name: foodName,
      image: imageUrl,
      description: description || '',
      price: price || 0,
      vendorId
    });

    return res.status(201).json({ message: 'Food created!', food: newFood });
  } catch (error) {
    console.error('createFood error', error);
    return res.status(500).json({ message: 'Error creating food', error: error.message });
  }
};

// Get list of food items (public read)
async function getFoodItems(req, res) {
  try {
    const foodItems = await foodModel.find().populate('vendorId', 'CompanyName email');
    return res.status(200).json({ message: 'Food items retrieved successfully', foodItems });
  } catch (error) {
    console.error('getFoodItems error', error);
    return res.status(500).json({ message: 'Error fetching food items', error: error.message });
  }
}

// Get food items for the logged-in vendor (vendor-only view)
async function getVendorMenu(req, res) {
  try {
    const vendorId = req.vendorId;
    const foodItems = await foodModel.find({ vendorId });
    return res.status(200).json({ message: 'Vendor menu retrieved', foodItems });
  } catch (error) {
    console.error('getVendorMenu error', error);
    return res.status(500).json({ message: 'Error fetching vendor menu', error: error.message });
  }
}

// Place an order (User)
async function placeOrder(req, res) {
  try {
    const userId = req.userId;
    const { vendorId, items, total } = req.body;

    if (!vendorId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'vendorId and items are required' });
    }

    const orderTotal = total || items.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0);

    const newOrder = await orderModel.create({
      userId,
      vendorId,
      items,
      total: orderTotal,
      status: 'pending'
    });

    return res.status(201).json({ message: 'Order placed', order: newOrder });
  } catch (error) {
    console.error('placeOrder error', error);
    return res.status(500).json({ message: 'Error placing order', error: error.message });
  }
}

// Get orders for vendor
async function getVendorOrders(req, res) {
  try {
    const vendorId = req.vendorId;
    const orders = await orderModel.find({ vendorId }).populate('userId', 'username email').sort({ createdAt: -1 });
    return res.status(200).json({ message: 'Orders retrieved', orders });
  } catch (error) {
    console.error('getVendorOrders error', error);
    return res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
}

// Update order status (vendor)
async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, paymentInfo } = req.body;

    const validStatuses = ['pending', 'paid', 'preparing', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await orderModel.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // ensure vendor ownership
    if (String(order.vendorId) !== String(req.vendorId)) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    if (status) order.status = status;
    if (paymentInfo) order.paymentInfo = paymentInfo;

    await order.save();
    return res.status(200).json({ message: 'Order updated', order });
  } catch (error) {
    console.error('updateOrderStatus error', error);
    return res.status(500).json({ message: 'Error updating order', error: error.message });
  }
}

module.exports = { createFood, getFoodItems, getVendorMenu, placeOrder, getVendorOrders, updateOrderStatus };
