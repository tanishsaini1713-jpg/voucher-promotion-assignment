const request = require("supertest");
const app = require("../src/app");

jest.mock("../src/models/Voucher", () => ({
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

jest.mock("../src/models/Promotion", () => ({
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

jest.mock("../src/models/Order", () => ({
  create: jest.fn(),
  findById: jest.fn(),
}));

const Voucher = require("../src/models/Voucher");
const Promotion = require("../src/models/Promotion");
const Order = require("../src/models/Order");

const getAuthToken = async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      username: process.env.AUTH_USERNAME,
      password: process.env.AUTH_PASSWORD,
    });

    if (response.status !== 200) {
      throw new Error("Unable to retrieve auth token for tests");
    }

    return response.body.token;
  };

describe("API routes", () => {
  let authToken;

  beforeAll(async () => {
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_EXPIRES_IN = "1h";
    process.env.AUTH_USERNAME = "admin";
    process.env.AUTH_PASSWORD = "password";
    process.env.NODE_ENV = "test";

    authToken = await getAuthToken();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Auth API", () => {
    it("issues a token for valid credentials", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        username: process.env.AUTH_USERNAME,
        password: process.env.AUTH_PASSWORD,
      });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
    });

    it("rejects invalid credentials", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        username: "wrong",
        password: "creds",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/invalid/i);
    });
  });

  describe("Voucher API", () => {
    it("creates a voucher successfully", async () => {
      Voucher.create.mockResolvedValue({
        _id: "1",
        code: "SAVE10",
      });

      const response = await request(app)
        .post("/api/v1/vouchers")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          code: "SAVE10",
          discountType: "percentage",
          discountValue: 10,
          expirationDate: "31-12-2099",
          usageLimit: 10,
          minOrderValue: 0,
        });

      expect(response.status).toBe(201);
      expect(Voucher.create).toHaveBeenCalled();
    });

    it("returns conflict when voucher code already exists", async () => {
      Voucher.create.mockRejectedValue({
        code: 11000,
        keyValue: { code: "BLACKFRIDAY" },
      });

      const response = await request(app)
        .post("/api/v1/vouchers")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          code: "BLACKFRIDAY",
          discountType: "percentage",
          discountValue: 10,
          expirationDate: "31-12-2099",
          usageLimit: 10,
          minOrderValue: 0,
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toMatch(/already exists/i);
    });

    it("lists active vouchers", async () => {
      const voucherList = [
        { _id: "1", code: "SAVE10" },
        { _id: "2", code: "SAVE20" },
      ];
      Voucher.find.mockResolvedValue(voucherList);

      const response = await request(app)
        .get("/api/v1/vouchers")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(voucherList);
    });
  });

  describe("Promotion API", () => {
    it("creates a promotion successfully", async () => {
      Promotion.create.mockResolvedValue({
        _id: "1",
        code: "PROMO10",
      });

      const response = await request(app)
        .post("/api/v1/promotions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          code: "PROMO10",
          eligibleCategories: ["electronics"],
          eligibleItems: [],
          discountType: "fixed",
          discountValue: 100,
          expirationDate: "31-12-2099",
          usageLimit: 5,
        });

      expect(response.status).toBe(201);
      expect(Promotion.create).toHaveBeenCalled();
    });

    it("lists active promotions", async () => {
      const promotions = [{ _id: "1", code: "PROMO10" }];
      Promotion.find.mockResolvedValue(promotions);

      const response = await request(app)
        .get("/api/v1/promotions")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(promotions);
    });
  });

  describe("Order API", () => {
    it("applies a voucher to an order", async () => {
      const voucherDoc = {
        _id: "voucher123",
        code: "SAVE10",
        discountType: "percentage",
        discountValue: 10,
        expirationDate: new Date("2099-12-31"),
        usageLimit: 5,
        usedCount: 0,
        minOrderValue: 0,
        isActive: true,
        maxDiscount: null,
        save: jest.fn().mockResolvedValue(true),
      };

      Voucher.findOne.mockResolvedValue(voucherDoc);
      const createdOrder = {
        _id: "order1",
        items: [],
        total: 100,
        appliedCodes: ["SAVE10"],
        discountAmount: 10,
        finalTotal: 90,
        appliedVoucher: "voucher123",
      };

      const populatedOrder = {
        ...createdOrder,
        appliedVoucher: { _id: "voucher123", code: "SAVE10" },
        appliedPromotion: null,
      };

      const populateMock = jest.fn().mockResolvedValue(populatedOrder);

      Order.create.mockResolvedValue(createdOrder);
      Order.findById.mockReturnValue({
        populate: populateMock,
      });

      const response = await request(app)
        .post("/api/v1/orders/apply-discount")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          code: "SAVE10",
          order: {
            total: 100,
            items: [
              { id: "item1", price: 50, quantity: 2 }
            ],
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.order.finalTotal).toBe(90);
      expect(response.body.order.appliedVoucher.code).toBe("SAVE10");
      expect(voucherDoc.save).toHaveBeenCalled();
      expect(Order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          appliedVoucher: "voucher123",
          appliedPromotion: undefined,
        })
      );
      expect(Order.findById).toHaveBeenCalledWith("order1");
      expect(populateMock).toHaveBeenCalledWith([
        { path: "appliedVoucher" },
        { path: "appliedPromotion" },
      ]);
    });

    it("returns 404 when voucher or promotion not found", async () => {
      Voucher.findOne.mockResolvedValue(null);
      Promotion.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/v1/orders/apply-discount")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          code: "UNKNOWN",
          order: {
            total: 50,
            items: [
              { id: "item1", price: 50, quantity: 1 }
            ],
          },
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/i);
    });
  });
});

