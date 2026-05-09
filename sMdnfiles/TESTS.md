Manual and API smoke tests

1. Start servers

- Backend: from `Backend` run:

```bash
node server.js
```

- Frontend: from `frontend` run (with PowerShell blocked use cmd):

```bash
npm run dev
```

2. Admin login (dev admin seeded)

- POST /api/auth/admin/login with seeded credentials (or use UI login at /login)
- Confirm cookie is set in browser (HttpOnly cookie)

3. Vendor approval flow

- GET /api/user/admin/vendors?limit=10 (should return `vendors` array)
- PUT /api/user/admin/vendors/:id/status with body { "status": "approved" }
- Expect 200 and response `{ message, vendor }` with `vendor.status === 'approved'`
- GET /api/admin/stats should reflect `approvedVendors`/`activeVendors` increase

Curl example (use cookie from login):

```bash
# list vendors
curl -c cookies.txt http://localhost:3000/api/user/admin/vendors?limit=10

# approve vendor (replace VENDOR_ID)
curl -b cookies.txt -X PUT -H "Content-Type: application/json" -d '{"status":"approved"}' http://localhost:3000/api/user/admin/vendors/VENDOR_ID/status
```

4. Subscription admin create & approve

- POST /api/payment/subscription/admin/create with { plan, price, months, applyToAll } (admin cookie)
- GET /api/payment/subscription/all should list subscriptions
- PUT /api/payment/subscription/:id/approve should set subscription.status === 'active'
- Verify GET /api/admin/stats updated if your business logic connects subscriptions to revenue

5. Orders admin listing

- GET /api/admin/orders?page=1&limit=20 should return { orders } with populated `userId` and `vendorId` objects
- Confirm each order row shows user and vendor data in the admin orders UI

6. Payments & support

- GET /api/admin/payments should return `payments` (requires admin cookie)
- POST /api/support to create a support ticket, GET /api/support to list, PUT /api/support/:id/resolve to resolve

Notes

- If you get 401 responses, ensure the admin login has set the auth cookie and the frontend uses `withCredentials: true`.
- Use browser devtools to confirm requests, payloads, and responses.

If you'd like, I can run these checks here (login + sample approve) and fix any remaining mismatches.
