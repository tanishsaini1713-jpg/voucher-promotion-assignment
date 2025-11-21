const express = require("express");
const {
  createVoucher,
  getVouchers,
  updateVoucher,
  deleteVoucher
} = require("../controller/voucherController");

const router = express.Router();

router.post("/add", createVoucher);
router.get("/get/all", getVouchers);
router.put("/:id", updateVoucher);
router.delete("/:id", deleteVoucher);

module.exports = router;
