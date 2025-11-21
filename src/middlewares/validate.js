/**
 * Validation middleware for request bodies
 */

function validateVoucher(req, res, next) {
  const { discountType, discountValue, expirationDate, usageLimit } = req.body;

  const errors = [];

  if (!discountType || !["percentage", "fixed", "regular"].includes(discountType)) {
    errors.push("discountType is required and must be one of: percentage, fixed, regular");
  }

  if (discountValue === undefined || discountValue === null || discountValue < 0) {
    errors.push("discountValue is required and must be a non-negative number");
  }

  if (!expirationDate) {
    errors.push("expirationDate is required");
  }

  if (!usageLimit || usageLimit < 1) {
    errors.push("usageLimit is required and must be at least 1");
  }

  if (req.body.minOrderValue !== undefined && req.body.minOrderValue < 0) {
    errors.push("minOrderValue must be a non-negative number");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: "Validation failed",
      errors,
    });
  }

  next();
}

function validatePromotion(req, res, next) {
  const { discountType, discountValue, expirationDate, usageLimit } = req.body;

  const errors = [];

  if (!discountType || !["percentage", "fixed"].includes(discountType)) {
    errors.push("discountType is required and must be one of: percentage, fixed");
  }

  if (discountValue === undefined || discountValue === null || discountValue < 0) {
    errors.push("discountValue is required and must be a non-negative number");
  }

  if (!expirationDate) {
    errors.push("expirationDate is required");
  }

  if (!usageLimit || usageLimit < 1) {
    errors.push("usageLimit is required and must be at least 1");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: "Validation failed",
      errors,
    });
  }

  next();
}

function validateOrderDiscount(req, res, next) {
  const { code, order } = req.body;

  const errors = [];

  if (!code || typeof code !== "string" || code.trim().length === 0) {
    errors.push("code is required and must be a non-empty string");
  }

  if (!order) {
    errors.push("order is required");
  } else {
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      errors.push("order.items is required and must be a non-empty array");
    }

    if (order.total === undefined || order.total === null || order.total < 0) {
      errors.push("order.total is required and must be a non-negative number");
    }

    // Validate items structure
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item, index) => {
        if (!item.id) {
          errors.push(`order.items[${index}].id is required`);
        }
        if (item.price === undefined || item.price < 0) {
          errors.push(`order.items[${index}].price is required and must be non-negative`);
        }
        if (item.quantity === undefined || item.quantity < 1) {
          errors.push(`order.items[${index}].quantity is required and must be at least 1`);
        }
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: "Validation failed",
      errors,
    });
  }

  next();
}

module.exports = {
  validateVoucher,
  validatePromotion,
  validateOrderDiscount,
};

