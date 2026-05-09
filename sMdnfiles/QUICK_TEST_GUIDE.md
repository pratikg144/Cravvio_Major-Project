# Quick Test Guide: Usermenu → Payment Flow

## 🚀 Quick Start (5 minutes)

### 1. Start Backend

```bash
cd Backend
node server.js
```

**Expected:** Server running on `http://localhost:3000`

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

**Expected:** Dev server running on `http://localhost:5173`

---

## ✅ Test Flow (5 minutes)

### Step 1: Navigate to Usermenu

- URL: `http://localhost:5173/usermenu`
- **Expected:** Foods loaded from backend, Grid showing all foods with vendor names

### Step 2: Add Items from Different Vendors

1. Scroll through food grid
2. Click "Add" on first food (e.g., Biryani from vendor A)
3. **Expected:**

   - Cart button shows badge "1"
   - Cart drawer opens
   - Item shows vendor name

4. Click "Add" on different vendor's food (e.g., Pizza from vendor B)
5. **Expected:**
   - Cart button shows badge "2"
   - Cart drawer shows both items with different vendor names
   - Each vendor's items clearly separated

### Step 3: Verify Cart Functionality

- Click `-` button to decrease quantity
- **Expected:** Quantity decreases
- Click `+` button to increase quantity
- **Expected:** Quantity increases
- Verify subtotal updates: `₹price × qty`
- Verify total updates at bottom

### Step 4: Place Order

1. Click "Place Order" button in cart footer
2. **Expected:**
   - Loading state shown
   - POST requests sent to backend for each vendor
   - Page navigates to `/payments`
   - Cart clears

### Step 5: Verify Payment Page

1. **Expected page shows:**

   - ✅ Order Summary section
   - ✅ Each vendor listed with items count and amount
   - ✅ Total amount for all orders
   - ✅ Payment method options (UPI, Card, Wallet, COD)

2. Select "Cash on Delivery"
3. **Expected:**
   - COD section appears
   - "Confirm Order" button visible

### Step 6: Confirm Payment

1. Click "Confirm Order" button
2. **Expected:**
   - Loading state: "Processing..."
   - Payment sent to backend
   - Success animation: 🎉 Order Placed!
   - Confetti effect appears
   - "Your delicious meal is on the way!" message
   - After 2.5 seconds: Redirect to `/usermenu`

### Step 7: Verify Database

Open MongoDB Compass or `mongosh`:

```javascript
// Check Orders collection
db.orders.find({ status: "paid" });
// Expected: Orders with status='paid', paymentInfo field populated

// Check Payments collection
db.payments.find({});
// Expected: Payment records with:
// - orderId, vendorId, amount, paymentMethod
// - status: 'completed'
// - transactionId
// - createdAt timestamp
```

---

## 🐛 Troubleshooting

### Issue: Cart doesn't show items

**Solution:**

1. Verify backend is running: `http://localhost:3000`
2. Check browser console for errors
3. Verify foods are fetched: Look for GET `/api/food` request

### Issue: "No Orders Found" on Payment page

**Solution:**

1. Don't refresh the page after clicking "Place Order"
2. Check browser console for POST `/api/food/order` errors
3. Verify user is authenticated (JWT token in cookies)

### Issue: Payment not saving to database

**Solution:**

1. Check backend logs for errors
2. Verify `/api/payment/create` endpoint is accessible
3. Check MongoDB connection in backend
4. Verify AuthUserMiddleware is working (user ID being captured)

### Issue: Confetti not showing

**Solution:**

- This is optional visual effect
- Payment is still saved even if confetti fails
- Check browser console for canvas-confetti errors

---

## 📊 Expected Flow Summary

```
START → Add items → Cart (multi-vendor) → Place Order → Backend creates orders
  ↓                                                            ↓
Navigate to /payments ← Receives order data from state ← Returns order IDs
  ↓
Select COD → Confirm → POST /api/payment/create × 2 (if 2 vendors)
  ↓
Backend saves payments → Updates order status to 'paid'
  ↓
Success! → Confetti → Redirect to /usermenu
  ↓
Check Database: Orders and Payments saved ✅
```

---

## ✅ Success Criteria

All items below should be true after complete flow:

- [ ] Cart shows correct item count and vendor names
- [ ] Cart total calculates correctly
- [ ] Payment page shows all vendors and correct totals
- [ ] Payment submitted without errors
- [ ] Success message and confetti displayed
- [ ] Redirected back to /usermenu
- [ ] MongoDB `orders` collection has entries with status='paid'
- [ ] MongoDB `payments` collection has payment records
- [ ] Payment records have correct orderId, vendorId, amount, paymentMethod

**If all above are ✅, your system is working perfectly!**
