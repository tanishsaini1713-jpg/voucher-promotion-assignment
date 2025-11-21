# Postman API Testing Guide

This guide will help you set up and test the Voucher & Promotion Management API using Postman.

## 📦 Files Included

1. **Voucher_Promotion_API.postman_collection.json** - Complete API collection
2. **Postman_Environment.postman_environment.json** - Environment variables

## 🚀 Quick Setup

### Step 1: Import Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select `Voucher_Promotion_API.postman_collection.json`
4. Click **Import**

### Step 2: Import Environment

1. Click **Import** again
2. Select `Postman_Environment.postman_environment.json`
3. Click **Import**
4. Select the environment from the dropdown (top right): **"Voucher Promotion API Environment"**

### Step 3: Configure Environment (Optional)

If you want to test locally:
1. Click the environment dropdown (top right)
2. Click the eye icon to view/edit variables
3. Change `base_url` to `http://localhost:5000` (or keep production URL)

## 🔐 Authentication Flow

### Step 1: Login
1. Go to **Auth → Login** request
2. Update credentials if needed (default: `admin` / `supersecret`)
3. Click **Send**
4. The token will be **automatically saved** to `auth_token` variable

### Step 2: Use Token
- All other requests automatically use `{{auth_token}}` in Authorization header
- Token is valid for the duration specified in `JWT_EXPIRES_IN` (default: 1h)

## 📋 Available Endpoints

### 🔵 Health
- **GET /health** - Check server status

### 🔵 Auth
- **POST /api/v1/auth/login** - Get JWT token

### 🔵 Vouchers
- **POST /api/v1/vouchers** - Create voucher
- **GET /api/v1/vouchers** - List all active vouchers
- **GET /api/v1/vouchers/:id** - Get voucher by ID
- **PUT /api/v1/vouchers/:id** - Update voucher
- **DELETE /api/v1/vouchers/:id** - Delete voucher

### 🔵 Promotions
- **POST /api/v1/promotions** - Create promotion
- **GET /api/v1/promotions** - List all active promotions
- **GET /api/v1/promotions/:id** - Get promotion by ID
- **PUT /api/v1/promotions/:id** - Update promotion
- **DELETE /api/v1/promotions/:id** - Delete promotion

### 🔵 Orders
- **POST /api/v1/orders/apply-discount** - Apply voucher/promotion to order
- **POST /api/v1/orders/:orderId/discounts/apply** - Alternative route

## 🧪 Testing Scenarios

### Scenario 1: Create and Use Voucher

1. **Login** → Get token
2. **Create Voucher** → Use example payload:
   ```json
   {
     "code": "SAVE10",
     "discountType": "percentage",
     "discountValue": 10,
     "expirationDate": "31-12-2025",
     "usageLimit": 100,
     "minOrderValue": 50
   }
   ```
3. **Apply Discount** → Use the voucher code in order request

### Scenario 2: Create and Use Promotion

1. **Login** → Get token
2. **Create Promotion** → Use example payload:
   ```json
   {
     "code": "SUMMER20",
     "eligibleCategories": ["Electronics"],
     "discountType": "percentage",
     "discountValue": 20,
     "expirationDate": "31-12-2025",
     "usageLimit": 500
   }
   ```
3. **Apply Discount** → Order must contain items from eligible categories

### Scenario 3: Error Testing

Test these error cases:
- **Expired Voucher** → Use past expiration date
- **Usage Limit** → Apply same code multiple times
- **Min Order Value** → Order total below minimum
- **Invalid Code** → Use non-existent code
- **Already Applied** → Apply same code twice to same order

## 📝 Request Examples

### Create Voucher
```json
{
  "code": "BLACKFRIDAY",
  "discountType": "fixed",
  "discountValue": 20,
  "expirationDate": "30-11-2025",
  "usageLimit": 1000,
  "minOrderValue": 100,
  "maxDiscount": 50,
  "isActive": true
}
```

### Apply Discount
```json
{
  "code": "SAVE10",
  "order": {
    "total": 100,
    "items": [
      {
        "id": "item123",
        "name": "Product Name",
        "category": "Electronics",
        "price": 100,
        "quantity": 1
      }
    ],
    "appliedCodes": []
  }
}
```

## 🔍 Response Examples

### Successful Voucher Creation
```json
{
  "message": "Voucher created successfully",
  "voucher": {
    "_id": "692019ac9d53bced3a430293",
    "code": "SAVE10",
    "discountType": "percentage",
    "discountValue": 10,
    "expirationDate": "2025-12-31T23:59:59.000Z",
    "usageLimit": 100,
    "usedCount": 0,
    "minOrderValue": 50,
    "isActive": true
  }
}
```

### Successful Discount Application
```json
{
  "message": "Discount applied successfully",
  "order": {
    "_id": "69203e269f1b2f12cd23bdc5",
    "total": 100,
    "discountAmount": 10,
    "finalTotal": 90,
    "appliedVoucher": {
      "_id": "692019ac9d53bced3a430293",
      "code": "SAVE10",
      "discountType": "percentage",
      "discountValue": 10
    },
    "appliedPromotion": null
  },
  "type": "voucher",
  "discountAmount": 10,
  "finalTotal": 90
}
```

### Error Response
```json
{
  "message": "Voucher expired",
  "code": "DISCOUNT_EXPIRED",
  "expiredDate": "2024-11-20T00:00:00.000Z"
}
```

## 🛠️ Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `base_url` | API base URL | `https://voucher-promotion-assignment.onrender.com` |
| `base_url_local` | Local API URL | `http://localhost:5000` |
| `auth_token` | JWT token (auto-set) | (empty) |
| `username` | Login username | `admin` |
| `password` | Login password | `supersecret` |

## 💡 Tips

1. **Auto Token Management**: Login request automatically saves token - no manual copy/paste needed
2. **Environment Switching**: Switch between production/local by changing `base_url` variable
3. **Variable Usage**: Use `{{variable_name}}` syntax in requests
4. **Test Scripts**: Login request has a test script that saves token automatically
5. **Collection Organization**: Requests are organized by feature (Auth, Vouchers, Promotions, Orders)

## 🐛 Troubleshooting

### Token Not Working
- Check if token expired (default: 1 hour)
- Re-run Login request to get new token
- Verify token is saved in environment variables

### 401 Unauthorized
- Ensure you've logged in first
- Check Authorization header format: `Bearer <token>`
- Verify token is not expired

### 404 Not Found
- Check base URL is correct
- Verify endpoint path matches API routes
- Ensure server is running

### 400 Bad Request
- Check request body format (JSON)
- Verify required fields are present
- Check validation rules in API documentation

### 429 Too Many Requests
- Rate limit exceeded (default: 5 requests/minute)
- Wait a minute or adjust rate limiter settings

## 📚 Additional Resources

- **Swagger Docs**: `https://voucher-promotion-assignment.onrender.com/docs`
- **API Documentation**: See `README.md` and `SCHEMA_DOCUMENTATION.md`
- **Improvements Summary**: See `IMPROVEMENTS_SUMMARY.md`

---

**Happy Testing! 🚀**

