
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ error: "Missing Telegram configuration" });
  }

  const b = req.body || {};
  const clean = (v, max = 300) =>
    typeof v === "string"
      ? v.replace(/[\r\n]/g, " ").slice(0, max)
      : "Unavailable";

  const forwarded = req.headers["x-forwarded-for"];
  const ip = typeof forwarded === "string"
    ? forwarded.split(",")[0].trim()
    : clean(req.headers["x-real-ip"], 80);

  const screen = b.screen || {};
  const viewport = b.viewport || {};
  const caps = b.capabilities || {};

  const message = [
    "🛡 CYBERSECURITY LAB — VISIT REPORT",
    "━━━━━━━━━━━━━━━━━━━━",
    `Event ID: ${clean(b.eventId, 60)}`,
    `Server timestamp: ${new Date().toISOString()}`,
    `Client timestamp: ${clean(b.clientTimestamp, 60)}`,
    `Event: ${clean(b.eventType, 40)}`,
    "",
    "NETWORK",
    `Request IP: ${clean(ip, 80)}`,
    `Method: ${req.method}`,
    `Request ID: ${clean(req.headers["x-vercel-id"], 120)}`,
    "",
    "BROWSER",
    `User-Agent: ${clean(b.userAgent)}`,
    `Platform: ${clean(b.platform, 100)}`,
    `Language: ${clean(b.language, 50)}`,
    `Languages: ${clean(
      Array.isArray(b.languages) ? b.languages.join(", ") : ""
    )}`,
    `Timezone: ${clean(b.timezone, 100)}`,
    "",
    "DISPLAY",
    `Screen: ${Number(screen.width) || 0} x ${Number(screen.height) || 0}`,
    `Color depth: ${Number(screen.colorDepth) || 0}`,
    `Pixel ratio: ${Number(screen.pixelRatio) || 0}`,
    `Viewport: ${Number(viewport.width) || 0} x ${Number(viewport.height) || 0}`,
    "",
    "CAPABILITIES",
    `Cookies enabled: ${Boolean(caps.cookiesEnabled)}`,
    `Browser online: ${Boolean(caps.online)}`,
    `Touch points: ${Number(caps.touchPoints) || 0}`,
    `Referrer origin: ${clean(b.referrerOrigin, 150)}`,
    `Page path: ${clean(b.pagePath, 150)}`,
    "━━━━━━━━━━━━━━━━━━━━",
    "Cybersecurity educational demonstration"
  ].join("\n");

  try {
    const tg = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message
        })
      }
    );

    if (!tg.ok) {
      return res.status(502).json({ error: "Telegram delivery failed" });
    }

    return res.status(200).json({ success: true });
  } catch {
    return res.status(502).json({ error: "Telegram request failed" });
  }
};
