# 🚀 Quick Test Guide - Subscription & Admin System

## ⚡ 60-Second Setup Check

### Start Backend & Frontend

```powershell
# Terminal 1: Backend
cd Backend
npm install  # if needed
npm start    # Should show "Server running on port 3000"

# Terminal 2: Frontend
cd frontend
npm install  # if needed
npm run dev  # Should show "Local: http://localhost:5173"
```

---

## 👤 Test as Regular User

### Step 1: Login as User

1. Go to `http://localhost:5173/login`
2. Enter credentials: `username: john` / `password: 123456`
3. Click Login → Redirected to `/usermenu`

### Step 2: View Profile with Subscriptions

1. Click **Profile Icon** (top right)
2. Click **Edit Profile**
3. Navigate to `/user` page
4. **Scroll Down** to "My Subscriptions" section
   - ✅ If no subscriptions: Shows "View Plans" button
   - ✅ If active subscription: Shows plan details + days remaining

### Step 3: Purchase a Subscription

1. Go back to `/usermenu`
2. **Scroll Down** to "Hungry Every Day? Choose Your Plan"
3. Click **"Buy Now"** on Premium plan (₹2999)
4. Redirected to `/payments` page
5. Select payment method (e.g., UPI, Card, COD)
6. Click **"Pay ₹2999"**
7. Success message appears
8. **Verify in Profile**: `/user` → Subscriptions should show as "Active" ✅

---

## 👑 Test as Admin User

### Step 1: Login as Admin

1. Go to `http://localhost:5173/login`
2. Enter credentials (admin account - ensure role='admin' in DB):
   - Example: `username: admin` / `password: admin123`
3. Click Login → Redirected to `/usermenu`

### Step 2: Access Admin Panel

1. Click **Profile Icon** (top right)
2. Notice **"👑 Admin"** badge next to username
3. Click **"🔧 Admin Panel"** button
4. Redirected to `/admin-subscriptions` page

### Step 3: Create Subscription for User

1. **Section: Create Subscription**
   - Plan: Select **"Standard"**
   - Price: Keep **₹1999**
   - Duration: Set **1 month**
   - **Uncheck** "Apply to all users"
   - User ID: Enter `john` or specific user email
   - Click **"✅ Create Subscription"**
2. **Verify**: Green success message appears

### Step 4: Create Subscription for All Users

1. **Section: Create Subscription**
   - Plan: Select **"Gold"**
   - Price: Keep **₹3999**
   - Duration: Set **3 months**
   - **Check** "Apply to all users"
   - Click **"✅ Create Subscription"**
2. **Verify**: Success message confirms bulk creation

### Step 5: Manage Vendor Status

1. **Section: Vendor Management**
   - Vendor: Select any vendor from dropdown
   - Status: Change to **"Suspended"** 🚫
   - Click **"✅ Update Status"**
2. **Verify**: Green success message appears

---

## 📋 Expected Data Display

### User Profile - Active Subscription Should Show:

```
┌─────────────────────────────────────────┐
│ 📅 Premium Plan                [Active]  │
│ Duration: 1 month(s)                    │
│ 🗓️ Valid: Jan 1, 2025 - Jan 31, 2025   │
│ ⏳ 15 days remaining                     │
│ ₹2999 /month        [Manage]            │
└─────────────────────────────────────────┘
```

### Admin Panel - Create Subscription Form:

```
┌──────────────────────────────────────┐
│ 🎟️ Create Subscription               │
├──────────────────────────────────────┤
│ Plan: [Basic ▼]                      │
│ Price: [1299        ]                │
│ Duration: [1        ] months         │
│ ☐ Apply to all users                │
│ User ID: [_______________]           │
│ Button: [✅ Create Subscription]    │
└──────────────────────────────────────┘
```

---

## 🧪 Test Scenarios

### Scenario 1: User Views Subscription Details

- ✅ Days remaining calculated correctly
- ✅ Status shows "Active" in green
- ✅ Dates display in readable format (DD/MM/YYYY)

### Scenario 2: Admin Creates Bulk Subscription

- ✅ "Apply to all users" checkbox works
- ✅ Success message appears
- ✅ All users receive subscription

### Scenario 3: Admin Creates Specific User Subscription

- ✅ Unchecking "Apply to all users" shows User ID field
- ✅ Entering user ID creates subscription for that user only
- ✅ Success message confirms creation

### Scenario 4: Vendor Status Update

- ✅ Vendor dropdown populated with all vendors
- ✅ Status selector shows 3 options (Active, Inactive, Suspended)
- ✅ Update button changes vendor status
- ✅ Success message appears

### Scenario 5: Full Payment Flow

- ✅ User selects plan → Redirects to `/payments`
- ✅ Payment page shows subscription details
- ✅ After payment, subscription status changes to "Active"
- ✅ Days remaining counter starts counting down

---

## 🔍 Debug Checks

### Browser DevTools - Network Tab

**Verify these API calls succeed:**

1. **GET /api/auth/user/profile** → Status 200
2. **GET /api/payment/subscription/user** → Status 200
3. **POST /api/payment/subscription/create** → Status 201
4. **POST /api/payment/subscription/admin/create** → Status 201 (admin only)
5. **GET /api/user/admin/vendors** → Status 200 (admin only)
6. **PUT /api/user/admin/vendors/:id/status** → Status 200

### Browser DevTools - Console

- ✅ No red errors when loading pages
- ✅ No 401/403 Unauthorized errors
- ✅ JWT token present in cookies (Application → Cookies → `token`)

### Database Checks (MongoDB)

```javascript
// Check subscriptions were created
db.subscriptions.find({ userId: "john" });

// Check vendor status updated
db.users.findOne({ role: "vendor", _id: ObjectId("...") });

// Check payment record
db.payments.findOne({ subscriptionId: ObjectId("...") });
```

---

## ⚠️ Common Issues & Fixes

| Issue                             | Fix                                          |
| --------------------------------- | -------------------------------------------- |
| Admin button not showing          | Ensure user role='admin' in database         |
| Vendor dropdown empty             | Check `/api/user/admin/vendors` returns data |
| Subscription not saving           | Check MongoDB connection, verify schema      |
| Days showing negative             | Check endDate is set after payment           |
| 401 error on admin routes         | Verify JWT cookie present, user is logged in |
| Payment not updating subscription | Ensure subscriptionId in payment payload     |

---

## 📝 Form Validation Tests

### Create Subscription - Should Reject:

- [ ] Empty plan/price
- [ ] Unchecked "Apply to all" with empty User ID
- [ ] Negative months value

### Vendor Status - Should Reject:

- [ ] No vendor selected

### Should Accept:

- [ ] Valid plan + price + months + user ID
- [ ] Valid plan + price + months + "Apply to all"
- [ ] Valid vendor + valid status

---

## 🎯 Success Criteria

- [x] User can view subscription details in profile
- [x] Days remaining calculation is accurate
- [x] Admin can see "Admin Panel" button
- [x] Admin can create subscriptions for specific user
- [x] Admin can create subscriptions for all users
- [x] Admin can update vendor status
- [x] No console errors
- [x] All API calls return correct status codes
- [x] Loading states show during operations
- [x] Success/error messages display clearly

---

## 🚀 Ready to Deploy? Checklist

- [ ] All tests passed ✅
- [ ] No console errors
- [ ] API calls working (Network tab)
- [ ] Database records created correctly
- [ ] Admin features accessible
- [ ] User subscriptions display correctly
- [ ] Payment flow works end-to-end
- [ ] Responsive design tested on mobile
- [ ] Error handling verified

---

## 📞 Quick Support

**If something breaks:**

1. Check browser console (F12 → Console)
2. Check Network tab for failed API calls
3. Verify backend running: `http://localhost:3000/api/health`
4. Verify frontend running: `http://localhost:5173`
5. Check MongoDB connection in backend logs

**Still stuck?** Review the detailed guide: `SUBSCRIPTION_ADMIN_INTEGRATION_COMPLETE.md`
