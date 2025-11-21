const express = require("express");
const {
  createPromotion,
  getPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion
} = require("../controller/promotionController");
const { validatePromotion } = require("../middlewares/validate");

const router = express.Router();

// Standard REST conventions
router.post("/", validatePromotion, createPromotion);       // POST /api/v1/promotions
router.get("/", getPromotions);                              // GET /api/v1/promotions
router.get("/:id", getPromotionById);                       // GET /api/v1/promotions/:id
router.put("/:id", updatePromotion);                        // PUT /api/v1/promotions/:id
router.delete("/:id", deletePromotion);                      // DELETE /api/v1/promotions/:id

module.exports = router;
