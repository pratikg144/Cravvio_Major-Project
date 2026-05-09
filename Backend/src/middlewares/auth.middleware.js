const vendorModel=require('../models/vendor.model');
const adminModel=require('../models/admin.model');
const userModel=require('../models/user.model');
const jwt=require('jsonwebtoken');

async function authMiddleware(req,res,next){
    const token = req.cookies?.token;

    if(!token){
        return res.status(401).json({message:"Unauthorized: please login first" });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Try vendor first
        const vendor = await vendorModel.findById(decoded.id);
        if(vendor){
            req.vendorId = vendor._id;
            req.vendor = vendor;
            return next();
        }

        // Try admin
        const admin = await adminModel.findById(decoded.id);
        if(admin){
            req.adminId = admin._id;
            req.admin = admin;
            return next();
        }
        
        return res.status(401).json({message:"Unauthorized: Vendor/Admin not found"});
    }
    catch(err){
        return res.status(401).json({message:"Unauthorized: Invalid token"});
    }
}



async function AuthUserMiddleware(req, res, next) {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: please login first" });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);
        if(!user){
            return res.status(401).json({message:"Unauthorized: User not found"});
        }

        req.userId = user._id;
        req.user = user;
        next();
    }
    catch(err){
        return res.status(401).json({message:"Unauthorized: Invalid token"});
    }
}

module.exports = { authMiddleware, AuthUserMiddleware };     
// Middleware that allows either admin/vendor OR user (sets whichever is found)
async function anyAuthMiddleware(req, res, next) {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: please login first" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Try user first
        const user = await userModel.findById(decoded.id);
        if (user) {
            req.userId = user._id;
            req.user = user;
            return next();
        }

        // Try vendor
        const vendor = await vendorModel.findById(decoded.id);
        if (vendor) {
            req.vendorId = vendor._id;
            req.vendor = vendor;
            return next();
        }

        // Try admin
        const admin = await adminModel.findById(decoded.id);
        if (admin) {
            req.adminId = admin._id;
            req.admin = admin;
            return next();
        }

        return res.status(401).json({ message: "Unauthorized: user/admin/vendor not found" });
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
}

async function optionalAuthMiddleware(req, res, next) {
    const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if (!token) {
        req.userRole = 'guest';
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Try user first
        const user = await userModel.findById(decoded.id);
        if (user) {
            req.userId = user._id;
            req.user = user;
            req.userRole = 'user';
            return next();
        }

        // Try vendor
        const vendor = await vendorModel.findById(decoded.id);
        if (vendor) {
            req.vendorId = vendor._id;
            req.vendor = vendor;
            req.userRole = 'vendor';
            return next();
        }

        // Try admin
        const admin = await adminModel.findById(decoded.id);
        if (admin) {
            req.adminId = admin._id;
            req.admin = admin;
            req.userRole = 'admin';
            return next();
        }

        // If decoded but no specific role found
        req.userRole = 'guest';
        return next();
    } catch (err) {
        req.userRole = 'guest';
        return next();
    }
}

module.exports = { authMiddleware, AuthUserMiddleware, anyAuthMiddleware, optionalAuthMiddleware };