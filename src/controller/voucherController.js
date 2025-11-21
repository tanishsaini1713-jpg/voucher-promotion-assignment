const Voucher = require("../models/Voucher");
const { handleDuplicateKey } = require("../utils/errorResponse");
const { generateVoucherCode, convertToDate } = require("../services");

exports.createVoucher = async (req, res) => {
    try {
        let {
            code,
            discountType,
            discountValue,
            expirationDate,
            usageLimit,
            minOrderValue
        } = req.body;
        if (expirationDate.includes("-")) {
            expirationDate = convertToDate(expirationDate);
        }
        const voucherCode = code || generateVoucherCode();

        const voucher = await Voucher.create({
            code: voucherCode,
            discountType,
            discountValue,
            expirationDate,
            usageLimit,
            minOrderValue
        });

        res.status(201).json({
            message: "Voucher created successfully",
            voucher
        });
    } catch (error) {
        if (handleDuplicateKey(res, error, "Voucher")) {
            return;
        }
        res.status(400).json({ message: error.message });
    }
};
exports.getVouchers = async (req, res) => {
  try {
    const today = new Date();

    const vouchers = await Voucher.find({
      expirationDate: { $gte: today },
      $expr: { $lt: ["$usedCount", "$usageLimit"] } // Compare usedCount < usageLimit
    });

    res.status(200).json(vouchers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateVoucher = async (req, res) => {
    try {
        if (req.body.expirationDate && req.body.expirationDate.includes("-")) {
            req.body.expirationDate = convertToDate(req.body.expirationDate);
        }
        const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        });

        if (!voucher) {
            return res.status(404).json({ message: "Voucher not found" });
        }

        res.json({
            message: "Voucher updated successfully",
            voucher
        });
    } catch (error) {
        if (handleDuplicateKey(res, error, "Voucher")) {
            return;
        }
        res.status(400).json({ message: error.message });
    }
};

exports.deleteVoucher = async (req, res) => {
    try {
        const voucher = await Voucher.findByIdAndDelete(req.params.id);

        if (!voucher) {
            return res.status(404).json({ message: "Voucher not found" });
        }

        res.json({
            message: "Voucher deleted successfully",
            voucher
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
