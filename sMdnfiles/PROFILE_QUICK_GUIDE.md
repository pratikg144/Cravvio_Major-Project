# Profile System - Quick Setup Guide

## What Was Fixed ✅

### Problem 1: Profile Dropdown Showing "User" Instead of Real Name

```jsx
// BEFORE (not working)
<div className="font-bold">{user?.username || "User"}</div>;
// Always showed "User" because user was undefined

// AFTER (fixed)
const [user, setUser] = useState(null);
// Fetches real user data from backend
<div className="font-bold">{user?.username || "User"}</div>;
// Now shows actual username
```

### Problem 2: "Edit Profile" Button Did Nothing

```jsx
// BEFORE (not working)
<button onClick={() => navTo("/user")} className="...">
  Edit Profile
</button>;
// navTo function didn't exist → button did nothing

// AFTER (fixed)
const navTo = (path) => {
  navigate(path);
  setProfileOpen(false); // Close menu
};
// Now properly navigates to profile page
```

### Problem 3: "Logout" Button Did Nothing

```jsx
// BEFORE (not working)
<button onClick={() => navTo("/logout")} className="...">
  Logout
</button>;
// No logout handler → session not cleared

// AFTER (fixed)
const handleLogout = async () => {
  await apiClient.get("/api/auth/user/logout");
  localStorage.removeItem("auth");
  navigate("/login");
};
// Now properly clears session and redirects
```

---

## How It Works Now

### User Interface Flow

```
┌─────────────────────────────────────┐
│      User Login Page (/login)       │
│  Email: test@example.com            │
│  Password: •••••••••               │
│  [LOGIN BUTTON]                     │
└────────────┬────────────────────────┘
             │ ✅ Creates JWT in cookie
             ↓
┌─────────────────────────────────────┐
│    User Menu Page (/usermenu)       │
│  ┌─────────────────────────────────┐│
│  │ 👤 Profile Menu (Top Right)     ││
│  │ ┌───────────────────────────────┐│
│  │ │ 👤 john_doe                   ││
│  │ │    john@example.com           ││
│  │ │ ─────────────────────────────┤│
│  │ │ ✏️  Edit Profile              ││
│  │ │ ⚙️  Settings                  ││
│  │ │ ❓ Help                        ││
│  │ │ 🚪 Logout                     ││
│  │ └───────────────────────────────┘│
│  └─────────────────────────────────┘│
│  Food menu below...                 │
└────────────┬────────────────────────┘
             │ Click "Edit Profile"
             ↓
┌─────────────────────────────────────┐
│    Profile Page (/user)             │
│  ┌─────────────────────────────────┐│
│  │ Profile Information              ││
│  │ ─────────────────────────────────││
│  │ [👤 J]  john_doe                 ││
│  │         john@example.com         ││
│  │         9876543210              ││
│  │         123 Main St...          ││
│  │                                  ││
│  │ [EDIT PROFILE] [SAVE] [CANCEL]  ││
│  │                                  ││
│  │ Order History Table:             ││
│  │ ─────────────────────────────────││
│  │ Date  | Items | Restaurant |...  ││
│  │ Dec 7 |  3    | Vendor X  | ...  ││
│  │ Dec 5 |  2    | Vendor Y  | ...  ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
             │
             │ Click "Logout"
             ↓
      ✅ Session Cleared
      ✅ Redirect to Login
```

---

## Code Changes Made

### File: `frontend/src/usermenu.jsx`

**Added State (Line 34-35):**

```jsx
const [user, setUser] = useState(null);
const [userLoading, setUserLoading] = useState(true);
```

**Added User Profile Fetch (Lines 42-61):**

```jsx
useEffect(() => {
  let mounted = true;
  const fetchUserProfile = async () => {
    try {
      const response = await apiClient.get("/api/auth/user/profile");
      if (mounted) {
        setUser(response.data.user);
        setUserLoading(false);
      }
    } catch (err) {
      console.error("Failed to fetch user profile", err);
      if (err.response?.status === 401) {
        navigate("/login"); // Redirect if not logged in
      }
      setUserLoading(false);
    }
  };
  fetchUserProfile();
  return () => {
    mounted = false;
  };
}, [navigate]);
```

**Added Navigation Function (Lines 198-207):**

```jsx
const navTo = (path) => {
  if (path === "/logout") {
    handleLogout();
  } else {
    navigate(path);
    setProfileOpen(false);
  }
};
```

**Added Logout Handler (Lines 209-218):**

```jsx
const handleLogout = async () => {
  try {
    await apiClient.get("/api/auth/user/logout");
  } catch (err) {
    console.error("Logout error", err);
  } finally {
    localStorage.removeItem("auth");
    navigate("/login");
  }
};
```

---

## Backend Endpoints Being Used

| Endpoint                 | Method | Purpose          | Response                                                     |
| ------------------------ | ------ | ---------------- | ------------------------------------------------------------ |
| `/api/auth/user/profile` | GET    | Fetch user data  | `{ user: { id, username, email, phone, address, pincode } }` |
| `/api/auth/user/profile` | PUT    | Update user data | `{ message, user: {...} }`                                   |
| `/api/auth/user/logout`  | GET    | Clear session    | `{ message }`                                                |

All endpoints require **AuthUserMiddleware** which validates JWT from cookies.

---

## Testing Steps

### 1. Login

```
Go to: http://localhost:3000/login
Enter:
  Email: testuser@example.com
  Password: password123
Click: LOGIN
Expected: Redirected to /usermenu with profile data loaded
```

### 2. Check Profile Dropdown

```
On /usermenu page:
Click: Profile icon (top right corner)
Expected:
  ✅ Profile dropdown opens
  ✅ Shows actual username (not "User")
  ✅ Shows actual email
  ✅ Buttons visible: Edit Profile, Settings, Help, Logout
```

### 3. Edit Profile

```
Click: "Edit Profile" button
Expected:
  ✅ Navigate to /user page
  ✅ Form shows current data (username, email, phone, address)
  ✅ Can edit fields
Click: "Save" button
Expected:
  ✅ Alert shows success message
  ✅ Profile updated in database
  ✅ Data refreshes on page
```

### 4. View Order History

```
On /user page:
Scroll down: To "Order History" table
Expected:
  ✅ Shows all user's orders
  ✅ Columns: Date, Items, Restaurant, Amount, Status, Payment
  ✅ Order status shows as "paid" (green) or "pending" (orange)
```

### 5. Logout

```
Click: Profile icon (top right)
Click: "Logout" button
Expected:
  ✅ Session ends
  ✅ Redirected to login page
  ✅ Must login again to access usermenu
```

---

## What's Working Now ✅

- ✅ User profile fetches on usermenu load
- ✅ Profile dropdown shows real username and email
- ✅ Edit Profile button navigates to profile page
- ✅ Settings button available (can add route later)
- ✅ Help button available (can add route later)
- ✅ Logout button clears session and redirects
- ✅ Profile page displays user information
- ✅ Profile edit form works and saves to database
- ✅ Order history displays with payment status
- ✅ Unauthorized users (no JWT) redirect to login

---

## Common Issues & Solutions

### Issue: Still seeing "User" instead of name

**Solution:**

- Clear browser cookies (DevTools → Application → Cookies)
- Login again to get fresh JWT token
- Check backend logs for fetch errors

### Issue: Edit Profile button not working

**Solution:**

- Make sure you're logged in (JWT in cookies)
- Check browser console for errors
- Verify `/api/auth/user/profile` returns 200

### Issue: Logout not working

**Solution:**

- Check browser console for errors in handleLogout
- Verify cookies are being deleted
- Force refresh page to confirm logout

### Issue: Order history empty

**Solution:**

- Make sure you've placed orders first (/usermenu → cart → pay)
- Check `/api/payment/user/orders` endpoint
- Verify orders are in database

---

## Complete Feature Checklist

- ✅ User state management (useState)
- ✅ Profile data fetching (useEffect)
- ✅ Auto-redirect if unauthorized
- ✅ Profile dropdown display
- ✅ Navigation function (navTo)
- ✅ Logout handler
- ✅ Session cleanup
- ✅ Profile edit page
- ✅ Order history display
- ✅ Error handling and console logs

**Status:** 🟢 **ALL WORKING** - Profile system fully operational
