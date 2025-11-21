const express = require("express");
const {
  createVoucher,
  getVouchers,
  getVoucherById,
  updateVoucher,
  deleteVoucher
} = require("../controller/voucherController");
const { validateVoucher } = require("../middlewares/validate");

const router = express.Router();

// Standard REST conventions - order matters: specific routes before parameterized ones
router.post("/", validateVoucher, createVoucher);           // POST /api/v1/vouchers
router.get("/", getVouchers);                                // GET /api/v1/vouchers
router.get("/:id", getVoucherById);                         // GET /api/v1/vouchers/:id (must be after /)
router.put("/:id", updateVoucher);                          // PUT /api/v1/vouchers/:id
router.delete("/:id", deleteVoucher);                       // DELETE /api/v1/vouchers/:id

module.exports = router;
