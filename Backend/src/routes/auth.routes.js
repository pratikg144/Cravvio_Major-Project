const express = require('express');
const authController = require("../controllers/auth.controller");
const { authMiddleware, AuthUserMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

// User routes
router.post('/user/register', authController.registerUser);
router.post('/user/login', authController.loginUser);
router.get('/user/logout', authController.logoutUser);
router.get('/user/profile', AuthUserMiddleware, authController.getUserProfile);
router.put('/user/profile', AuthUserMiddleware, authController.updateUserProfile);

// Vendor routes
router.post('/vendor/register', authController.registerVendor);
router.post('/vendor/login', authController.loginVendor);
router.get('/vendor/logout', authController.logoutVendor);
router.get('/vendor/profile', authMiddleware, authController.getVendorProfile);
router.put('/vendor/profile', authMiddleware, authController.updateVendorProfile);

// Admin routes
router.post('/admin/register', authController.registerAdmin);
router.post('/admin/login', authController.loginAdmin);
router.get('/admin/logout', authController.logoutAdmin);
router.get('/admin/profile', authMiddleware, authController.getAdminProfile);
router.put('/admin/profile', authMiddleware, authController.updateAdminProfile);

module.exports = router;