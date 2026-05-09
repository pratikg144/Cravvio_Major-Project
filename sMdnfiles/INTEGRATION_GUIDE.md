# Frontend-Backend Integration Guide

## Overview

This guide explains the real-time database integration between the frontend (React) and backend (Node.js/Express) for the Foodbacked application.

---

## 1. Backend Setup

### API Routes Configured

#### Authentication Routes (`/api/auth`)

All routes use JWT tokens stored in HTTP-only cookies for authentication.

**User Routes:**

- `POST /api/auth/user/register` - Register new user
  - Body: `{ username, email, password, phone, address, pincode }`
- `POST /api/auth/user/login` - Login user
  - Body: `{ email, password }`
- `GET /api/auth/user/logout` - Logout user
- `GET /api/auth/user/profile` - Get user profile (requires authentication)

**Vendor Routes:**

- `POST /api/auth/vendor/register` - Register vendor
  - Body: `{ CompanyName, email, password, phone, address, pincode }`
- `POST /api/auth/vendor/login` - Login vendor
  - Body: `{ email, password }`
- `GET /api/auth/vendor/logout` - Logout vendor
- `GET /api/auth/vendor/profile` - Get vendor profile (requires authentication)

**Admin Routes:**

- `POST /api/auth/admin/register` - Register admin
  - Body: `{ owner, email, password, phone, address, pincode }`
- `POST /api/auth/admin/login` - Login admin
  - Body: `{ email, password }`
- `GET /api/auth/admin/logout` - Logout admin
- `GET /api/auth/admin/profile` - Get admin profile (requires authentication)

### Database Models

**User Model:**

```javascript
{
  username: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  address: String,
  pincode: String,
  timestamps: true
}
```

**Vendor Model:**

```javascript
{
  CompanyName: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  address: String,
  pincode: String,
  timestamps: true
}
```

**Admin Model:**

```javascript
{
  owner: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  address: String,
  pincode: String,
  timestamps: true
}
```

---

## 2. Frontend Implementation

### API Configuration

**Base URL:** `http://localhost:3000`

All API calls use:

- `axios` library for HTTP requests
- `withCredentials: true` for cookie-based authentication
- Proper error handling and loading states

### Pages Connected to Backend

#### 1. **register.jsx** - User Registration

**Flow:**

1. User fills form with: username, email, phone, address, pincode, password
2. Selects user type: User/Vendor/Admin
3. Sends POST request to appropriate endpoint
4. On success: JWT token stored in cookie, redirects to dashboard
5. On error: Shows error message

**API Call:**

```javascript
POST http://localhost:3000/api/auth/{userType}/register
```

#### 2. **login.jsx** - User Login

**Flow:**

1. User enters email and password
2. Selects user type: User/Vendor/Admin
3. Sends POST request to login endpoint
4. On success: JWT token stored, redirects to dashboard
5. On error: Shows error message

**API Call:**

```javascript
POST http://localhost:3000/api/auth/{userType}/login
```

#### 3. **user.jsx** - User Dashboard

**Flow:**

1. On component mount, fetches user profile using token
2. Displays user information: username, email, phone, address, pincode
3. Shows personalized content
4. Logout clears cookie and redirects to login

**API Call:**

```javascript
GET http://localhost:3000/api/auth/user/profile
```

#### 4. **Vendor.jsx** - Vendor Dashboard

**Flow:**

1. On component mount, fetches vendor profile using token
2. Displays vendor information: CompanyName, email, phone, address, pincode
3. Shows vendor-specific analytics
4. Logout clears cookie and redirects to login

**API Call:**

```javascript
GET http://localhost:3000/api/auth/vendor/profile
```

#### 5. **admin.jsx** - Admin Dashboard

**Flow:**

1. On component mount, fetches admin profile using token
2. Displays admin information: owner, email, phone, address, pincode
3. Shows platform statistics and management options
4. Logout clears cookie and redirects to login

**API Call:**

```javascript
GET http://localhost:3000/api/auth/admin/profile
```

#### 6. **login.jsx** - Login Page (with type selection)

- Handles authentication for all three user types
- Routes to appropriate dashboard after login

#### 7. **notification.jsx** - Static notifications page

- Currently using mock data
- Ready to integrate with notification API

#### 8. **ViewPage.jsx** - View users and vendors

- Currently using mock data
- Ready to integrate with data fetching API

---

## 3. Authentication Flow

### Registration Flow

```
User Input → Validate Fields →
API POST /register →
Backend: Hash Password + Save to DB →
Generate JWT Token →
Store in HTTP-only Cookie →
Redirect to Dashboard
```

### Login Flow

```
Email + Password → Validate Fields →
API POST /login →
Backend: Verify Email + Password →
Generate JWT Token →
Store in HTTP-only Cookie →
Redirect to Dashboard
```

### Protected Route Access

```
Request to /profile →
Send with credentials (Cookie included) →
Middleware validates JWT →
Check user/vendor/admin type →
Return profile data
```

### Logout Flow

```
Click Logout →
API GET /logout →
Clear Cookie →
Navigate to Login Page
```

---

## 4. Running the Application

### Backend Setup

```bash
cd Backend
npm install
npm start
```

Backend runs on `http://localhost:3000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### Database Setup

- Ensure MongoDB is running on `mongodb://localhost:27017`
- Database: `foodbacked`

---

## 5. Key Features Implemented

✅ **Real-time Database Integration**

- All user data is saved to MongoDB
- JWT token-based authentication
- Secure password hashing with bcryptjs

✅ **Protected Routes**

- Profile endpoints require authentication
- Automatic redirect to login if token is invalid
- Session management via HTTP-only cookies

✅ **Error Handling**

- Validation on both frontend and backend
- User-friendly error messages
- Console logging for debugging

✅ **Responsive API Calls**

- Axios with error handling
- Loading states for better UX
- Credentials passed for cookie authentication

---

## 6. Testing the Integration

### 1. User Registration

```bash
POST http://localhost:3000/api/auth/user/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Pass@123",
  "phone": "+91 9876543210",
  "address": "123 Main St, City",
  "pincode": "123456"
}
```

### 2. User Login

```bash
POST http://localhost:3000/api/auth/user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Pass@123"
}
```

### 3. Get User Profile

```bash
GET http://localhost:3000/api/auth/user/profile
Cookie: token=<JWT_TOKEN>
```

### 4. Vendor Registration

```bash
POST http://localhost:3000/api/auth/vendor/register
Content-Type: application/json

{
  "CompanyName": "FoodHub",
  "email": "vendor@foodhub.com",
  "password": "Pass@123",
  "phone": "+91 9876543210",
  "address": "456 Business Park, City",
  "pincode": "654321"
}
```

### 5. Admin Registration

```bash
POST http://localhost:3000/api/auth/admin/register
Content-Type: application/json

{
  "owner": "Admin Name",
  "email": "admin@cravvio.com",
  "password": "Pass@123",
  "phone": "+91 9876543210",
  "address": "789 Admin Center, City",
  "pincode": "987654"
}
```

---

## 7. Future Enhancements

- [ ] Email verification during registration
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Role-based access control (RBAC)
- [ ] User profile update API
- [ ] Delete account functionality
- [ ] Activity logging
- [ ] API rate limiting
- [ ] Refresh token implementation
- [ ] Social login integration

---

## 8. Troubleshooting

### Issue: CORS Error

**Solution:** Ensure `corsOrigin` in backend app.js is set to frontend URL

```javascript
origin: 'http://localhost:5173',
credentials: true
```

### Issue: "Unauthorized" on profile request

**Solution:**

- Ensure cookie is being sent with `withCredentials: true`
- Check JWT_SECRET in .env matches
- Verify token is valid and not expired

### Issue: Database connection failed

**Solution:**

- Check MongoDB is running
- Verify MONGODB_URI in .env
- Check database name matches

### Issue: Password not hashing

**Solution:**

- Ensure bcryptjs is installed
- Check salt rounds (10) in controller

---

## 9. Environment Variables

**Backend (.env):**

```
JWT_SECRET=your_secret_key
MONGODB_URI=mongodb://localhost:27017/foodbacked
IMAGEKIT_PUBLIC_KEY=your_key
IMAGEKIT_PRIVATE_KEY=your_key
IMAGEKIT_URL_ENDPOINT=your_endpoint
```

---

## 10. File Structure

```
Backend/
├── src/
│   ├── controllers/
│   │   └── auth.controller.js (Authentication logic)
│   ├── models/
│   │   ├── user.model.js
│   │   ├── vendor.model.js
│   │   └── admin.model.js
│   ├── routes/
│   │   └── auth.routes.js (API endpoints)
│   ├── middlewares/
│   │   └── auth.middleware.js (JWT verification)
│   ├── app.js (Express config)
│   └── db/
│       └── db.js (MongoDB connection)
└── server.js (Entry point)

frontend/
├── src/
│   ├── register.jsx (Registration page)
│   ├── login.jsx (Login page)
│   ├── user.jsx (User dashboard)
│   ├── Vendor.jsx (Vendor dashboard)
│   ├── admin.jsx (Admin dashboard)
│   ├── notification.jsx (Notifications page)
│   ├── ViewPage.jsx (View users/vendors)
│   └── App.jsx (Main app)
```

---

This integration provides a complete backend-frontend connection with real-time database storage, authentication, and dashboard functionality for users, vendors, and admins.
