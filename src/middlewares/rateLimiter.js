const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_MAX_REQUESTS = 100;

// Simple in-memory store for rate-limiting counters
// Map<identifier, { count: number, resetTime: number }>
const counters = new Map();

function createRateLimiter(options = {}) {
  const {
    windowMs = DEFAULT_WINDOW_MS,
    maxRequests = DEFAULT_MAX_REQUESTS,
    identifier = (req) => req.ip || req.headers["x-forwarded-for"] || "global",
    onLimitReached,
  } = options;

  if (windowMs <= 0) {
    throw new Error("rateLimiter: windowMs must be greater than 0");
  }

  if (maxRequests <= 0) {
    throw new Error("rateLimiter: maxRequests must be greater than 0");
  }

  return function rateLimiter(req, res, next) {
    const key = identifier(req);
    const now = Date.now();

    if (!counters.has(key)) {
      counters.set(key, { count: 0, resetTime: now + windowMs });
    }

    const counter = counters.get(key);

    if (now > counter.resetTime) {
      counter.count = 0;
      counter.resetTime = now + windowMs;
    }

    counter.count += 1;

    const remaining = Math.max(maxRequests - counter.count, 0);
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(counter.resetTime / 1000));

    if (counter.count > maxRequests) {
      if (typeof onLimitReached === "function") {
        onLimitReached(req, res, options);
      }
      return res.status(429).json({
        message: "Too many requests, please try again later.",
      });
    }

    return next();
  };
}

module.exports = {
  createRateLimiter,
};

