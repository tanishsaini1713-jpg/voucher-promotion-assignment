const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String },
  category: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema(
  {
    items: [orderItemSchema],
    total: { type: Number, required: true },
    appliedCodes: { type: [String], default: [] }, // vouchers/promotions applied
    discountAmount: { type: Number, default: 0 },
    finalTotal: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
