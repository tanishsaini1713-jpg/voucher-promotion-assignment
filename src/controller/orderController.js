const Voucher = require("../models/Voucher");
const Promotion = require("../models/Promotion");
const Order = require("../models/Order");

function convertToDate(ddmmyyyy) {
  const [day, month, year] = ddmmyyyy.split("-");
  return new Date(year, month - 1, day);
}

exports.applyVoucherOrPromotion = async (req, res) => {
  try {
    const { code, order } = req.body;

    if (!code || !order) {
      return res.status(400).json({ message: "Code and order are required" });
    }

    // Prevent re-using code in same order
    if (order.appliedCodes && order.appliedCodes.includes(code.toUpperCase())) {
      return res
        .status(400)
        .json({ message: "This voucher/promotion has already been applied to this order" });
    }

    // Find voucher first
    let discountObj = await Voucher.findOne({ code: code.toUpperCase() });
    let type = "voucher";

    // If not found, check promotion
    if (!discountObj) {
      discountObj = await Promotion.findOne({ code: code.toUpperCase() });
      type = "promotion";
    }

    if (!discountObj) {
      return res.status(404).json({ message: "Voucher/Promotion not found" });
    }

    const now = new Date();

    // Expiration check
    if (discountObj.expirationDate < now) {
      return res.status(400).json({ message: "Voucher/Promotion expired" });
    }

    // Usage limit check
    if (discountObj.usedCount >= discountObj.usageLimit) {
      return res.status(400).json({ message: "Usage limit exceeded" });
    }

    // Eligibility check
    let applicable = false;

    if (type === "voucher") {
      if (!discountObj.minOrderValue || order.total >= discountObj.minOrderValue) {
        applicable = true;
      } else {
        return res.status(400).json({
          message: `Order total must be at least ${discountObj.minOrderValue} to use this voucher`
        });
      }
    }

    if (type === "promotion") {
      const items = order.items || [];
      const eligibleCategories = discountObj.eligibleCategories || [];
      const eligibleItems = discountObj.eligibleItems || [];

      applicable = items.some(
        (item) =>
          eligibleItems.includes(item.id) || eligibleCategories.includes(item.category)
      );

      if (!applicable) {
        return res
          .status(400)
          .json({ message: "Promotion not applicable to these items" });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (discountObj.discountType === "percentage") {
      discountAmount = (order.total * discountObj.discountValue) / 100;
      const maxDiscount = order.total * 0.5; // max 50%
      if (discountAmount > maxDiscount) discountAmount = maxDiscount;
    } else {
      discountAmount = discountObj.discountValue;
      if (discountAmount > order.total * 0.5) discountAmount = order.total * 0.5;
    }

    // Increment used count
    discountObj.usedCount += 1;
    await discountObj.save();

    // Save order with applied discount
    const orderRecord = await Order.create({
      items: order.items,
      total: order.total,
      appliedCodes: [...(order.appliedCodes || []), discountObj.code],
      discountAmount: discountAmount,
      finalTotal: order.total - discountAmount
    });

    return res.status(200).json({
      message: "Discount applied successfully",
      order: orderRecord,
      type: type,
      discountAmount: discountAmount,
      finalTotal: orderRecord.finalTotal
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
