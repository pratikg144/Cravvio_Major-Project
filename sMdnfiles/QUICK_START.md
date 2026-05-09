# Quick Start & Testing Guide

## Prerequisites

- Node.js installed
- MongoDB running locally on port 27017
- npm/npx available

---

## 1. Start Backend Server

```bash
cd Backend
npm install  # Run this first time only
npm start
```

**Expected Output:**

```
Server is running on port 3000
Database connected successfully
```

---

## 2. Start Frontend Development Server

```bash
cd frontend
npm install  # Run this first time only
npm run dev
```

**Expected Output:**

```
VITE v... ready in ... ms
Local:        http://localhost:5173/
```

---

## 3. Testing the Complete Flow

### Step 1: Register a New User

1. Go to `http://localhost:5173/register`
2. Click on **"User"** tab
3. Fill in all fields:
   - Username: `testuser`
   - Email: `testuser@example.com`
   - Phone: `+91 9876543210`
   - Address: `123 Main Street, City`
   - Pincode: `123456`
   - Password: `Test@123`
4. Click **"Register"**
5. You should be redirected to user dashboard

### Step 2: View User Dashboard

- Should show welcome message with your username
- Display your email and phone
- Show profile information

### Step 3: Logout

- Click **"Logout"** button
- You'll be redirected to login page

### Step 4: Login Again

1. Go to `http://localhost:5173/login`
2. Select **"User"** tab
3. Enter credentials:
   - Email: `testuser@example.com`
   - Password: `Test@123`
4. Click **"Login"**
5. Dashboard should load with your data

---

## 4. Testing Vendor Registration & Login

### Register Vendor

1. Go to `http://localhost:5173/register`
2. Click **"Vendor"** tab
3. Fill in:
   - Username: `foodhub_vendor`
   - Email: `vendor@foodhub.com`
   - Phone: `+91 9876543210`
   - Address: `456 Business Park`
   - Pincode: `654321`
   - Password: `Vendor@123`
4. Click **"Register"**

### Login Vendor

1. Go to `http://localhost:5173/login`
2. Select **"Vendor"** tab
3. Enter email and password
4. Click **"Login"**

---

## 5. Testing Admin Registration & Login

### Register Admin

1. Go to `http://localhost:5173/register`
2. Click **"Admin"** tab
3. Fill in:
   - Username: `admin_master`
   - Email: `admin@cravvio.com`
   - Phone: `+91 9876543210`
   - Address: `789 Admin Center`
   - Pincode: `987654`
   - Password: `Admin@123`
4. Click **"Register"**

### Login Admin

1. Go to `http://localhost:5173/login`
2. Select **"Admin"** tab
3. Enter email and password
4. Click **"Login"**

---

## 6. API Testing with Postman/cURL

### Test User Registration

```bash
curl -X POST http://localhost:3000/api/auth/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "Test@123",
    "phone": "+91 9876543210",
    "address": "123 Main St",
    "pincode": "123456"
  }' \
  -c cookies.txt
```

### Test User Login

```bash
curl -X POST http://localhost:3000/api/auth/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test@123"
  }' \
  -c cookies.txt
```

### Test User Profile (Get)

```bash
curl -X GET http://localhost:3000/api/auth/user/profile \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

---

## 7. Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"

**Solution:**

```bash
# Check if MongoDB is running
mongod --version

# If not running, start it:
mongod
# or
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

### Issue: "Unauthorized" errors

**Solution:**

- Make sure you're logged in first
- Check if cookies are being sent properly
- Verify JWT_SECRET in .env file

### Issue: CORS errors in browser console

**Solution:**

- Check backend CORS configuration
- Ensure frontend URL matches in backend app.js
- Frontend should be on `http://localhost:5173`

### Issue: "Port 3000 already in use"

**Solution:**

```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Issue: "Port 5173 already in use"

**Solution:**

```bash
npm run dev -- --port 5174
```

---

## 8. Database Verification

### Check MongoDB Collections

```bash
# Open MongoDB shell
mongosh

# Select database
use foodbacked

# See all collections
show collections

# View users
db.users.find()

# View vendors
db.vendors.find()

# View admins
db.admins.find()
```

---

## 9. Verify Integration is Working

### Checklist:

- [ ] Backend server starts without errors
- [ ] Frontend loads on http://localhost:5173
- [ ] Can register user and see success message
- [ ] User data appears in MongoDB
- [ ] Can login with registered credentials
- [ ] Dashboard shows correct user information
- [ ] Logout clears session and redirects
- [ ] Can register vendor and admin similarly
- [ ] Each user type gets their own dashboard

---

## 10. Important Notes

✅ **Password Security:**

- All passwords are hashed with bcryptjs
- Passwords are never stored or displayed in plaintext

✅ **Token Storage:**

- JWT tokens are stored in HTTP-only cookies
- Not accessible from JavaScript (secure against XSS)
- Automatically sent with every authenticated request

✅ **Session Management:**

- Login creates a session (cookie)
- Logout deletes the session
- Session expires based on token expiration (currently no expiration)

✅ **Data Privacy:**

- Passwords excluded from profile API responses
- Each user only sees their own data
- Vendor/Admin data is separate from User data

---

## 11. Next Steps

After successful testing:

1. **Add email verification** to registration
2. **Implement password reset** functionality
3. **Create data management APIs** for food items
4. **Add order management** system
5. **Implement payment gateway** integration
6. **Create admin management** features
7. **Add user notifications** system
8. **Implement real-time updates** with WebSockets

---

## 12. Project URLs

| Page             | URL                                    |
| ---------------- | -------------------------------------- |
| Register         | `http://localhost:5173/register`       |
| Login            | `http://localhost:5173/login`          |
| User Dashboard   | `http://localhost:5173/user`           |
| Vendor Dashboard | `http://localhost:5173/vendor`         |
| Admin Dashboard  | `http://localhost:5173/admin`          |
| Backend API      | `http://localhost:3000/api/auth`       |
| MongoDB          | `mongodb://localhost:27017/foodbacked` |

---

## 13. Support & Debugging

**Enable Debug Logging:**

1. Open browser DevTools (F12)
2. Go to Console tab
3. You'll see API call logs and responses

**Check Backend Logs:**

- All API calls are logged in server console
- Check for validation errors
- Database operation logs

---

This guide provides everything needed to test and verify the complete frontend-backend integration with real-time database connectivity!
