const express = require('express');
const { sendMessage, getSuggestions } = require('../controllers/chatbot.controller');
const { optionalAuthMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/send-message', optionalAuthMiddleware, sendMessage);
router.post('/suggestions', optionalAuthMiddleware, getSuggestions);

module.exports = router;