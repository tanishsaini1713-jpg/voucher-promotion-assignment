const Voucher = require("../models/Voucher");
const Promotion = require("../models/Promotion");
const Order = require("../models/Order");
const { convertToDate } = require("../services");

exports.applyVoucherOrPromotion = async (req, res) => {
  try {
    const { code, order } = req.body;

    if (!code || !order) {
      return res.status(400).json({ message: "Code and order are required" });
    }

    // Prevent re-using code in same order
    if (order.appliedCodes && order.appliedCodes.includes(code.toUpperCase())) {
      return res.status(400).json({ 
        message: "This voucher/promotion has already been applied to this order",
        code: "DISCOUNT_ALREADY_APPLIED"
      });
    }

    // Find voucher first (only active ones)
    let discountObj = await Voucher.findOne({ 
      code: code.toUpperCase(),
      isActive: true
    });
    let type = "voucher";

    // If not found, check promotion (only active ones)
    if (!discountObj) {
      discountObj = await Promotion.findOne({ 
        code: code.toUpperCase(),
        isActive: true
      });
      type = "promotion";
    }

    if (!discountObj) {
      return res.status(404).json({ 
        message: "Voucher/Promotion not found",
        code: "DISCOUNT_NOT_FOUND"
      });
    }

    const now = new Date();

    // Check if active
    if (discountObj.isActive === false) {
      return res.status(400).json({ 
        message: `${type === "voucher" ? "Voucher" : "Promotion"} is not active`,
        code: "DISCOUNT_INACTIVE"
      });
    }

    // Start date check (for promotions)
    if (type === "promotion" && discountObj.startDate && discountObj.startDate > now) {
      return res.status(400).json({ 
        message: "Promotion has not started yet",
        code: "PROMOTION_NOT_STARTED"
      });
    }

    // Expiration check
    if (discountObj.expirationDate < now) {
      return res.status(400).json({ 
        message: `${type === "voucher" ? "Voucher" : "Promotion"} expired`,
        code: "DISCOUNT_EXPIRED",
        expiredDate: discountObj.expirationDate
      });
    }

    // Usage limit check
    if (discountObj.usedCount >= discountObj.usageLimit) {
      return res.status(400).json({ 
        message: `${type === "voucher" ? "Voucher" : "Promotion"} usage limit reached`,
        code: "USAGE_LIMIT_EXCEEDED",
        usageLimit: discountObj.usageLimit,
        usedCount: discountObj.usedCount
      });
    }

    // Eligibility check
    let applicable = false;

    if (type === "voucher") {
      // Check minimum order value
      if (discountObj.minOrderValue && order.total < discountObj.minOrderValue) {
        return res.status(400).json({
          message: `Minimum order value not met. Order total must be at least ${discountObj.minOrderValue}`,
          code: "MIN_ORDER_VALUE_NOT_MET",
          required: discountObj.minOrderValue,
          current: order.total
        });
      }

      // Check applicable products (if specified)
      if (discountObj.applicableProducts && discountObj.applicableProducts.length > 0) {
        const orderItemIds = (order.items || []).map(item => item.id);
        const hasApplicableProduct = orderItemIds.some(id => 
          discountObj.applicableProducts.includes(id)
        );
        
        if (!hasApplicableProduct) {
          return res.status(400).json({
            message: "Voucher not applicable to these products",
            code: "VOUCHER_NOT_APPLICABLE_TO_PRODUCTS",
            applicableProducts: discountObj.applicableProducts
          });
        }
      }

      applicable = true;
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
        return res.status(400).json({ 
          message: "Promotion not applicable to these items or categories",
          code: "PROMOTION_NOT_APPLICABLE",
          eligibleCategories: eligibleCategories,
          eligibleItems: eligibleItems
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (discountObj.discountType === "percentage") {
      discountAmount = (order.total * discountObj.discountValue) / 100;
    } else {
      discountAmount = discountObj.discountValue;
    }

    // Apply maxDiscount if specified (from schema)
    if (discountObj.maxDiscount !== null && discountObj.maxDiscount !== undefined) {
      discountAmount = Math.min(discountAmount, discountObj.maxDiscount);
    }

    // Enforce 50% cap (business rule)
    const maxDiscountCap = order.total * 0.5;
    if (discountAmount > maxDiscountCap) {
      discountAmount = maxDiscountCap;
    }

    // Ensure discount doesn't exceed order total
    if (discountAmount > order.total) {
      discountAmount = order.total;
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
      finalTotal: order.total - discountAmount,
      appliedVoucher: type === "voucher" ? discountObj._id : undefined,
      appliedPromotion: type === "promotion" ? discountObj._id : undefined,
    });

    const populatedOrder = await Order.findById(orderRecord._id).populate([
      { path: "appliedVoucher" },
      { path: "appliedPromotion" },
    ]);

    return res.status(200).json({
      message: "Discount applied successfully",
      order: populatedOrder || orderRecord,
      type: type,
      discountAmount: discountAmount,
      finalTotal: orderRecord.finalTotal
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
