const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// All routes protected - authMiddleware allows admin/vendor; controller assumes admin
router.get('/orders', authMiddleware, adminController.getAllOrders);
router.get('/orders/:id', authMiddleware, adminController.getOrderById);
router.put('/orders/:id/status', authMiddleware, adminController.updateOrderStatus);
router.get('/stats', authMiddleware, adminController.getDashboardStats);
router.get('/payments', authMiddleware, adminController.getAllPayments);
router.get('/recent-activity', authMiddleware, adminController.getRecentActivity);
router.get('/chatbot-queries', authMiddleware, adminController.getChatbotQueries);
router.put('/chatbot-queries/:id/resolve', authMiddleware, adminController.resolveChatbotQuery);

module.exports = router;
