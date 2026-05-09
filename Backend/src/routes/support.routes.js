const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller');
const { authMiddleware, AuthUserMiddleware } = require('../middlewares/auth.middleware');

// Create support request (user)
router.post('/', AuthUserMiddleware, supportController.createSupportRequest);

// Admin: list support requests
router.get('/', authMiddleware, supportController.getSupportRequests);

// Admin or owner: get support request
router.get('/:id', authMiddleware, supportController.getSupportRequestById);

// Admin: resolve/close support request
router.put('/:id/resolve', authMiddleware, supportController.resolveSupportRequest);

// Admin: generate AI suggestions for a support request
router.post('/:id/suggest', authMiddleware, supportController.suggestSupportResponse);

module.exports = router;
