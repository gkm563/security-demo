
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ error: "Telegram is not configured" });
  }

  const body = req.body || {};
  const clean = (value, max = 300) =>
    typeof value === "string"
      ? value.replace(/[\r\n]/g, " ").slice(0, max)
      : "Unknown";

  // Vercel supplies the request's forwarded IP header.
  const forwarded = req.headers["x-forwarded-for"];
  const ip = clean(
    typeof forwarded === "string" ? forwarded.split(",")[0].trim() : "",
    80
  );

  const message = [
    "🔎 Cybersecurity Demo — Visit Report",
    "",
    `Time: ${new Date().toISOString()}`,
    `IP: ${ip}`,
    `Browser: ${clean(body.userAgent)}`,
    `Language: ${clean(body.language, 50)}`,
    `Timezone: ${clean(body.timezone, 100)}`,
    `Screen: ${clean(body.screen, 30)}`,
    `Platform: ${clean(body.platform, 100)}`
  ].join("\n");

  try {
    const response = await fetch(
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

    if (!response.ok) {
      return res.status(502).json({ error: "Telegram delivery failed" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(502).json({ error: "Could not send Telegram alert" });
  }
};
