const fetch = require("node-fetch");

module.exports = async (req, res) => {
  console.log("API /send-telegram called");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  console.log("Message:", message);

  console.log("TELEGRAM_BOT_TOKEN:", process.env.TELEGRAM_BOT_TOKEN);
  console.log("TELEGRAM_CHAT_ID:", process.env.TELEGRAM_CHAT_ID);

  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    return res.status(500).json({ error: "Missing Telegram environment variables" });
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    const text = await response.text();
    console.log("Telegram API raw response:", text);

    try {
      const data = JSON.parse(text);

      if (!data.ok) {
        console.error("Telegram API returned error:", data);
        return res.status(500).json({ error: "Telegram API error", details: data });
      }

      return res.status(200).json(data);
    } catch (parseError) {
      console.error("Error parsing Telegram response:", parseError);
      return res.status(500).json({ error: "Invalid JSON from Telegram", raw: text });
    }

  } catch (err) {
    console.error("Error sending to Telegram:", err);
    return res.status(500).json({ error: "Telegram send failed", details: err.message });
  }
};
