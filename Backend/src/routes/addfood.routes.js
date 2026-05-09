const express = require('express');
const router = express.Router();
const { useraddmiddleware } = require('../middlewares/auth.middleware');

const { addFood} = require('../controllers/food.controller');



const multer = require("multer");
const upload = multer(
    {storage: multer.memoryStorage()}
);




router.post('/addfood', useraddmiddleware, upload.single('image'), addFood);

module.exports = router;