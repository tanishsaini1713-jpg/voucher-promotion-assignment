const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    eligibleCategories: {
      type: [String],
      default: []
    },
    eligibleItems: {
      type: [String],
      default: []
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true
    },
    discountValue: {
      type: Number,
      required: true
    },
    expirationDate: {
      type: Date,
      required: true
    },
    usageLimit: {
      type: Number,
      required: true
    },
    usedCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Promotion", promotionSchema);
