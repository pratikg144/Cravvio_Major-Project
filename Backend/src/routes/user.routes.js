const express = require('express');
const router = express.Router();
const { 
    updateUserProfile,
    changeUserPassword,
    getAllUsers,
    getUserById,
    deleteUser,
    getAllVendors,
    getVendorById,
    updateVendorStatus,
    deleteVendor,
    getDashboardStats,
    getNotifications,
    markNotificationAsRead
} = require('../controllers/user.controller');

const { authMiddleware, AuthUserMiddleware } = require('../middlewares/auth.middleware');

// ===== USER PROFILE ROUTES (Protected) =====
router.put('/profile/update', AuthUserMiddleware, updateUserProfile);
router.post('/profile/change-password', AuthUserMiddleware, changeUserPassword);

// ===== ADMIN USER MANAGEMENT ROUTES =====
router.get('/admin/users', authMiddleware, getAllUsers);
router.get('/admin/users/:id', authMiddleware, getUserById);
router.delete('/admin/users/:id', authMiddleware, deleteUser);

// ===== ADMIN VENDOR MANAGEMENT ROUTES =====
router.get('/admin/vendors', authMiddleware, getAllVendors);
router.get('/admin/vendors/:id', authMiddleware, getVendorById);
router.put('/admin/vendors/:id/status', authMiddleware, updateVendorStatus);
router.delete('/admin/vendors/:id', authMiddleware, deleteVendor);

// ===== ADMIN DASHBOARD ROUTES =====
router.get('/admin/dashboard/stats', authMiddleware, getDashboardStats);

// ===== NOTIFICATIONS ROUTES =====
router.get('/notifications', authMiddleware, getNotifications);
router.post('/notifications/:id/read', authMiddleware, markNotificationAsRead);

module.exports = router;
