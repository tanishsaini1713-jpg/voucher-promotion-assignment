const connectWithRetry = require("./src/db/db");
const app = require("./src/app");
const { startSelfPing } = require("./src/utils/selfPing");

connectWithRetry({
    maxRetries: 15,
    retryDelay: 2000,
});

const port = process.env.PORT || 3000;
const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${port}`;

const server = app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`)
    console.log(`🛠️  Service running on ${baseUrl}/`)
    console.log(`🔒 Rate Limiter: ${process.env.MAX_REQUESTS || 5} requests per minute`)
    console.log(`📘 Swagger running on ${baseUrl}/docs`)

    startSelfPing({
        url: process.env.SELF_PING_URL || `${baseUrl}/`,
        intervalMs: Number(process.env.SELF_PING_INTERVAL_MS) || undefined,
        enabled: process.env.SELF_PING_ENABLED !== "false" && process.env.NODE_ENV !== "test",
    });
});

module.exports = server;
