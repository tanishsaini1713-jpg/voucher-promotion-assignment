const express = require("express");
const { applyVoucherOrPromotion } = require("../controller/orderController");
const { validateOrderDiscount } = require("../middlewares/validate");

const router = express.Router();

// Improved REST structure: POST /api/v1/orders/:orderId/discounts/apply
// For now, keeping simpler structure but with better naming
router.post("/:orderId/discounts/apply", validateOrderDiscount, applyVoucherOrPromotion);
// Keep backward compatibility
router.post("/apply-discount", validateOrderDiscount, applyVoucherOrPromotion);

module.exports = router;
