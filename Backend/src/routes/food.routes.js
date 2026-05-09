const express = require('express');
const router = express.Router();
const { authMiddleware, AuthUserMiddleware } = require('../middlewares/auth.middleware');

const { createFood,getFoodItems, getVendorMenu } = require('../controllers/food.controller.v2');
const { placeOrder, getVendorOrders, updateOrderStatus } = require('../controllers/food.controller.v2');



const multer = require("multer");
const upload = multer(
    {storage: multer.memoryStorage()}
);
 

 


router.post('/create', authMiddleware, upload.single('image'), createFood );

// Public list of food items
router.get('/', getFoodItems );

// Vendor-only menu (view own foods)
router.get('/vendor/menu', authMiddleware, getVendorMenu);

// Orders
router.post('/order', AuthUserMiddleware, placeOrder);

// Vendor order endpoints
router.get('/orders/vendor', authMiddleware, getVendorOrders);
router.put('/orders/:id/status', authMiddleware, updateOrderStatus);





module.exports = router;
