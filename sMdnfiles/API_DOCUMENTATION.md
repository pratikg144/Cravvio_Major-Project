# API Endpoints Documentation

## Base URL

```
http://localhost:3000/api/auth
```

---

## Authentication Endpoints

### 1. User Registration

**Endpoint:** `POST /user/register`

**Description:** Register a new user account

**Request Body:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Secure@123",
  "phone": "+91 9876543210",
  "address": "123 Main Street, New York",
  "pincode": "10001"
}
```

**Response (Success - 201):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Response (Error - 400):**

```json
{
  "message": "user already Exist"
}
```

**Status Codes:**

- `201` - User created successfully
- `400` - User already exists or validation error
- `500` - Server error

---

### 2. User Login

**Endpoint:** `POST /user/login`

**Description:** Login with user credentials

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "Secure@123"
}
```

**Response (Success - 200):**

```json
{
  "message": "User Logged in successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Response (Error - 400):**

```json
{
  "message": "invalid email or Password"
}
```

**Cookies Set:** `token=<JWT_TOKEN>`

**Status Codes:**

- `200` - Login successful
- `400` - Invalid credentials
- `500` - Server error

---

### 3. User Logout

**Endpoint:** `GET /user/logout`

**Description:** Logout user and clear session

**Request Headers:**

```
Cookie: token=<JWT_TOKEN>
```

**Response (Success - 200):**

```json
{
  "message": "User logout successfully"
}
```

**Status Codes:**

- `200` - Logout successful
- `500` - Server error

---

### 4. Get User Profile

**Endpoint:** `GET /user/profile`

**Description:** Retrieve authenticated user's profile

**Authentication:** Required (JWT Token in Cookie)

**Request Headers:**

```
Cookie: token=<JWT_TOKEN>
Content-Type: application/json
```

**Response (Success - 200):**

```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "phone": "+91 9876543210",
    "address": "123 Main Street, New York",
    "pincode": "10001"
  }
}
```

**Response (Error - 401):**

```json
{
  "message": "Unauthorized: please login first"
}
```

**Status Codes:**

- `200` - Profile retrieved
- `401` - Unauthorized (invalid or missing token)
- `404` - User not found
- `500` - Server error

---

## Vendor Endpoints

### 5. Vendor Registration

**Endpoint:** `POST /vendor/register`

**Description:** Register a new vendor account

**Request Body:**

```json
{
  "CompanyName": "FoodHub Restaurant",
  "email": "vendor@foodhub.com",
  "password": "VendorPass@123",
  "phone": "+91 9876543211",
  "address": "456 Business Plaza, Mumbai",
  "pincode": "400001"
}
```

**Response (Success - 201):**

```json
{
  "message": "Vendor registered successfully",
  "vendor": {
    "id": "507f1f77bcf86cd799439012",
    "CompanyName": "FoodHub Restaurant",
    "email": "vendor@foodhub.com"
  }
}
```

**Response (Error - 400):**

```json
{
  "message": "Vendor already Exist"
}
```

**Status Codes:**

- `201` - Vendor created
- `400` - Vendor exists or validation error
- `500` - Server error

---

### 6. Vendor Login

**Endpoint:** `POST /vendor/login`

**Description:** Login with vendor credentials

**Request Body:**

```json
{
  "email": "vendor@foodhub.com",
  "password": "VendorPass@123"
}
```

**Response (Success - 200):**

```json
{
  "message": "Vendor Logged in successfully",
  "vendor": {
    "id": "507f1f77bcf86cd799439012",
    "CompanyName": "FoodHub Restaurant",
    "email": "vendor@foodhub.com"
  }
}
```

**Cookies Set:** `token=<JWT_TOKEN>`

---

### 7. Vendor Logout

**Endpoint:** `GET /vendor/logout`

**Description:** Logout vendor

**Response (Success - 200):**

```json
{
  "message": "Vendor logout successfully"
}
```

---

### 8. Get Vendor Profile

**Endpoint:** `GET /vendor/profile`

**Description:** Retrieve authenticated vendor's profile

**Authentication:** Required (JWT Token in Cookie)

**Response (Success - 200):**

```json
{
  "vendor": {
    "id": "507f1f77bcf86cd799439012",
    "CompanyName": "FoodHub Restaurant",
    "email": "vendor@foodhub.com",
    "phone": "+91 9876543211",
    "address": "456 Business Plaza, Mumbai",
    "pincode": "400001"
  }
}
```

**Status Codes:**

- `200` - Profile retrieved
- `401` - Unauthorized
- `404` - Vendor not found
- `500` - Server error

---

## Admin Endpoints

### 9. Admin Registration

**Endpoint:** `POST /admin/register`

**Description:** Register a new admin account

**Request Body:**

```json
{
  "owner": "Admin Master",
  "email": "admin@cravvio.com",
  "password": "AdminPass@123",
  "phone": "+91 9876543212",
  "address": "789 Admin Center, Delhi",
  "pincode": "110001"
}
```

**Response (Success - 201):**

```json
{
  "message": "Admin registered successfully",
  "admin": {
    "id": "507f1f77bcf86cd799439013",
    "owner": "Admin Master",
    "email": "admin@cravvio.com"
  }
}
```

---

### 10. Admin Login

**Endpoint:** `POST /admin/login`

**Description:** Login with admin credentials

**Request Body:**

```json
{
  "email": "admin@cravvio.com",
  "password": "AdminPass@123"
}
```

**Response (Success - 200):**

```json
{
  "message": "Admin Logged in successfully",
  "admin": {
    "id": "507f1f77bcf86cd799439013",
    "owner": "Admin Master",
    "email": "admin@cravvio.com"
  }
}
```

---

### 11. Admin Logout

**Endpoint:** `GET /admin/logout`

**Description:** Logout admin

**Response (Success - 200):**

```json
{
  "message": "Admin logout successfully"
}
```

---

### 12. Get Admin Profile

**Endpoint:** `GET /admin/profile`

**Description:** Retrieve authenticated admin's profile

**Authentication:** Required (JWT Token in Cookie)

**Response (Success - 200):**

```json
{
  "admin": {
    "id": "507f1f77bcf86cd799439013",
    "owner": "Admin Master",
    "email": "admin@cravvio.com",
    "phone": "+91 9876543212",
    "address": "789 Admin Center, Delhi",
    "pincode": "110001"
  }
}
```

---

## Error Responses

### Common Error Codes

**401 Unauthorized**

```json
{
  "message": "Unauthorized: please login first"
}
```

**401 Invalid Token**

```json
{
  "message": "Unauthorized: Invalid token"
}
```

**404 Not Found**

```json
{
  "message": "User not found"
}
```

**500 Server Error**

```json
{
  "message": "Error fetching user profile",
  "error": "error details"
}
```

---

## Authentication Flow

### Request with Authentication

All protected endpoints require the JWT token to be sent as a cookie:

```bash
curl -X GET http://localhost:3000/api/auth/user/profile \
  -H "Content-Type: application/json" \
  -b "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Response Headers

After login, the server sets:

```
Set-Cookie: token=<JWT_TOKEN>; HttpOnly; Secure; SameSite=Strict
```

---

## Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  username: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phone: String (required),
  address: String (required),
  pincode: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

### Vendor Collection

```javascript
{
  _id: ObjectId,
  CompanyName: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phone: String (required),
  address: String (required),
  pincode: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

### Admin Collection

```javascript
{
  _id: ObjectId,
  owner: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phone: String (required),
  address: String (required),
  pincode: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Response Status Codes

| Code | Meaning                                |
| ---- | -------------------------------------- |
| 200  | OK - Request successful                |
| 201  | Created - Resource created             |
| 400  | Bad Request - Invalid input            |
| 401  | Unauthorized - Authentication required |
| 404  | Not Found - Resource not found         |
| 500  | Server Error - Internal error          |

---

## Request/Response Format

### All requests should include:

```
Content-Type: application/json
```

### Request body encoding:

```
UTF-8
```

### Response format:

```
JSON
```

---

## Rate Limiting

Currently: No rate limiting implemented

## Pagination

Currently: Not implemented (all endpoints return single resources)

## Filtering

Currently: Not implemented

## Sorting

Currently: Not implemented

---

## Security Notes

✅ **HTTPS:** Use HTTPS in production
✅ **CORS:** Configured for localhost:5173
✅ **Password:** Hashed with bcryptjs (10 rounds)
✅ **Tokens:** HTTP-only cookies (secure)
✅ **CSRF:** Protected by cookie policy

⚠️ **To Implement:**

- Refresh tokens
- Rate limiting
- Request validation
- HTTPS only in production
- CORS whitelist
- Input sanitization

---

## Example Client Implementation

### Using Fetch API

**Register:**

```javascript
fetch("http://localhost:3000/api/auth/user/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
  body: JSON.stringify({
    username: "john_doe",
    email: "john@example.com",
    password: "Secure@123",
    phone: "+91 9876543210",
    address: "123 Main St",
    pincode: "10001",
  }),
});
```

**Get Profile:**

```javascript
fetch("http://localhost:3000/api/auth/user/profile", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include", // Include cookies
});
```

### Using Axios

**Register:**

```javascript
axios.post(
  "http://localhost:3000/api/auth/user/register",
  {
    username: "john_doe",
    email: "john@example.com",
    password: "Secure@123",
    phone: "+91 9876543210",
    address: "123 Main St",
    pincode: "10001",
  },
  {
    withCredentials: true, // Send cookies
  }
);
```

---

## Version Information

- API Version: 1.0.0
- Backend Framework: Express 5.1.0
- Database: MongoDB 9.0.0
- Authentication: JWT (jsonwebtoken 9.0.2)

---

## Support

For issues or questions, check:

1. Browser console (DevTools)
2. Server logs
3. MongoDB collections
4. Environment variables (.env)

---

This documentation covers all API endpoints with examples, error handling, and implementation details!
