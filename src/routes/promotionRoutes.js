const express = require("express");
const {
  createPromotion,
  getPromotions,
  updatePromotion,
  deletePromotion
} = require("../controller/promotionController");

const router = express.Router();

router.post("/add", createPromotion);
router.get("/", getPromotions);
router.put("/:id", updatePromotion);
router.delete("/:id", deletePromotion);

module.exports = router;
