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
  "/api/v1/vouchers/add": {
    post: {
      tags: ["Vouchers"],
      summary: "Create a new voucher",
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
          description: "Voucher created",
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
  },
  "/api/v1/vouchers/get/all": {
    get: {
      tags: ["Vouchers"],
      summary: "List active vouchers",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Array of vouchers",
        },
      },
    },
  },
  "/api/v1/vouchers/{id}": {
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
  "/api/v1/promotions/add": {
    post: {
      tags: ["Promotions"],
      summary: "Create a promotion",
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
  },
  "/api/v1/promotions": {
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

