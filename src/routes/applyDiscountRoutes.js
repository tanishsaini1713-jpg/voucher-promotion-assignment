const express = require("express");
const { applyVoucherOrPromotion } = require("../controller/orderController");

const router = express.Router();

router.post("/apply-discount", applyVoucherOrPromotion);

module.exports = router;
