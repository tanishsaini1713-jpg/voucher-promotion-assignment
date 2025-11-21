# Database Schema Documentation

## Overview
This document describes the database schemas for the Voucher & Promotion Management Service. The system uses MongoDB with Mongoose ODM to manage vouchers, promotions, and orders with their relationships.

---

## 1. Voucher Schema

### Purpose
Stores discount vouchers that can be applied to orders based on minimum order value requirements.

### Fields

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| `code` | String | ✅ Yes | - | Unique, Uppercase, Trimmed | Voucher code (e.g., "SAVE10", "BLACKFRIDAY") |
| `discountType` | String | ✅ Yes | - | Enum: `["percentage", "fixed", "regular"]` | Type of discount calculation |
| `discountValue` | Number | ✅ Yes | - | - | Discount amount (percentage or fixed value) |
| `expirationDate` | Date | ✅ Yes | - | - | When the voucher expires |
| `usageLimit` | Number | ✅ Yes | - | - | Maximum number of times voucher can be used |
| `usedCount` | Number | ❌ No | `0` | - | Current usage count (auto-incremented) |
| `minOrderValue` | Number | ❌ No | `0` | - | Minimum order total required to use voucher |
| `createdAt` | Date | Auto | Auto | - | Timestamp when created |
| `updatedAt` | Date | Auto | Auto | - | Timestamp when last updated |

### Business Rules
- **Unique Code**: Each voucher code must be unique across the system
- **Case Insensitive**: Codes are automatically converted to uppercase
- **Expiration**: Vouchers become invalid after `expirationDate`
- **Usage Tracking**: `usedCount` cannot exceed `usageLimit`
- **Minimum Order**: Voucher only applies if order total ≥ `minOrderValue`

### Example Document
```json
{
  "_id": "692019ac9d53bced3a430293",
  "code": "BLACKFRIDAY",
  "discountType": "fixed",
  "discountValue": 20,
  "expirationDate": "2024-12-31T23:59:59.000Z",
  "usageLimit": 1000,
  "usedCount": 45,
  "minOrderValue": 100,
  "createdAt": "2024-11-01T10:00:00.000Z",
  "updatedAt": "2024-11-15T14:30:00.000Z"
}
```

---

## 2. Promotion Schema

### Purpose
Stores promotional discounts that can be applied to specific products or categories.

### Fields

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| `code` | String | ✅ Yes | - | Unique, Uppercase, Trimmed | Promotion code (e.g., "SUMMER20") |
| `eligibleCategories` | Array[String] | ❌ No | `[]` | - | Product categories this promotion applies to |
| `eligibleItems` | Array[String] | ❌ No | `[]` | - | Specific product IDs this promotion applies to |
| `discountType` | String | ✅ Yes | - | Enum: `["percentage", "fixed"]` | Type of discount calculation |
| `discountValue` | Number | ✅ Yes | - | - | Discount amount (percentage or fixed value) |
| `expirationDate` | Date | ✅ Yes | - | - | When the promotion expires |
| `usageLimit` | Number | ✅ Yes | - | - | Maximum number of times promotion can be used |
| `usedCount` | Number | ❌ No | `0` | - | Current usage count (auto-incremented) |
| `createdAt` | Date | Auto | Auto | - | Timestamp when created |
| `updatedAt` | Date | Auto | Auto | - | Timestamp when last updated |

### Business Rules
- **Unique Code**: Each promotion code must be unique across the system
- **Eligibility**: Promotion only applies if order contains items matching `eligibleItems` or `eligibleCategories`
- **Expiration**: Promotions become invalid after `expirationDate`
- **Usage Tracking**: `usedCount` cannot exceed `usageLimit`

### Example Document
```json
{
  "_id": "692019ac9d53bced3a430294",
  "code": "ELECTRONICS15",
  "eligibleCategories": ["Electronics", "Gadgets"],
  "eligibleItems": ["item123", "item456"],
  "discountType": "percentage",
  "discountValue": 15,
  "expirationDate": "2024-12-31T23:59:59.000Z",
  "usageLimit": 500,
  "usedCount": 120,
  "createdAt": "2024-11-01T10:00:00.000Z",
  "updatedAt": "2024-11-15T14:30:00.000Z"
}
```

---

## 3. Order Schema

### Purpose
Stores order information with applied discounts and relationships to vouchers/promotions.

### Fields

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| `items` | Array[Object] | ✅ Yes | - | - | Order line items (see OrderItem sub-schema) |
| `total` | Number | ✅ Yes | - | - | Original order total before discount |
| `appliedCodes` | Array[String] | ❌ No | `[]` | - | List of voucher/promotion codes applied |
| `appliedVoucher` | ObjectId | ❌ No | `null` | Ref: "Voucher" | Reference to Voucher document (if voucher used) |
| `appliedPromotion` | ObjectId | ❌ No | `null` | Ref: "Promotion" | Reference to Promotion document (if promotion used) |
| `discountAmount` | Number | ❌ No | `0` | - | Total discount applied (capped at 50% of order total) |
| `finalTotal` | Number | ✅ Yes | - | - | Final amount after discount (`total - discountAmount`) |
| `createdAt` | Date | Auto | Auto | - | Timestamp when created |
| `updatedAt` | Date | Auto | Auto | - | Timestamp when last updated |

### OrderItem Sub-Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String | ✅ Yes | Product/item identifier |
| `name` | String | ❌ No | Product name |
| `category` | String | ❌ No | Product category |
| `price` | Number | ✅ Yes | Unit price |
| `quantity` | Number | ✅ Yes | Quantity ordered |

### Business Rules
- **Single Discount**: Only one voucher OR one promotion can be applied per order
- **Duplicate Prevention**: Same code cannot be applied twice to the same order
- **Discount Cap**: Maximum discount is 50% of order total (enforced in application logic)
- **Relationships**: Order maintains references to the actual Voucher/Promotion documents used
- **Populated Response**: API returns full voucher/promotion details when querying orders

### Example Document
```json
{
  "_id": "69203e269f1b2f12cd23bdc5",
  "items": [
    {
      "id": "item123",
      "name": "Laptop",
      "category": "Electronics",
      "price": 800,
      "quantity": 1
    },
    {
      "id": "item456",
      "name": "T-Shirt",
      "category": "Clothing",
      "price": 400,
      "quantity": 1
    }
  ],
  "total": 1200,
  "appliedCodes": ["BLACKFRIDAY"],
  "appliedVoucher": "692019ac9d53bced3a430293",
  "appliedPromotion": null,
  "discountAmount": 20,
  "finalTotal": 1180,
  "createdAt": "2024-11-21T10:25:42.656Z",
  "updatedAt": "2024-11-21T10:25:42.656Z"
}
```

---

## Relationships

### Order → Voucher/Promotion
- **Type**: One-to-One (optional)
- **Implementation**: ObjectId references with Mongoose population
- **Fields**: 
  - `appliedVoucher`: References `Voucher._id` (if voucher was applied)
  - `appliedPromotion`: References `Promotion._id` (if promotion was applied)
- **Behavior**: 
  - Only one of `appliedVoucher` or `appliedPromotion` will be set per order
  - API responses populate these references to return full voucher/promotion details
  - Enables tracking which specific discount was used and auditing discount usage

### Data Flow
1. User applies voucher/promotion code to an order
2. System validates code (expiration, usage limit, eligibility)
3. System creates Order document with:
   - Reference to Voucher or Promotion document
   - Calculated discount amount
   - Final total
4. System increments `usedCount` on the Voucher/Promotion document
5. API returns Order with populated voucher/promotion details

---

## Indexes

### Current Indexes
- **Voucher.code**: Unique index (enforced by Mongoose `unique: true`)
- **Promotion.code**: Unique index (enforced by Mongoose `unique: true`)

### Recommended Future Indexes
- `Voucher.expirationDate` + `Voucher.usedCount` (for active voucher queries)
- `Promotion.expirationDate` + `Promotion.usedCount` (for active promotion queries)
- `Order.createdAt` (for order history/reporting)
- `Order.appliedVoucher` / `Order.appliedPromotion` (for relationship queries)

---

## Validation Rules

### Voucher Validation
- ✅ Code must be unique
- ✅ Code is automatically uppercased
- ✅ `discountType` must be one of: `percentage`, `fixed`, `regular`
- ✅ `discountValue` must be a positive number
- ✅ `expirationDate` must be a valid date
- ✅ `usageLimit` must be a positive number
- ✅ `minOrderValue` must be ≥ 0

### Promotion Validation
- ✅ Code must be unique
- ✅ Code is automatically uppercased
- ✅ `discountType` must be one of: `percentage`, `fixed`
- ✅ `discountValue` must be a positive number
- ✅ `expirationDate` must be a valid date
- ✅ `usageLimit` must be a positive number
- ✅ `eligibleCategories` and `eligibleItems` are arrays of strings

### Order Validation
- ✅ `items` array must contain at least one item
- ✅ Each item must have `id`, `price`, and `quantity`
- ✅ `total` must match sum of (item.price × item.quantity)
- ✅ `finalTotal` = `total - discountAmount`
- ✅ `discountAmount` cannot exceed 50% of `total` (enforced in application logic)

---

## API Response Examples

### Order with Populated Voucher
```json
{
  "message": "Discount applied successfully",
  "order": {
    "_id": "69203e269f1b2f12cd23bdc5",
    "items": [...],
    "total": 1200,
    "appliedCodes": ["BLACKFRIDAY"],
    "appliedVoucher": {
      "_id": "692019ac9d53bced3a430293",
      "code": "BLACKFRIDAY",
      "discountType": "fixed",
      "discountValue": 20,
      "expirationDate": "2024-12-31T23:59:59.000Z",
      "usageLimit": 1000,
      "usedCount": 46,
      "minOrderValue": 100
    },
    "appliedPromotion": null,
    "discountAmount": 20,
    "finalTotal": 1180
  },
  "type": "voucher",
  "discountAmount": 20,
  "finalTotal": 1180
}
```

---

## Summary

- **3 Main Collections**: Vouchers, Promotions, Orders
- **Relationships**: Orders reference Vouchers/Promotions via ObjectId
- **Constraints**: Unique codes, usage limits, expiration dates
- **Business Logic**: Discount caps (50%), eligibility checks, duplicate prevention
- **Audit Trail**: Timestamps on all documents, usage tracking on discounts

---

**Last Updated**: November 2024  
**Database**: MongoDB  
**ODM**: Mongoose

