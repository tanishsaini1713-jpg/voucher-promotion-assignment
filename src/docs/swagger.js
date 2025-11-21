const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Voucher & Promotion Management Service",
      version: "1.0.0",
      description:
        "API documentation for managing vouchers, promotions, and applying discounts to orders.",
    },
    servers: [
      {
        url: "https://voucher-promotion-assignment.onrender.com",
        description: "Production server",
      },
      {
        url: "http://localhost:{port}",
        description: "Local server",
        variables: {
          port: {
            default: "3000",
          },
        },
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        VoucherInput: {
          type: "object",
          required: [
            "discountType",
            "discountValue",
            "expirationDate",
            "usageLimit",
            "minOrderValue",
          ],
          properties: {
            code: { type: "string", example: "SAVE10" },
            discountType: {
              type: "string",
              enum: ["percentage", "fixed", "regular"],
            },
            discountValue: { type: "number", example: 10 },
            expirationDate: {
              type: "string",
              description: "dd-mm-yyyy format or ISO date",
              example: "31-12-2099",
            },
            usageLimit: { type: "number", example: 100 },
            minOrderValue: { type: "number", example: 0 },
          },
        },
        PromotionInput: {
          type: "object",
          required: [
            "discountType",
            "discountValue",
            "expirationDate",
            "usageLimit",
          ],
          properties: {
            code: { type: "string", example: "PROMO10" },
            eligibleCategories: {
              type: "array",
              items: { type: "string" },
            },
            eligibleItems: {
              type: "array",
              items: { type: "string" },
            },
            discountType: {
              type: "string",
              enum: ["percentage", "fixed"],
            },
            discountValue: { type: "number", example: 15 },
            expirationDate: {
              type: "string",
              example: "31-12-2099",
            },
            usageLimit: { type: "number", example: 10 },
          },
        },
        OrderDiscountRequest: {
          type: "object",
          required: ["code", "order"],
          properties: {
            code: {
              type: "string",
              description: "Voucher or promotion code to apply",
            },
            order: {
              type: "object",
              required: ["total", "items"],
              properties: {
                total: { type: "number", example: 250 },
                appliedCodes: {
                  type: "array",
                  items: { type: "string" },
                },
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      name: { type: "string" },
                      category: { type: "string" },
                      price: { type: "number" },
                      quantity: { type: "number" },
                    },
                  },
                },
              },
            },
          },
        },
        ApiError: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

swaggerSpec.paths = {
  "/health": {
    get: {
      tags: ["Health"],
      summary: "Health check endpoint",
      description: "Returns server health status including database connection",
      responses: {
        200: {
          description: "Server is healthy",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "ok" },
                  timestamp: { type: "string", example: "2024-11-21T10:25:42.656Z" },
                  uptime: { type: "number", example: 12345.67 },
                  database: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "connected" },
                      connected: { type: "boolean", example: true },
                    },
                  },
                  environment: { type: "string", example: "production" },
                  version: { type: "string", example: "1.0.0" },
                },
              },
            },
          },
        },
        503: {
          description: "Server is unhealthy",
        },
      },
    },
  },
  "/api/v1/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Login with static credentials to receive JWT",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["username", "password"],
              properties: {
                username: { type: "string", example: "admin" },
                password: { type: "string", example: "password" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "JWT issued",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  token: { type: "string" },
                  expiresIn: { type: "string" },
                },
              },
            },
          },
        },
        401: {
          description: "Invalid credentials",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
            },
          },
        },
      },
    },
  },
  "/api/v1/vouchers": {
    post: {
      tags: ["Vouchers"],
      summary: "Create a new voucher",
      description: "Creates a new voucher with validation. Code is auto-generated if not provided.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/VoucherInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Voucher created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Voucher created successfully" },
                  voucher: {
                    type: "object",
                    properties: {
                      _id: { type: "string", example: "692019ac9d53bced3a430293" },
                      code: { type: "string", example: "SAVE10" },
                      discountType: { type: "string", example: "percentage" },
                      discountValue: { type: "number", example: 10 },
                      expirationDate: { type: "string", format: "date-time" },
                      usageLimit: { type: "number", example: 100 },
                      usedCount: { type: "number", example: 0 },
                      minOrderValue: { type: "number", example: 0 },
                      isActive: { type: "boolean", example: true },
                    },
                  },
                },
              },
            },
          },
        },
        409: {
          description: "Duplicate code",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
            },
          },
        },
        400: {
          description: "Validation error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
            },
          },
        },
      },
    },
    get: {
      tags: ["Vouchers"],
      summary: "List active vouchers",
      description: "Returns all active, non-expired vouchers that haven't reached usage limit",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Array of active vouchers",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    _id: { type: "string" },
                    code: { type: "string", example: "SAVE10" },
                    discountType: { type: "string" },
                    discountValue: { type: "number" },
                    expirationDate: { type: "string", format: "date-time" },
                    usageLimit: { type: "number" },
                    usedCount: { type: "number" },
                    minOrderValue: { type: "number" },
                    isActive: { type: "boolean" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/v1/vouchers/{id}": {
    get: {
      tags: ["Vouchers"],
      summary: "Get voucher by ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Voucher details" },
        404: { description: "Voucher not found" },
      },
    },
    put: {
      tags: ["Vouchers"],
      summary: "Update voucher",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "string" },
        },
      ],
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/VoucherInput" },
          },
        },
      },
      responses: {
        200: { description: "Updated voucher" },
        404: { description: "Not found" },
      },
    },
    delete: {
      tags: ["Vouchers"],
      summary: "Delete voucher",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Deleted" },
        404: { description: "Not found" },
      },
    },
  },
  "/api/v1/promotions": {
    post: {
      tags: ["Promotions"],
      summary: "Create a promotion",
      description: "Creates a new promotion with category/item eligibility rules",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/PromotionInput" },
          },
        },
      },
      responses: {
        201: { description: "Promotion created" },
        409: { description: "Duplicate code" },
        400: { description: "Validation error" },
      },
    },
    get: {
      tags: ["Promotions"],
      summary: "List active promotions",
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "Array of promotions" },
      },
    },
  },
  "/api/v1/promotions/{id}": {
    get: {
      tags: ["Promotions"],
      summary: "Get promotion by ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Promotion details" },
        404: { description: "Promotion not found" },
      },
    },
    put: {
      tags: ["Promotions"],
      summary: "Update promotion",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "string" },
        },
      ],
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/PromotionInput" },
          },
        },
      },
      responses: {
        200: { description: "Updated promotion" },
        404: { description: "Not found" },
      },
    },
    delete: {
      tags: ["Promotions"],
      summary: "Delete promotion",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Deleted" },
        404: { description: "Not found" },
      },
    },
  },
  "/api/v1/orders/apply-discount": {
    post: {
      tags: ["Orders"],
      summary: "Apply voucher or promotion to an order",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/OrderDiscountRequest" },
          },
        },
      },
      responses: {
        200: { description: "Discount applied" },
        400: { description: "Invalid request" },
        404: { description: "Voucher/Promotion not found" },
      },
    },
  },
};

module.exports = swaggerSpec;

