const Payment = require('../models/payment.model');
const Subscription = require('../models/subscription.model');
const User = require('../models/user.model');

// Create payment
exports.createPayment = async (req, res) => {
  try {
    const { amount, orderId, vendorId } = req.body;
    const userId = req.user.id;

    const payment = new Payment({
      userId,
      amount,
      orderId,
      vendorId,
      status: 'pending'
    });

    await payment.save();
    res.status(201).json({ message: 'Payment created', payment });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create payment', error: err.message });
  }
};

// Create subscription
exports.createSubscription = async (req, res) => {
  try {
    const { plan, price, months } = req.body;
    const userId = req.user.id;

    const subscription = new Subscription({
      userId,
      plan,
      price,
      months,
      status: 'pending'
    });

    await subscription.save();
    res.status(201).json({ message: 'Subscription created', subscription });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create subscription', error: err.message });
  }
};

// Admin: Create subscription for all users or specific user
exports.createSubscriptionAdmin = async (req, res) => {
  try {
    const { plan, price, months, applyToAll, userId } = req.body;

    if (applyToAll) {
      const users = await User.find({});
      const subscriptions = users.map(user => ({
        userId: user._id,
        plan,
        price,
        months,
        status: 'pending'
      }));
      await Subscription.insertMany(subscriptions);
      res.status(201).json({ message: 'Subscriptions created for all users', count: subscriptions.length });
    } else {
      const subscription = new Subscription({
        userId,
        plan,
        price,
        months,
        status: 'pending'
      });
      await subscription.save();
      res.status(201).json({ message: 'Subscription created', subscription });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to create subscription', error: err.message });
  }
};

// Get user subscriptions
exports.getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const subscriptions = await Subscription.find({ userId });
    res.json({ subscriptions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch subscriptions', error: err.message });
  }
};

// Get all subscriptions (admin)
exports.getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find().populate('userId', 'username email phone');
    res.json({ subscriptions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch subscriptions', error: err.message });
  }
};

// Approve subscription
exports.approveSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const subscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      { status: 'success' },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.json({ message: 'Subscription approved', subscription });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve subscription', error: err.message });
  }
};

// Delete subscription
exports.deleteSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    await Subscription.findByIdAndDelete(subscriptionId);
    res.json({ message: 'Subscription deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete subscription', error: err.message });
  }
};

// Cancel subscription by user
exports.cancelSubscriptionByUser = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const userId = req.user.id;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription || subscription.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this subscription' });
    }

    await Subscription.findByIdAndDelete(subscriptionId);
    res.json({ message: 'Subscription cancelled' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel subscription', error: err.message });
  }
};

// Get user payments
exports.getUserPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await Payment.find({ userId });
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payments', error: err.message });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await Payment.find({ userId, type: 'order' });
    res.json({ orders: payments });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ payment });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payment', error: err.message });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { status },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ message: 'Payment status updated', payment });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update payment status', error: err.message });
  }
};

// Update subscription payment status (Pending → Success)
exports.updateSubscriptionStatus = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { status } = req.body;

    if (!['pending', 'success', 'failed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const subscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('userId', 'username email phone');

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.json({
      message: 'Payment status updated successfully',
      subscription
    });
  } catch (err) {
    console.error('Update subscription status error:', err);
    res.status(500).json({
      message: 'Failed to update payment status',
      error: err.message
    });
  }
};