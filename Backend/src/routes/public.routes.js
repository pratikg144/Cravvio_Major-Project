const express = require('express');
const router = express.Router();
const { getAbout } = require('../controllers/public.controller');

// Public about endpoint
router.get('/about', getAbout);

module.exports = router;
