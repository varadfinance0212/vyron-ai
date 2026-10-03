const ALLOWED_ORIGIN = "https://varadfinance0212.github.io";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message, language } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    let languageInstruction = "Reply in the same language as the user.";

    if (language === "hi-IN") {
      languageInstruction =
        "Reply naturally in Hindi. You may use simple Hinglish when appropriate.";
    }

    if (language === "gu-IN") {
      languageInstruction =
        "Reply naturally in Gujarati. Use simple, easy-to-understand Gujarati.";
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-6-luna",
        instructions:
          "You are VYRON, a helpful personal AI assistant. " +
          "Be friendly, concise and useful. " +
          languageInstruction,
        input: message
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);

      return res.status(response.status).json({
        error: data.error?.message || "OpenAI request failed"
      });
    }

    return res.status(200).json({
      reply: data.output_text || "Sorry, I could not generate a response."
    });

  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: "VYRON server error"
    });
  }
}
