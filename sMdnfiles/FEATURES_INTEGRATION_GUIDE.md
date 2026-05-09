# Feature Integration Guide - User & Vendor Management

## Overview

This guide explains how the user and vendor management features are integrated with the backend and how to use them effectively.

---

## Table of Contents

1. [User Profile Management](#user-profile-management)
2. [Admin User Management](#admin-user-management)
3. [Vendor Management](#vendor-management)
4. [Dashboard Statistics](#dashboard-statistics)
5. [Notifications System](#notifications-system)
6. [Integration Examples](#integration-examples)

---

## User Profile Management

### Features

- ✅ View user profile (username, email, phone, address, pincode)
- ✅ Update profile information
- ✅ Change password
- ✅ Secure authentication

### Frontend File: `UserProfilePage.jsx`

**Location:** `frontend/src/UserProfilePage.jsx`

**Key Components:**

- Profile display card
- Edit profile form with validation
- Password change form
- Real-time data fetching from API

### API Endpoints Used

| Endpoint                            | Method | Purpose                    |
| ----------------------------------- | ------ | -------------------------- |
| `/api/auth/user/profile`            | GET    | Fetch current user profile |
| `/api/user/profile/update`          | PUT    | Update profile information |
| `/api/user/profile/change-password` | POST   | Change user password       |

### How It Works

```jsx
// 1. Load profile on component mount
useEffect(() => {
  fetchUserProfile();
}, []);

// 2. Fetch user profile from API
const fetchUserProfile = async () => {
  const response = await axios.get(
    "http://localhost:3000/api/auth/user/profile",
    { withCredentials: true }
  );
  setUserData(response.data.user);
};

// 3. Update profile
const handleProfileSubmit = async (e) => {
  e.preventDefault();
  const response = await axios.put(
    "http://localhost:3000/api/user/profile/update",
    { username, phone, address, pincode },
    { withCredentials: true }
  );
  setUserData(response.data.user);
};

// 4. Change password
const handlePasswordSubmit = async (e) => {
  e.preventDefault();
  await axios.post(
    "http://localhost:3000/api/user/profile/change-password",
    { currentPassword, newPassword, confirmPassword },
    { withCredentials: true }
  );
};
```

### Validation Rules

**Profile Update:**

- Username: Required, string
- Phone: Required, 10 digits only
- Address: Required, string
- Pincode: Required, 5-6 digits

**Password Change:**

- Current Password: Required
- New Password: Minimum 6 characters
- Confirm Password: Must match new password

### Error Handling

```jsx
try {
  const response = await axios.put(
    "http://localhost:3000/api/user/profile/update",
    formData,
    { withCredentials: true }
  );
} catch (error) {
  if (error.response?.status === 401) {
    navigate("/login"); // Redirect if unauthorized
  } else {
    alert(error.response?.data?.message);
  }
}
```

---

## Admin User Management

### Features

- ✅ View all users with pagination
- ✅ Search users by name, email, or phone
- ✅ View individual user details
- ✅ Delete users (admin only)

### Frontend File: `ViewPage.jsx`

**Location:** `frontend/src/ViewPage.jsx`

### API Endpoints Used

| Endpoint                    | Method | Purpose                   |
| --------------------------- | ------ | ------------------------- |
| `/api/user/admin/users`     | GET    | Get all users (paginated) |
| `/api/user/admin/users/:id` | GET    | Get specific user         |
| `/api/user/admin/users/:id` | DELETE | Delete user               |

### Query Parameters

```javascript
// Get users with pagination and search
GET /api/user/admin/users?page=1&limit=10&search=john

// Response includes:
{
  "users": [...],
  "pagination": {
    "total": 245,
    "pages": 25,
    "currentPage": 1
  }
}
```

### Implementation Example

```jsx
const [users, setUsers] = useState([]);
const [userPage, setUserPage] = useState(1);
const [userSearch, setUserSearch] = useState("");

useEffect(() => {
  fetchData();
}, [userPage, userSearch]);

const fetchData = async () => {
  const response = await axios.get(
    `http://localhost:3000/api/user/admin/users?page=${userPage}&search=${userSearch}`,
    { withCredentials: true }
  );
  setUsers(response.data.users);
};
```

---

## Vendor Management

### Features

- ✅ View all vendors with pagination
- ✅ View pending vendors for approval
- ✅ Approve or reject vendors
- ✅ Search vendors
- ✅ Filter by status (pending, approved, rejected, suspended)

### Frontend Files

**View All Vendors:** `ViewPage.jsx` (Users section on admin dashboard)
**Approve Vendors:** `ReviewPage.jsx`

### API Endpoints Used

| Endpoint                             | Method | Purpose              |
| ------------------------------------ | ------ | -------------------- |
| `/api/user/admin/vendors`            | GET    | Get all vendors      |
| `/api/user/admin/vendors/:id`        | GET    | Get specific vendor  |
| `/api/user/admin/vendors/:id/status` | PUT    | Update vendor status |
| `/api/user/admin/vendors/:id`        | DELETE | Delete vendor        |

### Vendor Status Flow

```
Pending → Approved
       → Rejected
       → Suspended
```

### Update Vendor Status Example

```jsx
const approveVendor = async (vendorId) => {
  try {
    await axios.put(
      `http://localhost:3000/api/user/admin/vendors/${vendorId}/status`,
      { status: "approved" },
      { withCredentials: true }
    );
    alert("Vendor approved!");
    fetchPendingVendors();
  } catch (err) {
    alert("Failed to approve vendor");
  }
};
```

### ReviewPage.jsx Implementation

```jsx
const fetchPendingVendors = async () => {
  const response = await axios.get(
    "http://localhost:3000/api/user/admin/vendors?status=pending",
    { withCredentials: true }
  );
  setVendors(response.data.vendors);
};

// Display table with approve/reject buttons
vendors.map((vendor) => (
  <tr key={vendor._id}>
    <td>{vendor.CompanyName}</td>
    <td>{vendor.email}</td>
    <td>
      <button onClick={() => approveVendor(vendor._id)}>Approve</button>
      <button onClick={() => rejectVendor(vendor._id)}>Reject</button>
    </td>
  </tr>
));
```

---

## Dashboard Statistics

### Features

- ✅ Total user count
- ✅ Total vendor count
- ✅ Approved vendor count
- ✅ Pending vendor count
- ✅ Recent users list
- ✅ Recent vendors list

### Frontend File: `FullReportPage.jsx`

**Location:** `frontend/src/FullReportPage.jsx`

### API Endpoint

```
GET /api/user/admin/dashboard/stats
Authentication: Required (Admin only)
```

### Response Format

```javascript
{
  "message": "Dashboard statistics retrieved",
  "statistics": {
    "totalUsers": 1245,
    "totalVendors": 86,
    "approvedVendors": 73,
    "pendingVendors": 13,
    "recentUsers": [
      {
        "_id": "...",
        "username": "john_doe",
        "email": "john@example.com"
      },
      // ... 4 more
    ],
    "recentVendors": [
      {
        "_id": "...",
        "CompanyName": "FoodHub",
        "email": "vendor@foodhub.com"
      },
      // ... 4 more
    ]
  }
}
```

### Display Example

```jsx
const [stats, setStats] = useState(null);

useEffect(() => {
  fetchDashboardStats();
}, []);

const fetchDashboardStats = async () => {
  const response = await axios.get(
    "http://localhost:3000/api/user/admin/dashboard/stats",
    { withCredentials: true }
  );
  setStats(response.data.statistics);
};

// Display stats
<div className="grid grid-cols-4 gap-4">
  <StatCard title="Total Users" value={stats.totalUsers} />
  <StatCard title="Total Vendors" value={stats.totalVendors} />
  <StatCard title="Approved" value={stats.approvedVendors} />
  <StatCard title="Pending" value={stats.pendingVendors} />
</div>;
```

---

## Notifications System

### Features

- ✅ Real-time notification feed
- ✅ Filter by notification type
- ✅ Mark as read functionality
- ✅ Timestamp formatting
- ✅ Icon support by type

### Frontend File: `notification.jsx`

**Location:** `frontend/src/notification.jsx`

### API Endpoints Used

| Endpoint                           | Method | Purpose           |
| ---------------------------------- | ------ | ----------------- |
| `/api/user/notifications`          | GET    | Get notifications |
| `/api/user/notifications/:id/read` | POST   | Mark as read      |

### Query Parameters

```javascript
GET /api/user/notifications?type=all&limit=20

// Available types:
// - "all" (default)
// - "vendor_registration"
// - "user_registration"
// - "system_alert"
// - "vendor_approval"
```

### Notification Types

| Type                | Icon | Description              |
| ------------------- | ---- | ------------------------ |
| vendor_registration | 🏪   | New vendor registered    |
| user_registration   | 👤   | New user joined          |
| system_alert        | ⚙    | System maintenance       |
| vendor_approval     | ✅   | Vendor approved/rejected |

### Implementation

```jsx
const [notifications, setNotifications] = useState([]);
const [filter, setFilter] = useState("all");

useEffect(() => {
  fetchNotifications();
}, [filter]);

const fetchNotifications = async () => {
  const response = await axios.get(
    `http://localhost:3000/api/user/notifications?type=${filter}&limit=20`,
    { withCredentials: true }
  );
  setNotifications(response.data.notifications);
};

const getIcon = (type) => {
  const icons = {
    vendor_registration: "🏪",
    user_registration: "👤",
    system_alert: "⚙",
    vendor_approval: "✅",
  };
  return icons[type] || "📬";
};
```

### Notification Display

```jsx
notifications.map((notif) => (
  <div key={notif.id} className="notification-item">
    <span>{getIcon(notif.type)}</span>
    <p>{notif.message}</p>
    <small>{formatTime(notif.timestamp)}</small>
  </div>
));
```

---

## Integration Examples

### Complete User Profile Management Flow

```jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  // 2. Fetch profile
  const loadProfile = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/auth/user/profile",
        { withCredentials: true }
      );
      setUser(res.data.user);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. Update profile
  const updateProfile = async (formData) => {
    try {
      await axios.put(
        "http://localhost:3000/api/user/profile/update",
        formData,
        { withCredentials: true }
      );
      loadProfile(); // Refresh data
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{user.username}</h1>
      <p>{user.email}</p>
      <button onClick={() => updateProfile(newData)}>Update Profile</button>
    </div>
  );
}
```

### Admin Vendor Approval Workflow

```jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

function VendorApproval() {
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    loadPendingVendors();
  }, []);

  const loadPendingVendors = async () => {
    const res = await axios.get(
      "http://localhost:3000/api/user/admin/vendors?status=pending",
      { withCredentials: true }
    );
    setVendors(res.data.vendors);
  };

  const handleApproval = async (vendorId, status) => {
    try {
      await axios.put(
        `http://localhost:3000/api/user/admin/vendors/${vendorId}/status`,
        { status },
        { withCredentials: true }
      );
      loadPendingVendors(); // Refresh list
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div>
      <h2>Pending Vendor Approvals</h2>
      {vendors.map((vendor) => (
        <div key={vendor._id}>
          <h3>{vendor.CompanyName}</h3>
          <button onClick={() => handleApproval(vendor._id, "approved")}>
            Approve
          </button>
          <button onClick={() => handleApproval(vendor._id, "rejected")}>
            Reject
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Common Errors and Solutions

### Error: "Unauthorized: please login first"

**Cause:** Token missing or expired
**Solution:** Ensure `withCredentials: true` is set in axios requests

### Error: "All fields are required"

**Cause:** Missing required fields in request
**Solution:** Validate form fields before submission

### Error: "Current password is incorrect"

**Cause:** Wrong current password provided
**Solution:** Verify current password before attempting change

### Error: CORS Error

**Cause:** Frontend and backend on different ports
**Solution:** CORS is already configured in app.js for localhost:5173

---

## Performance Optimization

### Pagination Best Practices

```javascript
// Load data in pages instead of all at once
const [page, setPage] = useState(1);
const [limit] = useState(10);

useEffect(() => {
  fetchUsers(page, limit);
}, [page]);

// Only fetch on page change
```

### Search Optimization

```javascript
// Debounce search to reduce API calls
const [search, setSearch] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 300);
  return () => clearTimeout(timer);
}, [search]);

useEffect(() => {
  if (debouncedSearch) {
    searchUsers(debouncedSearch);
  }
}, [debouncedSearch]);
```

---

## Security Considerations

1. **HTTP-only Cookies:** Tokens are stored in HTTP-only cookies (XSS protection)
2. **CSRF Protection:** Use CORS with credentials
3. **Password Hashing:** All passwords hashed with bcryptjs (10 rounds)
4. **Validation:** Both client-side and server-side validation
5. **Authorization:** Admin endpoints require admin token

---

## Testing

### Manual Testing Checklist

- [ ] User profile loads on mount
- [ ] Profile update saves to database
- [ ] Password change works correctly
- [ ] Search filters users correctly
- [ ] Pagination navigates correctly
- [ ] Vendor approval updates status
- [ ] Notifications display correctly
- [ ] Logout clears token and redirects

---

## Next Steps

1. Add email verification for new registrations
2. Implement real-time notifications with WebSocket
3. Add file upload for vendor documents
4. Implement order management system
5. Add payment gateway integration
