# Voucher & Promotion Management Service

Backend service for creating vouchers and promotions, applying discounts to orders, and exposing JWT-protected REST APIs. Includes rate limiting, Swagger docs, self-ping keep-alive, and Jest tests.

## Features
- JWT authentication with configurable credentials.
- Vouchers and promotions CRUD with unique code enforcement.
- Discount application endpoint with eligibility checks, capped discounts (≤50%), and populated voucher/promotion references on the resulting order.
- Rate limiting middleware.
- Auto-generated Swagger docs (`/docs`).
- Self-ping keep-alive for Render free tier.
- Jest + Supertest test suite.

## Prerequisites
- Node.js 18+ (built-in fetch is used).
- MongoDB connection string.

## Setup
1. Clone the repo and install packages:
   ```bash
   npm install
   ```
2. Copy the sample env file and update values:
   ```bash
   cp env.example .env
   ```
3. Verify `.env` (or Render env vars) contains the following:
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://...
   AUTH_USERNAME=admin
   AUTH_PASSWORD=supersecret
   JWT_SECRET=change_me
   JWT_EXPIRES_IN=1h
   PUBLIC_BASE_URL=https://your-app.onrender.com
   SELF_PING_ENABLED=true
   SELF_PING_URL=https://your-app.onrender.com/
   SELF_PING_INTERVAL_MS=840000
   ```
   Adjust as needed; leave `PUBLIC_BASE_URL` and `SELF_PING_URL` blank for local development.

## Running Locally
```bash
npm start
```
Console output shows service URL, Swagger endpoint, and rate-limiter settings.

## Swagger Docs
- Interactive: `http://localhost:PORT/docs`
- Raw JSON: `http://localhost:PORT/docs.json`

## Authentication Flow
1. `POST /api/v1/auth/login` with `{ "username": AUTH_USERNAME, "password": AUTH_PASSWORD }`.
2. Use the returned JWT in `Authorization: Bearer <token>` header for all other endpoints.

## Key Endpoints
- `POST /api/v1/vouchers/add` – create voucher.
- `GET /api/v1/vouchers/get/all` – list active vouchers.
- `PUT /api/v1/vouchers/:id` / `DELETE /api/v1/vouchers/:id`.
- `POST /api/v1/promotions/add`, `GET /api/v1/promotions`, `PUT/DELETE /api/v1/promotions/:id`.
- `POST /api/v1/orders/apply-discount` – apply voucher/promotion to an order.

Refer to Swagger docs for full request/response schemas.

## Testing
```
npm test
```
Runs Jest suite covering auth, voucher, promotion, and order flows with mocked models.

## Deployment Notes
- Ensure `.env` values are set in production (Render) dashboard.
- Keep `SELF_PING_ENABLED=true` and `SELF_PING_URL` pointing to the public base URL to prevent free-tier sleep.
- Whitelist your hosting provider’s outbound IP/CIDR blocks (or use `0.0.0.0/0` temporarily) in MongoDB Atlas so the connection succeeds.
- For multiple instances, consider replacing the in-memory rate limiter with a distributed store (Redis).

## Project Structure
```
src/
  app.js                Express app wiring
  controller/           Business logic per resource
  routes/               Route definitions
  models/               Mongoose schemas
  services/             Shared helpers (code generation, date parsing, env validation)
  middlewares/          Rate limiter & JWT auth
  docs/swagger.js       OpenAPI spec
  utils/                Error helpers & self ping
tests/
  app.test.js           Supertest suite
env.example             Sample configuration template
```

## Troubleshooting
- **Swagger blank**: ensure server is running and correct `PORT`.
- **Auth failures**: confirm `AUTH_USERNAME/PASSWORD` match request body.
- **Mongo connection errors**: verify `MONGO_URI` and network access.
- **Too many requests**: adjust rate limiter via `src/middlewares/rateLimiter.js` or environment variable if externalized.

For additional questions, open an issue or contact the maintainer.

