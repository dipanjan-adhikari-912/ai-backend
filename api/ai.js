export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { prompt } = req.body

    // Basic validation
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" })
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a sharp product design assistant. Be concise, specific, and avoid generic fluff.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    })

    const data = await response.json()

    // Handle OpenAI errors
    if (!response.ok) {
      return res.status(500).json({
        error: data.error?.message || "OpenAI API error",
      })
    }

    const output =
      data.choices?.[0]?.message?.content || "No response generated"

    return res.status(200).json({ output })
  } catch (error) {
    return res.status(500).json({
      error: "Server error. Check logs.",
    })
  }
}
// redeploy trigger
