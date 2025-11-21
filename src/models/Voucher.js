const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed","regular"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      required: true,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Voucher", voucherSchema);
