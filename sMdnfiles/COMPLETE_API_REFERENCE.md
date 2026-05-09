# Complete API Reference - Foodbacked

## Overview

This document provides a complete reference for all API endpoints in the Foodbacked application, including newly integrated endpoints for user management, vendor management, notifications, and admin dashboard.

---

## Base Configuration

**Base URL:** `http://localhost:3000`
**API Prefix:** `/api`

### Authentication

- JWT tokens are used for authentication
- Tokens are stored in HTTP-only cookies
- Include `withCredentials: true` in Axios requests to send cookies automatically
- Token is required for protected endpoints (marked with 🔒)

---

## 1. AUTHENTICATION ENDPOINTS

### Base URL: `/api/auth`

#### User Registration

**Endpoint:** `POST /user/register`
**Authentication:** ❌ Not required
**Description:** Register a new user account

```javascript
// Request
POST /api/auth/user/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "9876543210",
  "address": "123 Main St, City",
  "pincode": "100001"
}

// Response (201 Created)
{
  "message": "User registered successfully",
  "user": {
    "id": "63f1b2c3d4e5f6g7h8i9j0k1",
    "username": "john_doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "address": "123 Main St, City",
    "pincode": "100001"
  }
}

// Error Response (400)
{
  "message": "user already Exist"
}
```

#### User Login

**Endpoint:** `POST /user/login`
**Authentication:** ❌ Not required
**Description:** Login user and generate JWT token

```javascript
// Request
POST /api/auth/user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

// Response (200 OK)
{
  "message": "User Logged in successfully",
  "user": {
    "id": "63f1b2c3d4e5f6g7h8i9j0k1",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
// Cookie Set: token=<JWT_TOKEN>

// Error Response (400)
{
  "message": "invalid email or Password"
}
```

#### User Logout

**Endpoint:** `GET /user/logout`
**Authentication:** 🔒 Required (User)
**Description:** Logout user and clear session

```javascript
// Request
GET /api/auth/user/logout
Cookie: token=<JWT_TOKEN>

// Response (200)
{
  "message": "User logout successfully"
}
```

#### Get User Profile

**Endpoint:** `GET /user/profile`
**Authentication:** 🔒 Required (User)
**Description:** Get authenticated user's profile data

```javascript
// Request
GET /api/auth/user/profile
Cookie: token=<JWT_TOKEN>

// Response (200)
{
  "user": {
    "id": "63f1b2c3d4e5f6g7h8i9j0k1",
    "username": "john_doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "address": "123 Main St, City",
    "pincode": "100001"
  }
}

// Error Response (401)
{
  "message": "Unauthorized: please login first"
}
```

#### Vendor Registration

**Endpoint:** `POST /vendor/register`
**Authentication:** ❌ Not required
**Description:** Register a new vendor account

```javascript
// Request
POST /api/auth/vendor/register
Content-Type: application/json

{
  "CompanyName": "FoodHub Restaurant",
  "email": "vendor@foodhub.com",
  "password": "VendorPass@123",
  "phone": "9876543210",
  "address": "456 Business Park, City",
  "pincode": "100002"
}

// Response (201)
{
  "message": "Vendor registered successfully",
  "vendor": {
    "id": "63f1b2c3d4e5f6g7h8i9j0k2",
    "CompanyName": "FoodHub Restaurant",
    "email": "vendor@foodhub.com",
    "phone": "9876543210",
    "address": "456 Business Park, City",
    "pincode": "100002"
  }
}
```

#### Vendor Login

**Endpoint:** `POST /vendor/login`
**Authentication:** ❌ Not required

```javascript
// Request
POST /api/auth/vendor/login

{
  "email": "vendor@foodhub.com",
  "password": "VendorPass@123"
}

// Response (200)
{
  "message": "Vendor Logged in successfully",
  "vendor": {
    "id": "63f1b2c3d4e5f6g7h8i9j0k2",
    "CompanyName": "FoodHub Restaurant",
    "email": "vendor@foodhub.com"
  }
}
```

#### Vendor Logout

**Endpoint:** `GET /vendor/logout`
**Authentication:** 🔒 Required (Vendor)

#### Get Vendor Profile

**Endpoint:** `GET /vendor/profile`
**Authentication:** 🔒 Required (Vendor)

```javascript
// Request
GET /api/auth/vendor/profile
Cookie: token=<JWT_TOKEN>

// Response (200)
{
  "vendor": {
    "id": "63f1b2c3d4e5f6g7h8i9j0k2",
    "CompanyName": "FoodHub Restaurant",
    "email": "vendor@foodhub.com",
    "phone": "9876543210",
    "address": "456 Business Park, City",
    "pincode": "100002"
  }
}
```

#### Admin Registration

**Endpoint:** `POST /admin/register`
**Authentication:** ❌ Not required

#### Admin Login

**Endpoint:** `POST /admin/login`
**Authentication:** ❌ Not required

#### Admin Logout

**Endpoint:** `GET /admin/logout`
**Authentication:** 🔒 Required (Admin)

#### Get Admin Profile

**Endpoint:** `GET /admin/profile`
**Authentication:** 🔒 Required (Admin)

---

## 2. USER MANAGEMENT ENDPOINTS

### Base URL: `/api/user`

#### Update User Profile

**Endpoint:** `PUT /profile/update`
**Authentication:** 🔒 Required (User)
**Description:** Update user profile information

```javascript
// Request
PUT /api/user/profile/update
Cookie: token=<JWT_TOKEN>
Content-Type: application/json

{
  "username": "john_doe_updated",
  "phone": "9876543211",
  "address": "789 New Street, City",
  "pincode": "100003"
}

// Response (200)
{
  "message": "Profile updated successfully",
  "user": {
    "id": "63f1b2c3d4e5f6g7h8i9j0k1",
    "username": "john_doe_updated",
    "email": "john@example.com",
    "phone": "9876543211",
    "address": "789 New Street, City",
    "pincode": "100003"
  }
}

// Error Response (400)
{
  "message": "All fields are required"
}
```

#### Change User Password

**Endpoint:** `POST /profile/change-password`
**Authentication:** 🔒 Required (User)
**Description:** Change user password

```javascript
// Request
POST /api/user/profile/change-password
Cookie: token=<JWT_TOKEN>
Content-Type: application/json

{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456",
  "confirmPassword": "NewPass456"
}

// Response (200)
{
  "message": "Password changed successfully"
}

// Error Response (400)
{
  "message": "Current password is incorrect"
}
```

#### Get All Users (Admin)

**Endpoint:** `GET /admin/users`
**Authentication:** 🔒 Required (Admin)
**Description:** Get paginated list of all users with search capability

```javascript
// Request
GET /api/user/admin/users?page=1&limit=10&search=john
Cookie: token=<JWT_TOKEN>

// Response (200)
{
  "message": "Users retrieved successfully",
  "users": [
    {
      "_id": "63f1b2c3d4e5f6g7h8i9j0k1",
      "username": "john_doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "address": "123 Main St, City",
      "pincode": "100001",
      "createdAt": "2025-01-15T10:30:00Z"
    }
    // ... more users
  ],
  "pagination": {
    "total": 245,
    "pages": 25,
    "currentPage": 1
  }
}
```

#### Get User by ID (Admin)

**Endpoint:** `GET /admin/users/:id`
**Authentication:** 🔒 Required (Admin)

```javascript
// Request
GET /api/user/admin/users/63f1b2c3d4e5f6g7h8i9j0k1
Cookie: token=<JWT_TOKEN>

// Response (200)
{
  "message": "User retrieved successfully",
  "user": {
    "_id": "63f1b2c3d4e5f6g7h8i9j0k1",
    "username": "john_doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "address": "123 Main St, City",
    "pincode": "100001"
  }
}
```

#### Delete User (Admin)

**Endpoint:** `DELETE /admin/users/:id`
**Authentication:** 🔒 Required (Admin)

```javascript
// Response (200)
{
  "message": "User deleted successfully"
}
```

---

## 3. VENDOR MANAGEMENT ENDPOINTS

### Base URL: `/api/user`

#### Get All Vendors (Admin)

**Endpoint:** `GET /admin/vendors`
**Authentication:** 🔒 Required (Admin)
**Description:** Get paginated list of vendors with filtering

```javascript
// Request
GET /api/user/admin/vendors?page=1&limit=10&search=FoodHub&status=pending
Cookie: token=<JWT_TOKEN>

// Response (200)
{
  "message": "Vendors retrieved successfully",
  "vendors": [
    {
      "_id": "63f1b2c3d4e5f6g7h8i9j0k2",
      "CompanyName": "FoodHub Restaurant",
      "email": "vendor@foodhub.com",
      "phone": "9876543210",
      "address": "456 Business Park, City",
      "pincode": "100002",
      "status": "pending"
    }
    // ... more vendors
  ],
  "pagination": {
    "total": 86,
    "pages": 9,
    "currentPage": 1
  }
}
```

#### Get Vendor by ID (Admin)

**Endpoint:** `GET /admin/vendors/:id`
**Authentication:** 🔒 Required (Admin)

#### Update Vendor Status (Admin)

**Endpoint:** `PUT /admin/vendors/:id/status`
**Authentication:** 🔒 Required (Admin)
**Description:** Approve, reject, or suspend vendor

```javascript
// Request
PUT /api/user/admin/vendors/63f1b2c3d4e5f6g7h8i9j0k2/status
Cookie: token=<JWT_TOKEN>
Content-Type: application/json

{
  "status": "approved"
  // Options: "pending", "approved", "rejected", "suspended"
}

// Response (200)
{
  "message": "Vendor status updated to approved",
  "vendor": {
    "_id": "63f1b2c3d4e5f6g7h8i9j0k2",
    "CompanyName": "FoodHub Restaurant",
    "email": "vendor@foodhub.com",
    "phone": "9876543210",
    "address": "456 Business Park, City",
    "pincode": "100002",
    "status": "approved"
  }
}
```

#### Delete Vendor (Admin)

**Endpoint:** `DELETE /admin/vendors/:id`
**Authentication:** 🔒 Required (Admin)

---

## 4. ADMIN DASHBOARD ENDPOINTS

### Base URL: `/api/user`

#### Get Dashboard Statistics

**Endpoint:** `GET /admin/dashboard/stats`
**Authentication:** 🔒 Required (Admin)
**Description:** Get system statistics including user and vendor counts

```javascript
// Request
GET /api/user/admin/dashboard/stats
Cookie: token=<JWT_TOKEN>

// Response (200)
{
  "message": "Dashboard statistics retrieved",
  "statistics": {
    "totalUsers": 1245,
    "totalVendors": 86,
    "approvedVendors": 73,
    "pendingVendors": 13,
    "recentUsers": [
      {
        "_id": "63f1b2c3d4e5f6g7h8i9j0k1",
        "username": "john_doe",
        "email": "john@example.com"
      }
      // ... 4 more recent users
    ],
    "recentVendors": [
      {
        "_id": "63f1b2c3d4e5f6g7h8i9j0k2",
        "CompanyName": "FoodHub Restaurant",
        "email": "vendor@foodhub.com"
      }
      // ... 4 more recent vendors
    ]
  }
}
```

---

## 5. NOTIFICATIONS ENDPOINTS

### Base URL: `/api/user`

#### Get Notifications

**Endpoint:** `GET /notifications`
**Authentication:** 🔒 Required (Any user)
**Description:** Get paginated list of notifications with type filtering

```javascript
// Request
GET /api/user/notifications?type=all&limit=20
// Types: "all", "vendor_registration", "user_registration", "system_alert", "vendor_approval"
Cookie: token=<JWT_TOKEN>

// Response (200)
{
  "message": "Notifications retrieved",
  "notifications": [
    {
      "id": 1,
      "type": "vendor_registration",
      "message": "New vendor registration: FoodHub Restaurant",
      "timestamp": "2025-01-15T10:30:00Z",
      "read": false
    },
    {
      "id": 2,
      "type": "user_registration",
      "message": "3 new user registrations today",
      "timestamp": "2025-01-15T09:15:00Z",
      "read": false
    },
    {
      "id": 3,
      "type": "system_alert",
      "message": "System backup completed successfully",
      "timestamp": "2025-01-14T23:00:00Z",
      "read": true
    }
    // ... more notifications
  ]
}
```

#### Mark Notification as Read

**Endpoint:** `POST /notifications/:id/read`
**Authentication:** 🔒 Required (Any user)
**Description:** Mark a notification as read

```javascript
// Request
POST /api/user/notifications/1/read
Cookie: token=<JWT_TOKEN>

// Response (200)
{
  "message": "Notification marked as read"
}
```

---

## Error Responses

### Standard Error Codes

| Status | Error Message                      | Description                |
| ------ | ---------------------------------- | -------------------------- |
| 400    | "All fields are required"          | Missing required fields    |
| 400    | "user already Exist"               | Email already registered   |
| 400    | "invalid email or Password"        | Wrong credentials          |
| 401    | "Unauthorized: please login first" | Missing or invalid token   |
| 401    | "Unauthorized: Invalid token"      | Token expired or malformed |
| 404    | "User not found"                   | User ID doesn't exist      |
| 404    | "Vendor not found"                 | Vendor ID doesn't exist    |
| 500    | "Error updating profile"           | Server error               |

### Error Response Format

```javascript
{
  "message": "Error description",
  "error": "Detailed error message (if available)"
}
```

---

## Query Parameters

### Pagination

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Filtering

- `search`: Search in username, email, or phone
- `status`: Filter vendors by status (pending, approved, rejected, suspended)
- `type`: Filter notifications by type

### Example

```
GET /api/user/admin/users?page=2&limit=20&search=john
GET /api/user/admin/vendors?status=pending
GET /api/user/notifications?type=vendor_registration&limit=15
```

---

## Frontend Integration Examples

### Using Axios

```javascript
import axios from "axios";

// Create instance with credentials
const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

// Get user profile
api
  .get("/api/auth/user/profile")
  .then((res) => console.log(res.data.user))
  .catch((err) => console.error(err.response.data.message));

// Update profile
api
  .put("/api/user/profile/update", {
    username: "new_name",
    phone: "9876543210",
    address: "789 New St",
    pincode: "100003",
  })
  .then((res) => console.log("Updated"))
  .catch((err) => console.error("Error"));

// Get all users
api
  .get("/api/user/admin/users?page=1&search=john")
  .then((res) => console.log(res.data.users))
  .catch((err) => console.error(err));
```

### Using Fetch API

```javascript
// Login
fetch("http://localhost:3000/api/auth/user/login", {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "john@example.com",
    password: "SecurePass123",
  }),
})
  .then((res) => res.json())
  .then((data) => console.log(data));

// Get profile
fetch("http://localhost:3000/api/auth/user/profile", {
  credentials: "include",
})
  .then((res) => res.json())
  .then((data) => console.log(data.user));
```

---

## Status Codes Reference

| Code | Meaning                            |
| ---- | ---------------------------------- |
| 200  | OK - Request successful            |
| 201  | Created - Resource created         |
| 400  | Bad Request - Invalid data         |
| 401  | Unauthorized - Auth required       |
| 404  | Not Found - Resource doesn't exist |
| 500  | Server Error - Internal error      |

---

## Swagger/OpenAPI Support

All endpoints are documented and can be integrated with Swagger for interactive API documentation. See SWAGGER_SETUP.md for details.
