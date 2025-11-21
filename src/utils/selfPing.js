const DEFAULT_INTERVAL = 14 * 60 * 1000; // 14 minutes

function startSelfPing({
  url,
  intervalMs = DEFAULT_INTERVAL,
  enabled = true,
  logger = console,
} = {}) {
  if (!enabled) {
    return null;
  }

  if (!url) {
    logger.warn("selfPing: URL is not defined. Skipping keep-alive pings.");
    return null;
  }

  if (typeof fetch !== "function") {
    logger.warn("selfPing: fetch is not available in this runtime.");
    return null;
  }

  async function ping() {
    try {
      const res = await fetch(url, { method: "GET" });
      logger.debug?.(
        `selfPing: ${url} responded with status ${res.status}`
      );
    } catch (error) {
      logger.warn?.(`selfPing: Failed to ping ${url} - ${error.message}`);
    }
  }

  ping();
  const timer = setInterval(ping, intervalMs);

  return () => clearInterval(timer);
}

module.exports = {
  startSelfPing,
};

