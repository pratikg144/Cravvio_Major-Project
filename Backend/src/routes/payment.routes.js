const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authMiddleware, AuthUserMiddleware, anyAuthMiddleware } = require('../middlewares/auth.middleware');

// User routes
router.post('/create', AuthUserMiddleware, paymentController.createPayment);
router.post('/subscription/create', AuthUserMiddleware, paymentController.createSubscription);

// Admin route: create subscription for all users or specific user
router.post('/subscription/admin/create', authMiddleware, paymentController.createSubscriptionAdmin);
router.get('/subscription/user', AuthUserMiddleware, paymentController.getUserSubscriptions);
router.get('/subscription/all', authMiddleware, paymentController.getAllSubscriptions);
router.put('/subscription/:subscriptionId/approve', authMiddleware, paymentController.approveSubscription);

// Update subscription payment status (Pending → Success)
router.put('/subscription/:subscriptionId/status', authMiddleware, paymentController.updateSubscriptionStatus);

router.delete('/subscription/:subscriptionId', anyAuthMiddleware, paymentController.deleteSubscription);
router.put('/subscription/:subscriptionId/cancel', AuthUserMiddleware, paymentController.cancelSubscriptionByUser);
router.get('/user', AuthUserMiddleware, paymentController.getUserPayments);
router.get('/user/orders', AuthUserMiddleware, paymentController.getUserOrders);

// Admin/Vendor routes
router.get('/:paymentId', authMiddleware, paymentController.getPaymentById);
router.put('/:paymentId/status', authMiddleware, paymentController.updatePaymentStatus);

module.exports = router;
