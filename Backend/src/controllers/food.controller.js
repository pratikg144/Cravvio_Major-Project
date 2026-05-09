const foodModel = require('../models/food.model');
const storageService = require('../services/storage.service');

const {v4:uuid}=require("uuid");


const createFood = async (req, res) => {
    console.log("FORM DATA BODY:", req.body);
    console.log("file",req.file);

    const uploadedImage = await storageService.uploadImage(req.file.buffer, uuid()); 
   
    console.log("Uploaded Image Info:", uploadedImage);

    req.body.image = uploadedImage.url;

    const { foodName, image, description } = req.body;
    const vendorId = req.vendorId;

    const newFood = await foodModel.create({
        name: foodName,
        image: uploadedImage.url,
        description,
        vendorId 
    });

    

    res.status(201).json({ message: "Food created!", food: newFood });
};


async function getFoodItems(req,res){
    const foodItems = await foodModel.find().populate('vendorId', 'name email'); 

    if(foodItems.length === 0) {
        return res.status(404).json({message: "No food items found"});
    }

    res.status(200).json({message: "Food items retrieved successfully", foodItems });






   
   

} 



const addFood = async (req, res) => {
    console.log("FORM DATA BODY:", req.body);
    
    const { foodName, image, description } = req.body;

    const newFoodAdd = await foodAddModel.create({
        name: foodName,
        image,
        description,

    });

    res.json({ message: "Food added!", foodadd: newFoodAdd });
};




module.exports = { createFood, getFoodItems, addFood };