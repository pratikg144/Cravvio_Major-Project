# 🏗️ System Architecture & Data Flow Diagrams

## 1️⃣ Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CRAVVIO PLATFORM                          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React + Vite)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐          │
│  │   Usermenu   │  │ User Profile │  │AdminSubscription │          │
│  │   (Browse)   │  │   (View Sub) │  │   (Manage)       │          │
│  └───────┬──────┘  └──────┬───────┘  └────────┬─────────┘          │
│          │                │                   │                    │
│          │ Buy Now ──────→│                   │                    │
│          │                │ Check Days ←──────┤                    │
│          │                │                   │                    │
│  ┌───────▼─────────────────▼───────────────────▼──────┐             │
│  │            React Router Navigation                │             │
│  │  /usermenu → /user → /admin-subscriptions         │             │
│  └────────────────────────────────────────────────────┘             │
│          │                                                         │
│  ┌───────▼────────────────────────────────────────────┐            │
│  │     Axios API Client (withCredentials: true)      │            │
│  │     baseURL: http://localhost:3000                │            │
│  └────────────┬─────────────────────────┬────────────┘             │
│               │                         │                          │
└───────────────┼─────────────────────────┼──────────────────────────┘
                │                         │
                │ HTTP Requests           │ HTTP Responses
                │                         │
┌───────────────┼─────────────────────────┼──────────────────────────┐
│               │                         │                          │
│  ┌────────────▼──────────────────────────▼──────────┐              │
│  │        EXPRESS SERVER (Backend API)              │              │
│  │         Node.js + Express + MongoDB              │              │
│  └──────────────────────────────────────────────────┘              │
│               │                                                   │
│  ┌────────────▼────────────────────────────────────┐              │
│  │           Authentication Middleware             │              │
│  │  • JWT Validation (HTTP-only Cookie)            │              │
│  │  • AuthUserMiddleware (logged-in users)         │              │
│  │  • authMiddleware (admin users)                 │              │
│  └──────────────────────────────────────────────────┘              │
│               │                                                   │
│  ┌────────────┴────────────────────────────────────┐              │
│  │         Route Controllers                       │              │
│  ├──────────────────────────────────────────────────┤              │
│  │ Payment Routes:                                 │              │
│  │  • createSubscription()                         │              │
│  │  • createSubscriptionAdmin()                    │              │
│  │  • getUserSubscriptions()                       │              │
│  │  • createPayment()                              │              │
│  │                                                 │              │
│  │ User Routes:                                    │              │
│  │  • getAllVendors()                              │              │
│  │  • updateVendorStatus()                         │              │
│  │  • getProfile()                                 │              │
│  │  • updateProfile()                              │              │
│  └──────────────────────────────────────────────────┘              │
│               │                                                   │
│  ┌────────────▼────────────────────────────────────┐              │
│  │         Mongoose Models                        │              │
│  ├──────────────────────────────────────────────────┤              │
│  │ • User (username, email, role, phone, address)  │              │
│  │ • Subscription (plan, price, status, dates)    │              │
│  │ • Payment (userId, subscriptionId, amount)      │              │
│  │ • Order (vendorId, items, total, status)        │              │
│  └──────────────────────────────────────────────────┘              │
│               │                                                   │
│  ┌────────────▼────────────────────────────────────┐              │
│  │        MongoDB Database                        │              │
│  │  • collections/users                           │              │
│  │  • collections/subscriptions                   │              │
│  │  • collections/payments                        │              │
│  │  • collections/orders                          │              │
│  │  • collections/vendors                         │              │
│  └──────────────────────────────────────────────────┘              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2️⃣ User Subscription Purchase Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              USER SUBSCRIPTION PURCHASE JOURNEY                │
└─────────────────────────────────────────────────────────────────┘

STEP 1: Browse Subscriptions
┌──────────────────────┐
│    /usermenu         │
│  Select Plan Card    │
│  "Buy Now" Button    │ ← Premium ₹2999 for 1 month
└──────┬───────────────┘
       │
       │ handleBuyPlan('Premium', 2999, 1)
       │
STEP 2: Create Pending Subscription
┌──────▼───────────────────────────────────┐
│  POST /api/payment/subscription/create   │
│  Payload: {                               │
│    plan: 'Premium',                      │
│    price: 2999,                          │
│    months: 1                             │
│  }                                       │
└──────┬───────────────────────────────────┘
       │
       │ Backend: Creates subscription with status='pending'
       │
STEP 3: Navigate to Payment
┌──────▼──────────────────────────────────────┐
│  /payments                                  │
│  location.state = {                         │
│    subscription: {..._id, plan, price...}, │
│    totalAmount: 2999                        │
│  }                                          │
└──────┬──────────────────────────────────────┘
       │
STEP 4: Select Payment Method
┌──────▼──────────────────────────────────────┐
│  Display Payment Options                    │
│  • UPI (Google Pay, PhonePe, Paytm)         │
│  • Card (Visa, Mastercard, RuPay)           │
│  • Wallet (PayTM, MobiKwik)                 │
│  • COD (Cash on Delivery)                   │
└──────┬──────────────────────────────────────┘
       │
STEP 5: Confirm Payment
┌──────▼──────────────────────────────────────┐
│  POST /api/payment/create                   │
│  Payload: {                                  │
│    subscriptionId: subscription._id,        │
│    amount: 2999,                            │
│    paymentMethod: 'upi',                    │
│    transactionId: 'TXN_...'                 │
│  }                                          │
└──────┬──────────────────────────────────────┘
       │
       │ Backend:
       │ 1. Create payment record
       │ 2. Update subscription:
       │    - status = 'active'
       │    - startDate = NOW
       │    - endDate = NOW + 1 month
       │    - paymentInfo = {...}
       │
STEP 6: Success & Redirect
┌──────▼──────────────────────────────────────┐
│  Success Message                            │
│  "✅ Payment successful!"                   │
│  Redirect to /usermenu (after 2 sec)       │
└──────┬──────────────────────────────────────┘
       │
STEP 7: View Subscription in Profile
┌──────▼──────────────────────────────────────┐
│  /user → Subscriptions Section              │
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │ 📅 Premium Plan      [ACTIVE] ✅    │   │
│  │ Duration: 1 month(s)                │   │
│  │ 🗓️ Valid: Jan 1 - Jan 31, 2025     │   │
│  │ ⏳ 25 days remaining                │   │
│  │ ₹2999 /month         [Manage]       │   │
│  └─────────────────────────────────────┘   │
│                                              │
│  (Days counter updates daily)               │
└──────────────────────────────────────────────┘
```

---

## 3️⃣ Admin Subscription Management Flow

```
┌──────────────────────────────────────────────────────────────┐
│         ADMIN SUBSCRIPTION MANAGEMENT JOURNEY               │
└──────────────────────────────────────────────────────────────┘

STEP 1: Admin Login
┌────────────────────────┐
│  /login                │
│  Username: admin       │
│  Password: ****        │
│  JWT Token: Set ✅     │
└────────────┬───────────┘
             │
STEP 2: Access Admin Panel
┌────────────▼───────────────────────────┐
│  /usermenu                              │
│  Click Profile Icon                    │
│  ├─ See "👑 Admin" badge               │
│  ├─ Click "🔧 Admin Panel"             │
└────────────┬───────────────────────────┘
             │
STEP 3: Navigate to Admin Page
┌────────────▼───────────────────────────┐
│  /admin-subscriptions                  │
│  ├─ Create Subscription Section         │
│  └─ Vendor Management Section           │
└────────────┬───────────────────────────┘
             │

─────── CREATE SUBSCRIPTION (Option A: All Users) ───────

STEP 4A: Bulk Subscription
┌────────────▼───────────────────────────┐
│  Select Plan: Gold                     │
│  Price: ₹3999                          │
│  Duration: 3 months                    │
│  ☑️ Apply to all users                 │
│  Click "✅ Create Subscription"        │
└────────────┬───────────────────────────┘
             │
             │ POST /api/payment/subscription/admin/create
             │ Payload: {
             │   plan: 'Gold',
             │   price: 3999,
             │   months: 3,
             │   applyToAll: true
             │ }
             │
┌────────────▼───────────────────────────┐
│  Backend: For each user:               │
│  • Create subscription                 │
│  • Set status = 'pending'              │
│  • Store plan, price, months           │
│                                        │
│  All users now have pending subs       │
└────────────┬───────────────────────────┘
             │
             │ Success Message: "✅ Subscription created"
             │

─────── CREATE SUBSCRIPTION (Option B: Specific User) ───────

STEP 4B: Specific User Subscription
┌────────────▼───────────────────────────┐
│  Select Plan: Standard                 │
│  Price: ₹1999                          │
│  Duration: 1 month                     │
│  ☐ Apply to all users  [UNCHECKED]     │
│  User ID: john@email.com               │
│  Click "✅ Create Subscription"        │
└────────────┬───────────────────────────┘
             │
             │ POST /api/payment/subscription/admin/create
             │ Payload: {
             │   plan: 'Standard',
             │   price: 1999,
             │   months: 1,
             │   applyToAll: false,
             │   userId: 'john@email.com'
             │ }
             │
┌────────────▼───────────────────────────┐
│  Backend:                              │
│  • Find user: john@email.com           │
│  • Create subscription for user only   │
│  • Set status = 'pending'              │
└────────────┬───────────────────────────┘
             │
             │ Success Message: "✅ Subscription created for user"
             │

─────── MANAGE VENDOR STATUS ───────

STEP 5: Update Vendor
┌────────────▼───────────────────────────┐
│  Vendor Dropdown: Select "Pasta Palace"│
│  Status: Change to "Suspended" 🚫      │
│  Click "✅ Update Status"              │
└────────────┬───────────────────────────┘
             │
             │ PUT /api/user/admin/vendors/:vendorId/status
             │ Payload: {
             │   status: 'suspended'
             │ }
             │
┌────────────▼───────────────────────────┐
│  Backend:                              │
│  • Find vendor by ID                   │
│  • Update status field                 │
│  • Save to database                    │
└────────────┬───────────────────────────┘
             │
             │ Success Message: "✅ Vendor updated to suspended"
             │

STEP 6: Verify Changes
┌────────────▼───────────────────────────┐
│  Database Updated ✅                   │
│                                        │
│  For bulk subscriptions:               │
│  • All users have pending subs         │
│  • Users can view in profile           │
│  • Users can pay to activate           │
│                                        │
│  For vendor updates:                   │
│  • Vendor status changed               │
│  • Affects orders from vendor          │
│  • Admin control maintained            │
└────────────────────────────────────────┘
```

---

## 4️⃣ Data Structure & Models

```
USER MODEL
┌─────────────────────────────────────┐
│  {                                  │
│    _id: ObjectId,                   │
│    username: "john",                │
│    email: "john@email.com",         │
│    password: "hashed...",           │
│    phone: "+91-9876543210",         │
│    address: "123 Main St",          │
│    role: "user",          ← admin = administrator    │
│    createdAt: Date,                 │
│    updatedAt: Date                  │
│  }                                  │
└─────────────────────────────────────┘

SUBSCRIPTION MODEL
┌─────────────────────────────────────┐
│  {                                  │
│    _id: ObjectId,                   │
│    userId: ObjectId,      ← User FK │
│    plan: "Premium",       ← Basic/Standard/Premium/Gold │
│    price: 2999,           ← ₹ Amount │
│    months: 1,             ← Duration │
│    status: "active",      ← pending/active/cancelled/expired │
│    startDate: Date,       ← Activation date │
│    endDate: Date,         ← Expiry date (startDate + months) │
│    paymentInfo: {                   │
│      paymentId: ObjectId, ← Payment FK │
│      transactionId: "TXN_...",     │
│      method: "upi"                  │
│    },                               │
│    createdAt: Date,                 │
│    updatedAt: Date                  │
│  }                                  │
└─────────────────────────────────────┘

PAYMENT MODEL
┌─────────────────────────────────────┐
│  {                                  │
│    _id: ObjectId,                   │
│    userId: ObjectId,      ← User FK │
│    subscriptionId: ObjectId, ← Sub FK (NEW) │
│    orderId: ObjectId,     ← Order FK (optional) │
│    amount: 2999,                    │
│    paymentMethod: "upi",            │
│    status: "completed",   ← failed/pending/completed │
│    transactionId: "TXN_1234567890",│
│    paymentDetails: {},              │
│    createdAt: Date,                 │
│    updatedAt: Date                  │
│  }                                  │
└─────────────────────────────────────┘

ORDER MODEL
┌─────────────────────────────────────┐
│  {                                  │
│    _id: ObjectId,                   │
│    userId: ObjectId,      ← User FK │
│    vendorId: ObjectId,    ← Vendor FK │
│    items: [                         │
│      {                              │
│        foodId: ObjectId,            │
│        name: "Pasta Carbonara",     │
│        price: 250,                  │
│        qty: 2                       │
│      }                              │
│    ],                               │
│    total: 500,                      │
│    status: "paid",  ← pending/paid/delivered │
│    paymentInfo: {...},              │
│    createdAt: Date                  │
│  }                                  │
└─────────────────────────────────────┘

VENDOR MODEL
┌─────────────────────────────────────┐
│  {                                  │
│    _id: ObjectId,                   │
│    CompanyName: "Pasta Palace",     │
│    email: "vendor@email.com",       │
│    phone: "+91-9876543210",         │
│    address: "456 Food St",          │
│    status: "active",   ← active/inactive/suspended │
│    role: "vendor",                  │
│    foods: [ObjectId, ...],          │
│    createdAt: Date                  │
│  }                                  │
└─────────────────────────────────────┘
```

---

## 5️⃣ API Endpoints Map

```
AUTHENTICATION ROUTES
├── POST /api/auth/register           → Create user
├── POST /api/auth/login              → Login, set JWT
├── GET  /api/auth/user/profile       → Get user details
├── PUT  /api/auth/user/profile       → Update user
└── GET  /api/auth/user/logout        → Logout

SUBSCRIPTION ROUTES
├── POST /api/payment/subscription/create
│   └─ Create subscription (user)
├── POST /api/payment/subscription/admin/create
│   └─ Create subscription (admin - all or specific)
├── GET  /api/payment/subscription/user
│   └─ Get user's subscriptions
└── GET  /api/payment/subscription/:id
    └─ Get specific subscription

PAYMENT ROUTES
├── POST /api/payment/create          → Process payment
├── GET  /api/payment/user            → Get user payments
├── GET  /api/payment/user/orders     → Get user orders
└── GET  /api/payment/:id             → Get specific payment

VENDOR ROUTES
├── GET  /api/user/admin/vendors      → Get all vendors
├── GET  /api/user/admin/vendors/:id  → Get vendor by ID
├── PUT  /api/user/admin/vendors/:id/status
│   └─ Update vendor status
└── DELETE /api/user/admin/vendors/:id
    └─ Delete vendor

FOOD/ORDER ROUTES
├── GET  /api/food                    → Get all foods
├── GET  /api/food/:id                → Get food details
├── POST /api/food/order              → Create order
└── GET  /api/food/order/:id          → Get order details

SECURITY
├── authMiddleware        ← Admin/Vendor routes
├── AuthUserMiddleware    ← User routes
└── JWT Validation        ← All protected routes
```

---

## 6️⃣ Component State Management

```
USERMENU.jsx
├── State:
│   ├── user (profile data)
│   ├── cart (selected items)
│   ├── foods (menu items)
│   └── ui (profile/cart open)
├── Effects:
│   ├── Fetch user profile
│   ├── Fetch foods list
│   └── Handle outside clicks
└── Functions:
    ├── addToCart()
    ├── placeOrder() → creates orders
    ├── handleBuyPlan() → creates subscription
    └── handleLogout()

USER.jsx
├── State:
│   ├── user (profile data)
│   ├── subscriptions (all subs)
│   ├── orders (user orders)
│   └── editing (edit mode)
├── Effects:
│   ├── Fetch user data
│   ├── Fetch subscriptions
│   └── Fetch orders
└── Functions:
    ├── handleEditClick()
    ├── handleSaveProfile()
    ├── handleLogout()
    └── Display subscription with days calc

ADMINSUBSCRIPTION.jsx
├── State:
│   ├── plan, price, months
│   ├── applyToAll, userId
│   ├── vendors (dropdown list)
│   ├── selectedVendor, vendorStatus
│   └── message (feedback)
├── Effects:
│   └── Load vendors list
└── Functions:
    ├── handleCreate() → POST subscription
    ├── handleUpdateVendor() → PUT status
    └── Form validation

PAYMENTSIMPLEST.jsx
├── State:
│   ├── orders (from location.state)
│   ├── subscription (from location.state)
│   ├── selected (payment method)
│   └── loading, message
├── Effects:
│   └── Handle payment submission
└── Functions:
    └── handlePayment() → POST payment
```

---

## 7️⃣ Authentication & Authorization Flow

```
┌─────────────────────────────────────────────────────────────┐
│           JWT & COOKIE AUTHENTICATION FLOW                │
└─────────────────────────────────────────────────────────────┘

LOGIN:
User → /login → POST /api/auth/login
                  └─ Validate credentials
                  └─ Generate JWT token
                  └─ Set in HTTP-only cookie (name: 'token')
                  └─ Response: user data + token
                  └─ Frontend stores in secure cookie

SUBSEQUENT REQUESTS:
Client → HTTP Request
          ├─ Browser automatically includes cookies
          ├─ axios with withCredentials: true
          └─ Cookie contains JWT token

BACKEND VALIDATION:
Incoming Request
  ├─ Check for 'token' in cookies
  ├─ Verify JWT signature
  ├─ Extract userId from token
  ├─ Attach to req.userId
  └─ Pass to controller

ROLE CHECKING:
Protected Routes:
  ├─ authMiddleware (requires role: 'admin')
  │  └─ admin-only operations
  ├─ AuthUserMiddleware (requires JWT)
  │  └─ user operations
  └─ Unprotected (public info)

AUTHORIZATION:
Route: POST /api/payment/subscription/admin/create
  ├─ Middleware: authMiddleware
  ├─ Check: req.userId exists?
  ├─ Check: User role = 'admin'?
  └─ If both true → Allow
     Else → 401/403 Error

LOGOUT:
User → GET /api/auth/logout
        └─ Clear cookie
        └─ Invalidate token
        └─ Redirect to /login
```

---

## 8️⃣ Days Remaining Calculation

```
CALCULATION LOGIC:

const today = new Date();
const endDate = new Date(subscription.endDate);

const daysRemaining = Math.ceil(
  (endDate - today) / (1000 * 60 * 60 * 24)
);

EXAMPLE:
subscription.startDate = Jan 1, 2025 (when activated)
subscription.months = 1 (duration)
subscription.endDate = Feb 1, 2025 (startDate + 1 month)

Jan 15, 2025:
  endDate - today = Feb 1 - Jan 15 = 17 days
  Display: "⏳ 17 days remaining"

Jan 31, 2025:
  endDate - today = Feb 1 - Jan 31 = 1 day
  Display: "⏳ 1 day remaining"

Feb 1, 2025 (or later):
  endDate - today = 0 or negative
  Display: "⚠️ Subscription expired"
  Status: "Expired"

REAL-TIME UPDATE:
• Calculated fresh on every render
• Days decrease daily
• No manual updates needed
• Accurate based on system clock
```

---

## 9️⃣ Error Handling Flow

```
USER TRYING UNAUTHORIZED ACTION:
├─ User (not admin) tries /admin-subscriptions
├─ Frontend: Routes protect with role check? (Optional)
├─ User proceeds anyway
├─ Backend receives request
├─ authMiddleware checks role
├─ Role ≠ 'admin'
├─ Return 403 Forbidden
├─ Frontend catches error
├─ Display: "❌ Unauthorized access"
└─ Redirect to /usermenu

API ERROR HANDLING:
Try:
  ├─ API Call (POST/GET/PUT)
  ├─ Success → Update UI, show message
  ├─ Error thrown
Catch:
  ├─ Check error.response.status
  ├─ 401 → Redirect to /login
  ├─ 403 → Show unauthorized message
  ├─ 400 → Show form validation error
  ├─ 500 → Show generic error message
Finally:
  └─ Set loading to false

FORM VALIDATION:
handleCreate() called
├─ Check: plan filled?
├─ Check: price > 0?
├─ Check: months > 0?
├─ Check: if not applyToAll, userId filled?
├─ If any missing:
│  └─ setMessage("Please fill required fields")
│  └─ Return early
├─ If all valid:
│  └─ Proceed with API call

LOADING STATES:
├─ Show "⏳ Loading..." while processing
├─ Disable buttons to prevent duplicate submission
├─ Hide on success/error
├─ Clear message after 5 seconds (optional)
```

---

## 🔟 Response Examples

```
LOGIN SUCCESSFUL:
{
  "message": "Login successful",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "admin",
    "email": "admin@email.com",
    "role": "admin",
    "phone": "+91-9876543210"
  }
}

CREATE SUBSCRIPTION:
{
  "message": "Subscription created",
  "subscription": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "plan": "Premium",
    "price": 2999,
    "months": 1,
    "status": "pending",
    "createdAt": "2024-12-09T10:30:00Z"
  }
}

PAYMENT SUCCESSFUL:
{
  "message": "Payment processed successfully",
  "payment": {
    "_id": "507f1f77bcf86cd799439013",
    "subscriptionId": "507f1f77bcf86cd799439012",
    "amount": 2999,
    "status": "completed",
    "transactionId": "TXN_1702100400123"
  }
}

GET SUBSCRIPTIONS:
{
  "subscriptions": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "plan": "Premium",
      "price": 2999,
      "months": 1,
      "status": "active",
      "startDate": "2024-12-01T00:00:00Z",
      "endDate": "2025-01-01T00:00:00Z"
    }
  ]
}

ERROR RESPONSE:
{
  "message": "User not authorized",
  "error": "Unauthorized access"
}
```

---

**These diagrams provide a complete visual reference for the entire system architecture, data flows, and component interactions.**
