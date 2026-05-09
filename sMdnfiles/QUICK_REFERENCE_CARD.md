# DEPLOYMENT QUICK REFERENCE CARD

**Print this page for quick access during deployment**

---

## 🔴 7 CRITICAL ISSUES TO FIX

| #   | Issue                | File                | Line     | Fix Time |
| --- | -------------------- | ------------------- | -------- | -------- |
| 1   | Hardcoded URLs (14x) | frontend/src/\*.jsx | Various  | 30 min   |
| 2   | CORS hardcoded       | Backend/src/app.js  | 11       | 10 min   |
| 3   | MongoDB hardcoded    | Backend/.env        | 2        | 20 min   |
| 4   | No env config        | .env files          | -        | 15 min   |
| 5   | Cookies not secure   | auth.controller.js  | 3 places | 20 min   |
| 6   | No rate limiting     | Backend/src/app.js  | -        | 30 min   |
| 7   | No error handling    | frontend/src/\*.jsx | Various  | 1 hour   |

**TOTAL TIME: 2-3 hours**

---

## 📋 QUICK FIX CHECKLIST

```
Step 1: CREATE FILES (5 min)
[ ] frontend/src/config/api.js (NEW)
[ ] frontend/.env.local (NEW)
[ ] frontend/.env.production (NEW)
[ ] Backend/.env.production (NEW)

Step 2: UPDATE URLs (30 min)
[ ] Replace http://localhost:3000 in 14 files
[ ] Update CORS in app.js
[ ] Add FRONTEND_URL to .env

Step 3: SECURE BACKEND (30 min)
[ ] Update 3 res.cookie() calls
[ ] npm install express-rate-limit
[ ] Add rate limiting to app.js

Step 4: ERROR HANDLING (45 min)
[ ] Add axios timeout
[ ] Update error handlers in components
[ ] Add connection error messages

Step 5: TEST (15 min)
[ ] npm start (backend)
[ ] npm run dev (frontend)
[ ] Test login flow
[ ] Check DevTools Network tab
```

---

## 🔧 COMMON SEARCH & REPLACE PATTERNS

### Pattern 1: Replace Hardcoded URLs

```
FIND:    http://localhost:3000/api/
REPLACE: ${API_BASE_URL}/api/
```

### Pattern 2: Add Import

```
ADD AT TOP:
import API_BASE_URL from '../config/api';
```

### Pattern 3: Update Cookies

```
FIND:    res.cookie("token", token)
REPLACE: res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
});
```

---

## 📁 CRITICAL FILES TO UPDATE

**Frontend (14 URL replacements):**

- [ ] login.jsx (1)
- [ ] register.jsx (1)
- [ ] admin.jsx (1)
- [ ] user.jsx (1)
- [ ] Vendor.jsx (1)
- [ ] ViewPage.jsx (2)
- [ ] SettingsPage.jsx (2)
- [ ] ReviewPage.jsx (3)
- [ ] notification.jsx (1)
- [ ] FullReportPage.jsx (1)

**Backend (3 areas):**

- [ ] src/app.js (CORS config)
- [ ] controllers/auth.controller.js (Cookie security)
- [ ] .env files (Env variables)

---

## 🚀 DEPLOYMENT COMMANDS

### Local Development

```bash
# Backend startup
cd Backend
npm start

# Frontend startup (another terminal)
cd frontend
npm run dev
```

### Production Build

```bash
# Backend (same, just different .env)
npm start

# Frontend build
cd frontend
npm run build
# Deploy contents of dist/ folder
```

### Production Environment Setup

```bash
# Set these before running
export NODE_ENV=production
export JWT_SECRET=<new-strong-secret>
export MONGODB_URI=<production-mongodb>
export FRONTEND_URL=<production-url>
npm start
```

---

## ✅ VERIFICATION CHECKLIST

### After Fixes, Before Deployment

- [ ] `echo $VITE_API_URL` shows correct URL (Frontend)
- [ ] `echo $FRONTEND_URL` shows correct URL (Backend)
- [ ] No "localhost" in network tab (DevTools)
- [ ] Cookies show "HttpOnly" flag
- [ ] Login succeeds with valid credentials
- [ ] Unauthorized request redirects to login
- [ ] Profile page loads and updates work
- [ ] Admin dashboard shows statistics
- [ ] Vendor approval workflow functions
- [ ] Notifications load and filter works
- [ ] Rate limit appears after 100 requests
- [ ] API timeout occurs after 10 seconds of inactivity

---

## 🗂️ DOCUMENTATION MAP

| Document                         | Use When             | Time      |
| -------------------------------- | -------------------- | --------- |
| DEPLOYMENT_READINESS_REPORT.md   | Understanding issues | 20 min    |
| CRITICAL_FIXES_IMPLEMENTATION.md | Applying fixes       | 2-3 hours |
| COMPLETE_API_REFERENCE.md        | Testing endpoints    | 10 min    |
| DEPLOYMENT_STATUS_SUMMARY.md     | Overview needed      | 5 min     |
| THIS FILE                        | Quick reference      | Anytime   |

---

## 🔐 SECURITY CHECKLIST

Before production deployment:

- [ ] No console.log() statements with sensitive data
- [ ] All API calls use HTTPS in production
- [ ] Cookies have HttpOnly + Secure flags
- [ ] CORS restricted to production domain only
- [ ] Rate limiting enabled
- [ ] Input validation on both client and server
- [ ] Error messages don't expose internal details
- [ ] JWT secret is strong (32+ characters)
- [ ] Database credentials in environment only
- [ ] No hardcoded secrets in code

---

## 📊 PERFORMANCE TARGETS

| Metric       | Target |
| ------------ | ------ |
| API Response | <200ms |
| Page Load    | <1.5s  |
| Bundle Size  | <300KB |
| DB Query     | <50ms  |
| Uptime       | 99.9%  |

---

## 🆘 TROUBLESHOOTING

### "Cannot connect to API"

1. Check backend is running: `npm start` in Backend folder
2. Check FRONTEND_URL in Backend/.env
3. Verify CORS origin matches frontend URL
4. Check firewall isn't blocking port 3000

### "Unauthorized" on login

1. Check JWT_SECRET matches between requests
2. Verify cookie is being set (DevTools > Application > Cookies)
3. Check user exists in database
4. Verify password hashing works

### "MongoDB connection error"

1. Check MongoDB is running locally or Atlas is accessible
2. Verify MONGODB_URI in .env
3. Check database credentials
4. Verify network firewall rules

### "Rate limited after many requests"

This is normal. Wait 15 minutes or restart server.

---

## 📞 SUPPORT

If stuck, check:

1. CRITICAL_FIXES_IMPLEMENTATION.md (exact steps)
2. COMPLETE_API_REFERENCE.md (API details)
3. BACKEND_IMPLEMENTATION_GUIDE.md (architecture)
4. Browser DevTools Console (error messages)
5. Backend logs (terminal output)

---

## ⏱️ TIMELINE ESTIMATE

| Phase              | Duration    | Deadline   |
| ------------------ | ----------- | ---------- |
| Read this file     | 5 min       | NOW        |
| Apply fixes        | 2-3 hours   | TODAY      |
| Local testing      | 30 min      | TODAY      |
| Deploy backend     | 1 hour      | TOMORROW   |
| Deploy frontend    | 1 hour      | TOMORROW   |
| Production testing | 2 hours     | THIS WEEK  |
| **Total**          | **7 hours** | **WEEK 1** |

---

**REMEMBER: All fixes are documented in CRITICAL_FIXES_IMPLEMENTATION.md**

**Ready? Start with Step 1 on page 2 of this file!** 🚀
