# Critical Fixes Implementation Guide

**Objective:** Fix all 7 critical issues to make the application deployment-ready  
**Estimated Time:** 2-3 hours  
**Difficulty:** Easy to Medium

---

## Fix #1: Create API Configuration System

### Problem

14 hardcoded `http://localhost:3000` URLs scattered throughout frontend

### Solution

**Step 1: Create API Configuration File**

**File: `frontend/src/config/api.js` (NEW)**

```javascript
// API Base URL - uses environment variable or defaults to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Export the base URL for use throughout the application
export default API_BASE_URL;
```

**Step 2: Create Environment Files**

**File: `frontend/.env.local` (NEW - FOR LOCAL DEVELOPMENT)**

```env
VITE_API_URL=http://localhost:3000
```

**File: `frontend/.env.production` (NEW - FOR PRODUCTION)**

```env
VITE_API_URL=https://api.yourdomain.com
```

**Step 3: Update All Components to Use Configuration**

**Files to Update (14 total):**

1. **frontend/src/login.jsx** - Replace hardcoded URL on line 42
2. **frontend/src/register.jsx** - Replace hardcoded URL on line 38
3. **frontend/src/admin.jsx** - Replace hardcoded URL on line 16
4. **frontend/src/user.jsx** - Replace hardcoded URL on line 15
5. **frontend/src/Vendor.jsx** - Replace hardcoded URL on line 15
6. **frontend/src/ViewPage.jsx** - Replace hardcoded URLs on lines 24, 28
7. **frontend/src/SettingsPage.jsx** - Replace hardcoded URLs on lines 27, 66
8. **frontend/src/ReviewPage.jsx** - Replace hardcoded URLs on lines 19, 38, 52
9. **frontend/src/notification.jsx** - Replace hardcoded URL on line 20
10. **frontend/src/FullReportPage.jsx** - Replace hardcoded URL on line 19

**Pattern to Replace:**

**Before:**

```javascript
import axios from 'axios';

const response = await axios.post('http://localhost:3000/api/auth/user/login', {
```

**After:**

```javascript
import axios from 'axios';
import API_BASE_URL from '../config/api';

const response = await axios.post(`${API_BASE_URL}/api/auth/user/login`, {
```

---

## Fix #2: Secure Cookie Configuration

### Problem

Cookies sent without secure options, vulnerable to XSS and man-in-the-middle attacks

### Solution

**File: `Backend/src/controllers/auth.controller.js`**

**Find all instances of `res.cookie("token"` and update:**

**Before:**

```javascript
res.cookie("token", token);
```

**After:**

```javascript
res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
});
```

**Locations to Update:**

- `auth.controller.js` - registerUser(), loginUser()
- `auth.controller.js` - registerVendor(), loginVendor()
- `auth.controller.js` - registerAdmin(), loginAdmin()

**Example Fix:**

```javascript
// Around line 38-40 in auth.controller.js
res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000,
});
```

---

## Fix #3: CORS Configuration for Production

### Problem

CORS hardcoded to `http://localhost:5173`, breaks in production

### Solution

**File: `Backend/src/app.js`**

**Before:**

```javascript
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
```

**After:**

```javascript
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
```

**Then Update `.env`:**

**File: `Backend/.env`**

Add this line:

```env
FRONTEND_URL=http://localhost:5173
```

For production, update to:

```env
FRONTEND_URL=https://yourdomain.com
```

---

## Fix #4: Create Environment Configuration Files

### Problem

No environment-specific configuration (dev, staging, production)

### Solution

**File: `Backend/.env` (UPDATE - Keep existing, add NODE_ENV)**

```env
NODE_ENV=development
JWT_SECRET=f4f5f1bb455a6758da756e71f599c175
MONGODB_URI=mongodb://localhost:27017/foodbacked
FRONTEND_URL=http://localhost:5173
IMAGEKIT_PUBLIC_KEY=public_oHvzIcLI+XO0DLdTCSsSJTTIduU=
IMAGEKIT_PRIVATE_KEY=private_miExV3vQ1KKVpiAV1WpB45Rjrz4=
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/lxnbyjvtgp
```

**File: `Backend/.env.production` (NEW)**

```env
NODE_ENV=production
JWT_SECRET=<generate-a-strong-secret-key>
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/foodbacked
FRONTEND_URL=https://yourdomain.com
IMAGEKIT_PUBLIC_KEY=<your-production-key>
IMAGEKIT_PRIVATE_KEY=<your-production-key>
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/xxxxx
```

**File: `Backend/.env.staging` (NEW)**

```env
NODE_ENV=staging
JWT_SECRET=<generate-a-staging-secret-key>
MONGODB_URI=mongodb+srv://username:password@staging-cluster.mongodb.net/foodbacked
FRONTEND_URL=https://staging.yourdomain.com
```

**File: `frontend/.env.local` (NEW - Local Development)**

```env
VITE_API_URL=http://localhost:3000
```

**File: `frontend/.env.production` (NEW)**

```env
VITE_API_URL=https://api.yourdomain.com
```

**File: `frontend/.env.staging` (NEW)**

```env
VITE_API_URL=https://api-staging.yourdomain.com
```

---

## Fix #5: Add Error Handling for API Failures

### Problem

Components crash when API is down, no fallback or retry logic

### Solution

**Step 1: Create Axios Instance with Timeout**

**File: `frontend/src/config/api.js` (UPDATE)**

```javascript
import axios from "axios";

// API Base URL
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  withCredentials: true, // Send cookies with requests
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout - API server may be down");
    } else if (error.response?.status === 401) {
      // Redirect to login on unauthorized
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API_BASE_URL;
```

**Step 2: Update Components to Use apiClient and Handle Errors**

**Example: `frontend/src/UserProfilePage.jsx`**

**Before:**

```javascript
useEffect(() => {
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/auth/user/profile",
        {
          withCredentials: true,
        }
      );
      setUserData(response.data.user);
      setError(null);
    } catch (err) {
      setError("Failed to load profile");
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };
  fetchUserProfile();
}, [navigate]);
```

**After:**

```javascript
import { apiClient } from "./config/api";

useEffect(() => {
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/auth/user/profile");
      setUserData(response.data.user);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else if (err.code === "ECONNABORTED") {
        setError("Connection timeout - API server may be down");
      } else if (!err.response) {
        setError("Network error - Cannot reach server");
      } else {
        setError(err.response?.data?.message || "Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };
  fetchUserProfile();
}, [navigate]);
```

**Apply to all components that call APIs:**

- login.jsx
- register.jsx
- ViewPage.jsx
- ReviewPage.jsx
- FullReportPage.jsx
- notification.jsx
- SettingsPage.jsx
- user.jsx, admin.jsx, Vendor.jsx

---

## Fix #6: Add Rate Limiting

### Problem

No protection against brute-force attacks or DoS

### Solution

**Step 1: Install Package**

```bash
cd Backend
npm install express-rate-limit
```

**Step 2: Configure Rate Limiting**

**File: `Backend/src/app.js`**

**Add at top:**

```javascript
const rateLimit = require("express-rate-limit");
```

**Add before route definitions:**

```javascript
// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per windowMs per IP
  message: "Too many requests from this IP, please try again after 15 minutes",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 login attempts
  skipSuccessfulRequests: true,
  message: "Too many login attempts, please try again later",
});

// Apply general rate limiter to all API routes
app.use("/api/", limiter);

// Apply stricter limiter to auth routes
app.use("/api/auth/user/login", authLimiter);
app.use("/api/auth/vendor/login", authLimiter);
app.use("/api/auth/admin/login", authLimiter);
```

---

## Fix #7: Add Input Validation

### Problem

No validation on frontend before sending to API

### Solution

**Step 1: Create Validation Utility**

**File: `frontend/src/utils/validation.js` (NEW)**

```javascript
export const validators = {
  email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),

  password: (password) => password && password.length >= 6,

  phone: (phone) => /^[0-9]{10}$/.test(phone.replace(/\D/g, "")),

  pincode: (pincode) => /^[0-9]{5,6}$/.test(pincode),

  username: (username) => username && username.length >= 3,
};

export const validateEmail = (email) => {
  if (!email) return "Email is required";
  if (!validators.email(email)) return "Invalid email format";
  return null;
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return "Phone is required";
  if (!validators.phone(phone)) return "Phone must be 10 digits";
  return null;
};

export const validatePincode = (pincode) => {
  if (!pincode) return "Pincode is required";
  if (!validators.pincode(pincode)) return "Pincode must be 5-6 digits";
  return null;
};
```

**Step 2: Use in Components**

**Example: `frontend/src/login.jsx`**

```javascript
import { validateEmail, validatePassword } from "./utils/validation";

// In form submission:
const handleLogin = (e) => {
  e.preventDefault();

  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  if (emailError) {
    alert(emailError);
    return;
  }
  if (passwordError) {
    alert(passwordError);
    return;
  }

  // Proceed with login
};
```

---

## Checklist to Complete All Fixes

- [ ] Create `frontend/src/config/api.js` with API_BASE_URL
- [ ] Create environment files (`.env.local`, `.env.production`)
- [ ] Update 14 frontend files to use API_BASE_URL (use find & replace)
- [ ] Update CORS in `Backend/src/app.js`
- [ ] Add `FRONTEND_URL` to `Backend/.env`
- [ ] Update all `res.cookie()` calls with secure options (3 places)
- [ ] Create `Backend/.env.production` and `.env.staging`
- [ ] Install `express-rate-limit`: `npm install express-rate-limit`
- [ ] Add rate limiting to `Backend/src/app.js`
- [ ] Create `frontend/src/utils/validation.js`
- [ ] Update `frontend/src/config/api.js` with axios instance
- [ ] Update error handling in all API-calling components
- [ ] Test locally with all fixes
- [ ] Update `.gitignore` to include `.env*` files (if not already)

---

## Testing After Fixes

1. **Test Environment Variable Loading:**

   ```bash
   # Frontend
   echo $VITE_API_URL  # Should print the API URL

   # Backend
   echo $NODE_ENV  # Should print development
   echo $FRONTEND_URL  # Should print frontend URL
   ```

2. **Test API Connection:**

   - Open DevTools → Network tab
   - Navigate to login page
   - Check API calls use correct base URL
   - Verify cookies set with HttpOnly flag

3. **Test Error Handling:**

   - Stop the backend server
   - Try to login
   - Should show "Connection timeout" message, not crash

4. **Test CORS:**

   - Check response headers include correct `Access-Control-Allow-Origin`

5. **Test Rate Limiting:**
   - Make 6 login attempts quickly
   - Should be blocked on 6th attempt

---

## Deploy Command Reference

**Local Development:**

```bash
# Terminal 1 - Backend
cd Backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Production Build:**

```bash
# Backend
cd Backend
npm start  # (same command, NODE_ENV=production)

# Frontend
cd frontend
npm run build
# Deploy the dist/ folder to hosting
```

**Production Environment Variables:**

```bash
# Set before running
export NODE_ENV=production
export MONGODB_URI=<production-mongodb>
export JWT_SECRET=<strong-secret>
export FRONTEND_URL=<production-url>
npm start
```

---

**Total Time Estimate:** 2-3 hours  
**Difficulty:** Easy to Medium  
**Result:** Production-ready application ✅
