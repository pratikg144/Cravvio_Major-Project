const Order = require('../models/order.model');
const User = require('../models/user.model');
const Vendor = require('../models/vendor.model');
const Payment = require('../models/payment.model');
const Support = require('../models/support.model');
const ChatbotQuery = require('../models/chatbotQuery.model');

async function getAllOrders(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '50', 10);
    const status = req.query.status;
    const search = req.query.search;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [
        { _id: search },
        { 'userId': search }
      ];
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('userId', 'username email')
      .populate('vendorId', 'CompanyName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ orders, total, page, limit });
  } catch (err) {
    console.error('getAllOrders error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getOrderById(req, res) {
  try {
    const id = req.params.id;
    const order = await Order.findById(id)
      .populate('userId', 'username email phone address')
      .populate('vendorId', 'CompanyName email phone')
      .lean();
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (err) {
    console.error('getOrderById error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const allowed = ['pending', 'paid', 'preparing', 'completed', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json({ message: 'Order updated', order });
  } catch (err) {
    console.error('updateOrderStatus error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getDashboardStats(req, res) {
  try {
    const totalUsers = await User.countDocuments({});
    const activeVendors = await Vendor.countDocuments({ status: 'approved' });
    const totalOrders = await Order.countDocuments({});
    const revenueAgg = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const revenue = (revenueAgg[0] && revenueAgg[0].total) || 0;
    res.json({ totalUsers, activeVendors, totalOrders, revenue });
  } catch (err) {
    console.error('getDashboardStats error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getAllPayments(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '50', 10);
    const status = req.query.status;
    const filter = {};
    if (status) filter.status = status;

    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
      .populate('userId', 'username email')
      .populate('orderId', 'items total')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ payments, total, page, limit });
  } catch (err) {
    console.error('getAllPayments error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getRecentActivity(req, res) {
  try {
    const [orders, supports, queries] = await Promise.all([
      Order.find()
        .populate('userId', 'username email')
        .populate('vendorId', 'CompanyName email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Support.find()
        .populate('userId', 'username email')
        .populate('orderId', 'status')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      ChatbotQuery.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const activities = [];

    orders.forEach((order) => {
      activities.push({
        type: 'order',
        title: `New order #${order._id}`,
        description: `Placed by ${order.userId?.username || order.userId?.email || 'Unknown'} for vendor ${order.vendorId?.CompanyName || 'Unknown'}`,
        status: order.status || 'unknown',
        createdAt: order.createdAt,
      });
    });

    supports.forEach((support) => {
      activities.push({
        type: 'support',
        title: `Support ticket: ${support.subject}`,
        description: `From ${support.userId?.username || support.userId?.email || 'User'} (${support.status})`,
        status: support.status,
        createdAt: support.createdAt,
      });
    });

    queries.forEach((query) => {
      activities.push({
        type: 'query',
        title: `Chatbot query from ${query.role}`,
        description: `${query.role === 'vendor' ? 'Vendor' : 'User'} query needs review`,
        status: query.status,
        createdAt: query.createdAt,
      });
    });

    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ activities: activities.slice(0, 8) });
  } catch (err) {
    console.error('getRecentActivity error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getChatbotQueries(req, res) {
  try {
    const queries = await ChatbotQuery.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ queries });
  } catch (err) {
    console.error('getChatbotQueries error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function resolveChatbotQuery(req, res) {
  try {
    const { id } = req.params;
    const { adminResponse } = req.body;
    const updated = await ChatbotQuery.findByIdAndUpdate(
      id,
      {
        status: 'resolved',
        adminResponse: adminResponse || 'Resolved by admin',
        resolvedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Query not found' });
    res.json({ message: 'Query resolved', query: updated });
  } catch (err) {
    console.error('resolveChatbotQuery error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getAllOrders, getOrderById, updateOrderStatus, getDashboardStats, getAllPayments, getRecentActivity, getChatbotQueries, resolveChatbotQuery };
