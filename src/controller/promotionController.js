const Promotion = require("../models/Promotion");
const { handleDuplicateKey } = require("../utils/errorResponse");
const { generatePromotionCode, convertToDate } = require("../services");

exports.createPromotion = async (req, res) => {
    try {
        let {
            code,
            eligibleCategories,
            eligibleItems,
            discountType,
            discountValue,
            expirationDate,
            usageLimit
        } = req.body;

        // Validate discount type
        if (!["percentage", "fixed"].includes(discountType)) {
            return res.status(400).json({
                message: "Invalid discountType. Allowed values: percentage, fixed"
            });
        }

        // Convert date if string
        if (typeof expirationDate === "string" && expirationDate.includes("-")) {
            expirationDate = convertToDate(expirationDate);
        }

        const promotion = await Promotion.create({
            code: code || generatePromotionCode(),
            eligibleCategories,
            eligibleItems,
            discountType,
            discountValue,
            expirationDate,
            usageLimit
        });

        res.status(201).json({
            message: "Promotion created successfully",
            promotion
        });
    } catch (error) {
        if (handleDuplicateKey(res, error, "Promotion")) {
            return;
        }
        res.status(400).json({ message: error.message });
    }
};

exports.getPromotions = async (req, res) => {
    try {
        const today = new Date();

        const promotions = await Promotion.find({
            expirationDate: { $gte: today },
            $expr: { $lt: ["$usedCount", "$usageLimit"] }
        });

        res.status(200).json(promotions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.updatePromotion = async (req, res) => {
    try {
        if (req.body.expirationDate && req.body.expirationDate.includes("-")) {
            req.body.expirationDate = convertToDate(req.body.expirationDate);
        }
        const promotion = await Promotion.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!promotion) {
            return res.status(404).json({ message: "Promotion not found" });
        }

        res.json({ message: "Promotion updated", promotion });
    } catch (error) {
        if (handleDuplicateKey(res, error, "Promotion")) {
            return;
        }
        res.status(400).json({ message: error.message });
    }
};

exports.deletePromotion = async (req, res) => {
    try {
        const promotion = await Promotion.findByIdAndDelete(req.params.id);

        if (!promotion) {
            return res.status(404).json({ message: "Promotion not found" });
        }

        res.json({ message: "Promotion deleted", promotion });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
