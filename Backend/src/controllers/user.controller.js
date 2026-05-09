const userModel = require("../models/user.model");
const vendorModel = require("../models/vendor.model");
const bcrypt = require('bcryptjs');

// ===== USER PROFILE MANAGEMENT =====

// Update User Profile
async function updateUserProfile(req, res) {
    try {
        const userId = req.userId;
        const { username, phone, address, pincode } = req.body;

        // Validate input
        if (!username || !phone || !address || !pincode) {
            return res.status(400).json({ 
                message: "All fields are required" 
            });
        }

        const user = await userModel.findByIdAndUpdate(
            userId,
            { username, phone, address, pincode },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Profile updated successfully",
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
        res.status(500).json({ 
            message: "Error updating profile", 
            error: error.message 
        });
    }
}

// Change User Password
async function changeUserPassword(req, res) {
    try {
        const userId = req.userId;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ 
                message: "All password fields are required" 
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ 
                message: "New passwords do not match" 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                message: "Password must be at least 6 characters" 
            });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ 
                message: "Current password is incorrect" 
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            message: "Password changed successfully"
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error changing password", 
            error: error.message 
        });
    }
}

// ===== USER MANAGEMENT (Admin) =====

// Get All Users
async function getAllUsers(req, res) {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;

        const query = search 
            ? { 
                $or: [
                    { username: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } }
                ]
            }
            : {};

        const skip = (page - 1) * limit;

        const users = await userModel
            .find(query)
            .select('-password')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await userModel.countDocuments(query);

        res.status(200).json({
            message: "Users retrieved successfully",
            users,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching users", 
            error: error.message 
        });
    }
}

// Get User by ID
async function getUserById(req, res) {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User retrieved successfully",
            user
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching user", 
            error: error.message 
        });
    }
}

// Delete User (Admin only)
async function deleteUser(req, res) {
    try {
        const { id } = req.params;
        const user = await userModel.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error deleting user", 
            error: error.message 
        });
    }
}

// ===== VENDOR MANAGEMENT (Admin) =====

// Get All Vendors
async function getAllVendors(req, res) {
    try {
        const { page = 1, limit = 10, search = "", status = "" } = req.query;

        const query = search 
            ? { 
                $or: [
                    { CompanyName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } }
                ]
            }
            : {};

        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const vendors = await vendorModel
            .find(query)
            .select('-password')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await vendorModel.countDocuments(query);

        res.status(200).json({
            message: "Vendors retrieved successfully",
            vendors,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching vendors", 
            error: error.message 
        });
    }
}

// Get Vendor by ID
async function getVendorById(req, res) {
    try {
        const { id } = req.params;
        const vendor = await vendorModel.findById(id).select('-password');

        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        res.status(200).json({
            message: "Vendor retrieved successfully",
            vendor
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching vendor", 
            error: error.message 
        });
    }
}

// Approve/Reject Vendor (Admin only)
async function updateVendorStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'approved', 'rejected', 'suspended'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: "Invalid status. Must be pending, approved, rejected, or suspended" 
            });
        }

        const vendor = await vendorModel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).select('-password');

        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        res.status(200).json({
            message: `Vendor status updated to ${status}`,
            vendor
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error updating vendor status", 
            error: error.message 
        });
    }
}

// Delete Vendor (Admin only)
async function deleteVendor(req, res) {
    try {
        const { id } = req.params;
        const vendor = await vendorModel.findByIdAndDelete(id);

        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        res.status(200).json({
            message: "Vendor deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error deleting vendor", 
            error: error.message 
        });
    }
}

// ===== SYSTEM STATISTICS =====

// Get Dashboard Statistics (Admin)
async function getDashboardStats(req, res) {
    try {
        const totalUsers = await userModel.countDocuments();
        const totalVendors = await vendorModel.countDocuments();
        const approvedVendors = await vendorModel.countDocuments({ status: 'approved' });
        const pendingVendors = await vendorModel.countDocuments({ status: 'pending' });

        // Get recent users
        const recentUsers = await userModel
            .find()
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(5);

        // Get recent vendors
        const recentVendors = await vendorModel
            .find()
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            message: "Dashboard statistics retrieved",
            statistics: {
                totalUsers,
                totalVendors,
                approvedVendors,
                pendingVendors,
                recentUsers,
                recentVendors
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching statistics", 
            error: error.message 
        });
    }
}

// ===== NOTIFICATIONS =====

// Get Notifications (mock for now, ready for real implementation)
async function getNotifications(req, res) {
    try {
        const { type = "all", limit = 10 } = req.query;

        // Mock notifications - will be replaced with real notification model
        const notifications = [
            {
                id: 1,
                type: "vendor_registration",
                message: "New vendor registration: FoodHub Restaurant",
                timestamp: new Date(Date.now() - 3600000),
                read: false
            },
            {
                id: 2,
                type: "user_registration",
                message: "3 new user registrations today",
                timestamp: new Date(Date.now() - 7200000),
                read: false
            },
            {
                id: 3,
                type: "system_alert",
                message: "System backup completed successfully",
                timestamp: new Date(Date.now() - 86400000),
                read: true
            },
            {
                id: 4,
                type: "vendor_approval",
                message: "Pending vendor approval: TasteBuds Cafe",
                timestamp: new Date(Date.now() - 172800000),
                read: true
            }
        ];

        const filtered = type === "all" 
            ? notifications 
            : notifications.filter(n => n.type === type);

        res.status(200).json({
            message: "Notifications retrieved",
            notifications: filtered.slice(0, parseInt(limit))
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching notifications", 
            error: error.message 
        });
    }
}

// Mark Notification as Read
async function markNotificationAsRead(req, res) {
    try {
        // Will be implemented with real notification model
        res.status(200).json({
            message: "Notification marked as read"
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error marking notification as read", 
            error: error.message 
        });
    }
}

module.exports = {
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
};
