# Backend Structure & API Implementation Guide

## Project Structure

```
Backend/
├── package.json
├── server.js
├── .env
├── src/
│   ├── app.js                          (Express app configuration)
│   ├── controllers/
│   │   ├── auth.controller.js          (Auth: register, login, logout, profile)
│   │   ├── user.controller.js          (NEW: User & vendor management)
│   │   └── food.controller.js          (Food items management)
│   ├── routes/
│   │   ├── auth.routes.js              (Auth endpoints)
│   │   ├── user.routes.js              (NEW: User/admin management routes)
│   │   └── food.routes.js              (Food routes)
│   ├── models/
│   │   ├── user.model.js               (User schema)
│   │   ├── vendor.model.js             (Vendor schema)
│   │   ├── admin.model.js              (Admin schema)
│   │   ├── food.model.js               (Food schema)
│   │   └── addfood.model.js            (Add food schema)
│   ├── middlewares/
│   │   └── auth.middleware.js          (JWT validation middleware)
│   ├── services/
│   │   └── storage.service.js          (File upload service)
│   └── db/
│       └── db.js                       (MongoDB connection)
```

---

## New Files Created

### 1. `src/controllers/user.controller.js`

**Purpose:** Handle all user and vendor management operations

**Functions Implemented:**

#### Profile Management (User)

- `updateUserProfile()` - Update username, phone, address, pincode
- `changeUserPassword()` - Change user password with validation

#### User Management (Admin)

- `getAllUsers()` - Get paginated users with search
- `getUserById()` - Get specific user by ID
- `deleteUser()` - Delete user (admin only)

#### Vendor Management (Admin)

- `getAllVendors()` - Get vendors with filtering by status
- `getVendorById()` - Get specific vendor
- `updateVendorStatus()` - Approve/reject/suspend vendors
- `deleteVendor()` - Delete vendor

#### Dashboard & Notifications

- `getDashboardStats()` - Get system statistics
- `getNotifications()` - Get notifications list
- `markNotificationAsRead()` - Mark notification as read

**Code Example:**

```javascript
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

        // Update and return user
        const user = await userModel.findByIdAndUpdate(
            userId,
            { username, phone, address, pincode },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            message: "Profile updated successfully",
            user: { ... }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating profile",
            error: error.message
        });
    }
}
```

### 2. `src/routes/user.routes.js`

**Purpose:** Define all user management API routes

**Routes Defined:**

```javascript
// User Profile Routes
router.put("/profile/update", AuthUserMiddleware, updateUserProfile);
router.post("/profile/change-password", AuthUserMiddleware, changeUserPassword);

// Admin User Management
router.get("/admin/users", authMiddleware, getAllUsers);
router.get("/admin/users/:id", authMiddleware, getUserById);
router.delete("/admin/users/:id", authMiddleware, deleteUser);

// Admin Vendor Management
router.get("/admin/vendors", authMiddleware, getAllVendors);
router.get("/admin/vendors/:id", authMiddleware, getVendorById);
router.put("/admin/vendors/:id/status", authMiddleware, updateVendorStatus);
router.delete("/admin/vendors/:id", authMiddleware, deleteVendor);

// Admin Dashboard
router.get("/admin/dashboard/stats", authMiddleware, getDashboardStats);

// Notifications
router.get("/notifications", authMiddleware, getNotifications);
router.post("/notifications/:id/read", authMiddleware, markNotificationAsRead);
```

---

## Updated Files

### `src/app.js`

**Changes Made:**

- Added import for new user routes
- Registered user routes at `/api/user`

**Before:**

```javascript
const authRoutes = require("./routes/auth.routes");
const foodRoutes = require("./routes/food.routes");

app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
```

**After:**

```javascript
const authRoutes = require("./routes/auth.routes");
const foodRoutes = require("./routes/food.routes");
const userRoutes = require("./routes/user.routes"); // NEW

app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/user", userRoutes); // NEW
```

---

## Authentication & Authorization

### Middleware Used

#### `AuthUserMiddleware` - User Routes

```javascript
router.put("/profile/update", AuthUserMiddleware, updateUserProfile);
// Verifies JWT token and sets req.userId
// Used for: User profile updates, password changes
```

#### `authMiddleware` - Admin Routes

```javascript
router.get("/admin/users", authMiddleware, getAllUsers);
// Verifies JWT token for vendor/admin
// Sets req.vendorId or req.adminId
// Used for: Admin management endpoints
```

### Middleware Implementation

```javascript
// auth.middleware.js
async function authMiddleware(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized: please login first",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded.id;

    // Try vendor
    const vendor = await vendorModel.findById(id);
    if (vendor) {
      req.vendorId = id;
      return next();
    }

    // Try admin
    const admin = await adminModel.findById(id);
    if (admin) {
      req.adminId = id;
      return next();
    }

    res.status(401).json({
      message: "Unauthorized: Invalid user",
    });
  } catch (err) {
    res.status(401).json({
      message: "Unauthorized: Invalid token",
    });
  }
}
```

---

## API Flow Diagrams

### User Profile Update Flow

```
Frontend (UserProfilePage.jsx)
         |
         | PUT /api/user/profile/update
         | { username, phone, address, pincode }
         |
         ↓
Backend (user.controller.js)
         |
         | 1. Authenticate user (AuthUserMiddleware)
         | 2. Validate input fields
         | 3. Update in MongoDB
         | 4. Return updated user
         |
         ↓
Database (userModel)
```

### Vendor Approval Flow

```
Frontend (ReviewPage.jsx)
         |
         | PUT /api/user/admin/vendors/:id/status
         | { status: "approved" }
         |
         ↓
Backend (user.controller.js)
         |
         | 1. Authenticate admin (authMiddleware)
         | 2. Validate status value
         | 3. Update vendor status
         | 4. Return updated vendor
         |
         ↓
Database (vendorModel)
```

### Dashboard Stats Flow

```
Frontend (FullReportPage.jsx)
         |
         | GET /api/user/admin/dashboard/stats
         |
         ↓
Backend (user.controller.js)
         |
         | 1. Authenticate admin
         | 2. Count users/vendors
         | 3. Filter by status
         | 4. Get recent entries
         |
         ↓
Database (userModel, vendorModel)
```

---

## Query Parameter Handling

### Pagination

```javascript
const { page = 1, limit = 10, search = "" } = req.query;
const skip = (page - 1) * limit;

// Get total count
const total = await userModel.countDocuments(query);

// Return pagination info
res.json({
    data: [...],
    pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page)
    }
});
```

### Search Implementation

```javascript
const query = search
  ? {
      $or: [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ],
    }
  : {};

const users = await userModel.find(query).skip(skip).limit(limit);
```

### Status Filtering

```javascript
const { status = "" } = req.query;

let query = {};
if (status) {
  query.status = status;
}

const vendors = await vendorModel.find(query);
```

---

## Database Models

### User Model (Updated)

```javascript
// src/models/user.model.js
const userSchema = new Schema({
  username: String, // NEW
  email: { type: String, unique: true },
  password: String,
  phone: String, // NEW
  address: String, // NEW
  pincode: String, // NEW
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
```

### Vendor Model (Updated)

```javascript
// src/models/vendor.model.js
const vendorSchema = new Schema({
  CompanyName: String,
  email: { type: String, unique: true },
  password: String,
  phone: String, // NEW
  address: String, // NEW
  pincode: String, // NEW
  status: {
    // NEW
    type: String,
    enum: ["pending", "approved", "rejected", "suspended"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
```

---

## Error Handling

### Validation Errors

```javascript
// Profile Update Validation
const newErrors = {};

if (!username.trim()) newErrors.username = true;
if (!phone.trim() || !/^[0-9]{10}$/.test(phone)) newErrors.phone = true;
if (!address.trim()) newErrors.address = true;
if (!pincode.trim() || !/^[0-9]{5,6}$/.test(pincode)) newErrors.pincode = true;

if (Object.keys(newErrors).length > 0) {
  return res.status(400).json({
    message: "Validation failed",
    errors: newErrors,
  });
}
```

### Password Change Validation

```javascript
// Verify current password
const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
if (!isPasswordValid) {
  return res.status(400).json({
    message: "Current password is incorrect",
  });
}

// Validate new password
if (newPassword.length < 6) {
  return res.status(400).json({
    message: "Password must be at least 6 characters",
  });
}
```

---

## Security Features

### Password Hashing

```javascript
const hashedPassword = await bcrypt.hash(password, 10);
// 10 rounds of salting
```

### JWT Token Validation

```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET);
// Validates token signature and expiration
```

### HTTP-only Cookies

```javascript
res.cookie("token", token, {
  httpOnly: true, // Prevents XSS
  secure: false, // Set to true in production with HTTPS
  sameSite: "strict", // CSRF protection
});
```

### Input Sanitization

```javascript
// Using Mongoose validators
const userSchema = new Schema({
  email: {
    type: String,
    validate: {
      validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: "Invalid email",
    },
  },
});
```

---

## Testing Endpoints with cURL

### Get User Profile

```bash
curl -X GET http://localhost:3000/api/auth/user/profile \
  -H "Cookie: token=YOUR_TOKEN"
```

### Update User Profile

```bash
curl -X PUT http://localhost:3000/api/user/profile/update \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_TOKEN" \
  -d '{
    "username": "john_doe",
    "phone": "9876543210",
    "address": "123 Main St",
    "pincode": "100001"
  }'
```

### Get All Users (Admin)

```bash
curl -X GET "http://localhost:3000/api/user/admin/users?page=1&search=john" \
  -H "Cookie: token=ADMIN_TOKEN"
```

### Approve Vendor

```bash
curl -X PUT http://localhost:3000/api/user/admin/vendors/VENDOR_ID/status \
  -H "Content-Type: application/json" \
  -H "Cookie: token=ADMIN_TOKEN" \
  -d '{ "status": "approved" }'
```

### Get Dashboard Stats

```bash
curl -X GET http://localhost:3000/api/user/admin/dashboard/stats \
  -H "Cookie: token=ADMIN_TOKEN"
```

---

## Performance Optimization

### Pagination Benefits

- Reduces data transfer
- Faster response times
- Better memory usage
- Scalable to large datasets

### Indexing

```javascript
// Create index on email for faster searches
userSchema.index({ email: 1 });
vendorSchema.index({ email: 1 });

// Create index on status for filtering
vendorSchema.index({ status: 1 });
```

### Query Optimization

```javascript
// Select only needed fields
const users = await userModel
  .find(query)
  .select("-password") // Exclude password
  .skip(skip)
  .limit(limit)
  .sort({ createdAt: -1 });
```

---

## Logging & Debugging

### Enable Console Logging

```javascript
// In controllers
console.log("Fetching users with query:", query);
console.log("Number of results:", results.length);
console.log("Error:", error.message);
```

### MongoDB Connection Status

```bash
# Check MongoDB is running
mongosh
> show dbs
> use foodbacked
> db.users.count()  # Should show user count
```

---

## Deployment Checklist

- [ ] Set environment variables in `.env`
- [ ] Enable HTTPS in production
- [ ] Set `secure: true` in cookie options
- [ ] Configure CORS for production domain
- [ ] Set up proper logging
- [ ] Enable rate limiting
- [ ] Set up database backups
- [ ] Configure error monitoring (Sentry)
- [ ] Test all endpoints in production
- [ ] Set up API documentation (Swagger)

---

## Troubleshooting

### Issue: "Cannot find module 'user.controller.js'"

**Solution:** Ensure file exists in `/Backend/src/controllers/`

### Issue: Routes not working (404)

**Solution:** Verify routes registered in app.js:

```javascript
app.use("/api/user", userRoutes);
```

### Issue: Middleware not authenticating

**Solution:** Check token in cookies:

```bash
# In browser console
console.log(document.cookie);
```

### Issue: CORS error

**Solution:** Ensure CORS is configured:

```javascript
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
```

---

## Next Improvements

1. Add email notifications for vendor approvals
2. Implement real-time updates with WebSocket
3. Add audit logging for admin actions
4. Implement soft deletes instead of hard deletes
5. Add rate limiting for API endpoints
6. Implement caching for dashboard stats
7. Add API versioning (/api/v1/)
8. Set up automated tests
