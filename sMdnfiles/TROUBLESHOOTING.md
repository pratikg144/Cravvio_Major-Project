# Troubleshooting Guide

## Common Issues and Solutions

---

## 1. Backend Server Issues

### Problem: "Cannot find module 'express'"

**Error Message:**

```
Cannot find module 'express'
```

**Solution:**

```bash
cd Backend
npm install
npm start
```

---

### Problem: "Port 3000 already in use"

**Error Message:**

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**

**Windows:**

```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**macOS/Linux:**

```bash
lsof -i :3000
kill -9 <PID>
```

**Alternative:** Use different port

```bash
# Modify server.js
app.listen(3001, () => console.log("Server running on 3001"));
```

---

### Problem: "MongoDB connection failed"

**Error Message:**

```
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**

Check if MongoDB is running:

```bash
# Windows (PowerShell as Admin)
Get-Process mongod

# macOS/Linux
ps aux | grep mongod

# If not running, start MongoDB
mongod

# Or use system service
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

Verify connection string in `.env`:

```
MONGODB_URI=mongodb://localhost:27017/foodbacked
```

---

### Problem: "JWT_SECRET not defined"

**Error Message:**

```
Error: JWT_SECRET is not defined
```

**Solution:**

Ensure `.env` file exists in Backend folder:

```
JWT_SECRET=f4f5f1bb455a6758da756e71f599c175
MONGODB_URI=mongodb://localhost:27017/foodbacked
```

Restart server after adding to `.env`:

```bash
npm start
```

---

### Problem: "CORS error"

**Error Message (Console):**

```
Access to XMLHttpRequest at 'http://localhost:3000/api/auth/user/register'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**

Check `app.js` CORS configuration:

```javascript
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
```

If not present, add it:

```javascript
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
```

Make sure frontend is on `http://localhost:5173`

---

## 2. Frontend Issues

### Problem: "Cannot find module 'axios'"

**Error Message:**

```
ERROR in ./src/login.jsx
Module not found: Can't resolve 'axios'
```

**Solution:**

```bash
cd frontend
npm install axios
npm run dev
```

---

### Problem: "Port 5173 already in use"

**Error Message:**

```
error: Port 5173 is in use
```

**Solution:**

Use different port:

```bash
npm run dev -- --port 5174
```

Or kill process on 5173:

```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5173
kill -9 <PID>
```

---

### Problem: "Component not found" or "route not found"

**Error Message:**

```
Cannot find module './user'
```

**Solution:**

Check file names match exactly (case-sensitive):

- File: `user.jsx` → Import: `./user`
- File: `User.jsx` → Import: `./User`

---

### Problem: "API returns 404"

**Error Message (Console):**

```
POST http://localhost:3000/api/auth/user/register 404 (Not Found)
```

**Solution:**

1. Check URL is correct:

```javascript
// ✅ Correct
http://localhost:3000/api/auth/user/register

// ❌ Wrong
http://localhost:3000/api/user/register
http://localhost:3000/auth/user/register
```

2. Check routes are registered in backend `app.js`:

```javascript
app.use("/api/auth", authRoutes);
```

3. Restart backend server

---

## 3. Authentication Issues

### Problem: "Unauthorized: please login first"

**Error Message (Response):**

```json
{
  "message": "Unauthorized: please login first"
}
```

**Solution:**

1. Ensure you're logged in (cookie exists)
2. Check cookie is being sent with `withCredentials: true`:

```javascript
axios.get("/api/auth/user/profile", {
  withCredentials: true, // Must include this
});
```

3. Check backend middleware validates correctly

---

### Problem: "invalid email or Password"

**Error Message (Response):**

```json
{
  "message": "invalid email or Password"
}
```

**Solutions:**

1. **Wrong credentials:**

   - Verify email is correct
   - Verify password is correct
   - Check Caps Lock

2. **User doesn't exist:**

   - Register first before login
   - Check spelling of email
   - MongoDB may not be running

3. **Backend issue:**
   - Restart backend server
   - Check MongoDB connection

---

### Problem: "user already Exist"

**Error Message (Response):**

```json
{
  "message": "user already Exist"
}
```

**Solution:**

This user email is already registered. Either:

- Use a different email for new account
- Login with existing credentials

Check MongoDB:

```bash
mongosh
use foodbacked
db.users.find({email: "your@email.com"})
```

---

### Problem: "Token expires immediately"

**Issue:** User gets logged out right after login

**Solution:**

Currently tokens don't have expiration. To add expiration:

```javascript
// In auth.controller.js registerUser function
const token = jwt.sign(
  {
    id: user._id,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "7d", // Add this
  }
);
```

---

## 4. Database Issues

### Problem: "Duplicate key error"

**Error Message:**

```
E11000 duplicate key error collection: foodbacked.users index: email_1
```

**Solution:**

Email already exists in database. Either:

- Use different email
- Delete previous user record:

```bash
mongosh
use foodbacked
db.users.deleteOne({email: "existing@email.com"})
db.users.find()  # Verify deletion
```

---

### Problem: "Cannot read password (it's showing as undefined)"

**Issue:** Password is hashing but always undefined

**Solution:**

Check registration controller includes password:

```javascript
const user = await userModel.create({
  username,
  email,
  password: hashPassword, // Must include this
  phone,
  address,
  pincode,
});
```

---

### Problem: "Database connection hangs"

**Issue:** Server seems stuck, no response

**Solution:**

1. Check MongoDB is running:

```bash
mongosh
```

2. If not, start it:

```bash
mongod
```

3. Check connection string in `.env` is correct

4. Restart backend server:

```bash
npm start
```

---

## 5. Data Display Issues

### Problem: "Profile shows undefined values"

**Issue:** Dashboard loads but shows "undefined" instead of user data

**Solution:**

1. Check API response:

   - Open DevTools (F12)
   - Check Network tab
   - See what `/profile` endpoint returns

2. Verify user data is saved:

```bash
mongosh
use foodbacked
db.users.findOne({email: "your@email.com"})
```

3. Check controller returns all fields:

```javascript
res.status(200).json({
  user: {
    id: user._id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    address: user.address,
    pincode: user.pincode,
  },
});
```

---

### Problem: "User data not updating in database"

**Issue:** Registration successful but data not in MongoDB

**Solution:**

1. Check backend response includes the data
2. Verify database connection working:

```bash
mongosh
use foodbacked
db.users.find()
```

3. Ensure `mongoose.create()` is being used:

```javascript
const user = await userModel.create({...})
```

---

## 6. Cookie/Session Issues

### Problem: "Cookie not being set"

**Issue:** Login successful but no cookie stored

**Solution:**

1. Check backend sets cookie:

```javascript
res.cookie("token", token);
```

2. Check frontend requests with credentials:

```javascript
withCredentials: true;
```

3. Check CORS allows credentials:

```javascript
app.use(
  cors({
    credentials: true, // Must be true
  })
);
```

4. In browser DevTools:
   - Application tab → Cookies
   - Should see `token` cookie

---

### Problem: "Cookie deleted on logout but still authenticated"

**Issue:** After logout, can still access protected routes

**Solution:**

Frontend should redirect to login:

```javascript
const handleLogout = () => {
  navigate("/login"); // Must redirect
};
```

Or check middleware is validating token:

```javascript
if (!token) {
  return res.status(401).json({ message: "Unauthorized" });
}
```

---

## 7. Network Issues

### Problem: "ERR_CONNECTION_REFUSED"

**Error Message:**

```
GET http://localhost:3000/api/auth/user/profile
net::ERR_CONNECTION_REFUSED
```

**Solution:**

Backend server is not running. Start it:

```bash
cd Backend
npm start
```

Verify it's running:

```bash
# Should show connection message
Server is running on port 3000
Database connected successfully
```

---

### Problem: "Timeout waiting for response"

**Issue:** API calls hang and eventually timeout

**Solution:**

1. Check backend is running:

```bash
npm start
```

2. Check MongoDB is running:

```bash
mongod
```

3. Check network connectivity:

```bash
ping localhost
```

4. Check for infinite loops in controller code

5. Restart both services

---

## 8. Browser Console Issues

### Problem: "useNavigate is not defined"

**Error Message:**

```
ReferenceError: useNavigate is not defined
```

**Solution:**

Import useNavigate in React component:

```javascript
import { useNavigate } from "react-router-dom";

const YourComponent = () => {
  const navigate = useNavigate();
  // Now can use navigate()
};
```

---

### Problem: "axios is not defined"

**Error Message:**

```
ReferenceError: axios is not defined
```

**Solution:**

Import axios in your component:

```javascript
import axios from "axios";
```

And ensure it's installed:

```bash
npm install axios
```

---

## 9. Form Submission Issues

### Problem: "Form submitted but nothing happens"

**Issue:** Click submit, form clears but no API call

**Solution:**

Check form has `onSubmit` handler:

```javascript
<form onSubmit={handleSubmit}>{/* form fields */}</form>;

const handleSubmit = async (e) => {
  e.preventDefault();
  // API call here
};
```

---

### Problem: "All fields are required error on valid data"

**Issue:** User fills all fields but gets validation error

**Solution:**

Check validation logic:

```javascript
// ❌ Wrong
if (!username || !email || !password || !phone || !address || !pincode) {
  // This will fail if any field is empty
}

// ✅ Correct
if (!username?.trim() || !email?.trim() || !password?.trim()) {
  // Handle properly
}
```

---

## 10. General Debugging

### Enable Logging

**Backend:**
Add to your controllers:

```javascript
console.log("Request body:", req.body);
console.log("User created:", user);
console.log("Token generated:", token);
```

**Frontend:**

```javascript
console.log("API Response:", response.data);
console.log("API Error:", error);
```

### Check Everything is Running

```bash
# Terminal 1: Check Backend
npm start
# Should show: Server is running on port 3000

# Terminal 2: Check Frontend
npm run dev
# Should show: Local: http://localhost:5173/

# Terminal 3: Check MongoDB
mongosh
use foodbacked
db.users.find()  # Should show your data
```

### Clear Browser Cache

If something looks off:

1. Hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`
2. Clear cookies: DevTools → Application → Cookies → Delete all
3. Clear cache: DevTools → Application → Cache → Clear

---

## 11. Performance Issues

### Problem: "Dashboard loads slowly"

**Solution:**

1. Check database query:

```javascript
// Add index to email in MongoDB
db.users.createIndex({ email: 1 });
```

2. Reduce unnecessary API calls in useEffect:

```javascript
useEffect(() => {
  // Only run once
}, []); // Empty dependency array
```

3. Check network latency:
   - DevTools → Network tab
   - See how long API calls take

---

## 12. Security Issues

### Problem: "Password visible in network requests"

**Solution:**

Always use HTTPS in production. For development, check:

```javascript
// ✅ Correct
password: "hashValue"; // Only hashed value stored

// ❌ Wrong
password: "plaintext"; // Never store plaintext
```

---

## Quick Checklist for Setup

- [ ] Node.js installed (`node --version`)
- [ ] MongoDB running (`mongosh` works)
- [ ] npm packages installed (`npm install` in both folders)
- [ ] `.env` file with correct values
- [ ] Backend starts without errors (`npm start`)
- [ ] Frontend starts without errors (`npm run dev`)
- [ ] Can access http://localhost:5173
- [ ] Can access http://localhost:3000
- [ ] Can register a user
- [ ] Can login with registered user
- [ ] Dashboard shows user data

---

## Getting Help

If issue persists:

1. **Check logs:**

   - Browser console (F12)
   - Backend terminal
   - MongoDB shell

2. **Restart services:**

   ```bash
   npm start  # Backend
   npm run dev  # Frontend
   mongod  # MongoDB
   ```

3. **Clear everything:**

   - Delete `node_modules`
   - Delete database (`mongosh → use foodbacked → db.dropDatabase()`)
   - Reinstall: `npm install`
   - Start fresh

4. **Ask for help with:**
   - Error message (full text)
   - Stack trace from console
   - What were you doing when error occurred
   - Terminal/console logs

---

This guide covers most common issues and solutions. If your problem isn't listed, check the error message carefully and trace through the code step by step!
