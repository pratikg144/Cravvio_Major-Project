const userModel = require("../models/user.model");
const vendorModel = require("../models/vendor.model");
const adminModel = require("../models/admin.model");

const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');


async function registerUser(req, res) { 

    const {username,email,password,phone,address,pincode}=req.body;

    const isUserAlreadyExists=await userModel.findOne({
        email
    })
    if(isUserAlreadyExists){
        return res.status(400).json({
           message:"user already Exist"
        })
    }

    const hashPassword= await bcrypt.hash(password, 10);

    const user= await userModel.create
    ({
        username,
        email,
        password:hashPassword,
        phone,
        address,
        pincode
    })

    const token=jwt.sign({
        id:user._id,

    },process.env.JWT_SECRET)
    

    res.cookie("token",token)

    res.status(201).json({
        message: "User registered successfully",
        user:{
            id: user._id,
            username: user.username,
            email:user.email,
            phone:user.phone,
            address:user.address,
            pincode:user.pincode

        }
    })
 

}

async function loginUser(req,res) {

    const {email, password}=req.body;

    const user = await userModel.findOne({
        email
    })

    if(!user){
         return res.status(400).json({
           message:"invalid email or Password"
        })
         
    }

    const ispasswordvalid= await bcrypt.compare(password,user.password);
    if(!ispasswordvalid){
         return res.status(400).json({
           message:"invalid email or Password"
        })
    }
   
   const token=jwt.sign({
        id:user._id,

    },process.env.JWT_SECRET)
    

    res.cookie("token",token)

    res.status(200).json({
        message: "User Logged in successfully",
        user:{
            id: user._id,
            username: user.username,
            email:user.email
        }
    })


    
}


function logoutUser(req, res) {
    res.clearCookie("token", {
        httpOnly: true,   // match how you set it
        secure: true,     // if you used secure cookies
        sameSite: "strict"
    });
    res.status(200).json({
        message: "User logout successfully"
    });
}


// vendor functions can be added similarly

async function registerVendor(req, res) {
    // Similar to registerUser but using vendorModel

    const {username,email,password,phone,address,pincode}=req.body;

    const isVendorAlreadyExists=await vendorModel.findOne({
        email
    })

    if(isVendorAlreadyExists){
        return res.status(400).json({
           message:"Vendor already Exist"
        })
    }
    const hashPassword= await bcrypt.hash(password, 10);

    const vendor= await vendorModel.create
    ({
        username,
        email,
        password:hashPassword,
        phone,
        address,
        pincode
    })
    const token=jwt.sign({
        id:vendor._id,
    },process.env.JWT_SECRET)

    res.cookie("token",token)
    res.status(201).json({
        message: "Vendor registered successfully",
        vendor:{
            id: vendor._id,
            CompanyName: vendor.CompanyName,
            email: vendor.email
        }
    })


}

async function loginVendor(req, res) {
    // Similar to loginUser but using vendorModel

    const {email, password}=req.body;

    const vendor = await vendorModel.findOne({
        email
    })
    if(!vendor){
         return res.status(400).json({
           message:"invalid email or Password"
        })
    }

    const ispasswordvalid= await bcrypt.compare(password,vendor.password);
    if(!ispasswordvalid){
         return res.status(400).json({
           message:"invalid email or Password"
        })
    }

    const token=jwt.sign({
        id:vendor._id,

    },process.env.JWT_SECRET)
    

    res.cookie("token",token)

    res.status(200).json({
        message: "Vendor Logged in successfully",
        vendor:{
            id: vendor._id,
            CompanyName: vendor.CompanyName,
            email: vendor.email
        }
    })


    
}


function logoutVendor(req, res) {
    // Similar to logoutUser

    res.clearCookie("token", {
        httpOnly: true,   
        secure: true,    
        sameSite: "strict"
    });
    res.status(200).json({
        message: "Vendor logout successfully"
    });
}


async function registerAdmin(req, res) {
    // Similar to registerUser but using adminModel

    const {username,email,password,phone,address,pincode}=req.body;

    const isAdminAlreadyExists=await adminModel.findOne({
        email
    })
    if(isAdminAlreadyExists){
        return res.status(400).json({
           message:"Admin already Exist"
        })
    }
    const hashPassword= await bcrypt.hash(password, 10);
    const admin= await adminModel.create
    ({
        username,
        email,
        password:hashPassword,
        phone,
        address,
        pincode
    })
    const token=jwt.sign({
        id:admin._id,
    },process.env.JWT_SECRET)
    res.cookie("token",token)
    res.status(201).json({
        message: "Admin registered successfully",
        admin:{
            id: admin._id,
            owner: admin.owner,
            email: admin.email
        }
    })

}



async function loginAdmin(req, res) {
    // Similar to loginUser but using adminModel

    const {email, password}=req.body;

    const admin = await adminModel.findOne({
        email
    })
    if(!admin){
         return res.status(400).json({
           message:"invalid email or Password"
        })
    }
    const ispasswordvalid= await bcrypt.compare(password,admin.password);
    if(!ispasswordvalid){
         return res.status(400).json({
           message:"invalid email or Password"
        })
    }
    const token=jwt.sign({
        id:admin._id,
    },process.env.JWT_SECRET)
    res.cookie("token",token)
    res.status(200).json({
        message: "Admin Logged in successfully",
        admin:{
            id: admin._id,
            owner: admin.owner,
            email: admin.email
        }
    })

}

function logoutAdmin(req, res) {
    
    // Similar to logoutUser
    res.clearCookie("token", {
        httpOnly: true,   
        secure: true,
        sameSite: "strict"
    });
    res.status(200).json({
        message: "Admin logout successfully"
    });
}

// Get User Profile
async function getUserProfile(req, res) {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                address: user.address,
                pincode: user.pincode
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching user profile", error: error.message });
    }
}

// Get Vendor Profile
async function getVendorProfile(req, res) {
    try {
        const vendorId = req.vendorId;
        const vendor = await vendorModel.findById(vendorId).select('-password');
        
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        
        res.status(200).json({
            vendor: {
                id: vendor._id,
                CompanyName: vendor.CompanyName,
                email: vendor.email,
                phone: vendor.phone,
                address: vendor.address,
                pincode: vendor.pincode
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching vendor profile", error: error.message });
    }
}

// Get Admin Profile
async function getAdminProfile(req, res) {
    try {
        const adminId = req.adminId;
        const admin = await adminModel.findById(adminId).select('-password');
        
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        
        res.status(200).json({
            admin: {
                id: admin._id,
                owner: admin.owner,
                email: admin.email,
                phone: admin.phone,
                address: admin.address,
                pincode: admin.pincode
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching admin profile", error: error.message });
    }
}

// Update User Profile
async function updateUserProfile(req, res) {
    try {
        const userId = req.userId;
        const { username, email, phone, address } = req.body;

        const updateData = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (address) updateData.address = address;

        const user = await userModel.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User profile updated successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                address: user.address,
                pincode: user.pincode
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating user profile", error: error.message });
    }
}

// Update Vendor Profile
async function updateVendorProfile(req, res) {
    try {
        const vendorId = req.vendorId;
        const { CompanyName, email, phone, address } = req.body;

        const updateData = {};
        if (CompanyName) updateData.CompanyName = CompanyName;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (address) updateData.address = address;

        const vendor = await vendorModel.findByIdAndUpdate(vendorId, updateData, { new: true }).select('-password');

        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        res.status(200).json({
            message: "Vendor profile updated successfully",
            vendor: {
                id: vendor._id,
                CompanyName: vendor.CompanyName,
                email: vendor.email,
                phone: vendor.phone,
                address: vendor.address
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating vendor profile", error: error.message });
    }
}

// Update Admin Profile
async function updateAdminProfile(req, res) {
    try {
        const adminId = req.adminId;
        const { owner, email, phone, address, pincode } = req.body;

        const updateData = {};
        if (owner) updateData.owner = owner;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (address) updateData.address = address;
        if (pincode) updateData.pincode = pincode;

        const admin = await adminModel.findByIdAndUpdate(adminId, updateData, { new: true }).select('-password');

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.status(200).json({
            message: "Admin profile updated successfully",
            admin: {
                id: admin._id,
                owner: admin.owner,
                email: admin.email,
                phone: admin.phone,
                address: admin.address,
                pincode: admin.pincode
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating admin profile", error: error.message });
    }
}

module.exports ={
  registerUser,
  loginUser,
  logoutUser,
  registerVendor,
  loginVendor,
  logoutVendor,
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getUserProfile,
  getVendorProfile,
  getAdminProfile,
    updateAdminProfile,
  updateUserProfile,
  updateVendorProfile

}