const express = require("express");
const { createRateLimiter } = require("./middlewares/rateLimiter");
const authenticate = require("./middlewares/authenticate");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");
const voucherRoutes = require("./routes/voucherRoutes");
const promotionRoutes = require("./routes/promotionRoutes");
const applyDiscountRoutes = require("./routes/applyDiscountRoutes");
const authRoutes = require("./routes/authRoutes");
const healthRoutes = require("./routes/healthRoutes");

function buildApp() {
  const app = express();
  app.use(express.json());

  const apiRateLimiter = createRateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: process.env.NODE_ENV === "test" ? 1000 : process.env.MAX_REQUESTS,
  });

  app.use(apiRateLimiter);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/docs.json", (req, res) => res.json(swaggerSpec));
  app.use("/health", healthRoutes);
  app.use("/api/v1/auth", authRoutes);

  const requireAuth = authenticate();

  app.get("/", (req, res) => {
    res.status(200).json({ status: "server is running" });
  });

  app.use("/api/v1/vouchers", requireAuth, voucherRoutes);
  app.use("/api/v1/promotions", requireAuth, promotionRoutes);
  app.use("/api/v1/orders", requireAuth, applyDiscountRoutes);

  return app;
}

module.exports = buildApp();

