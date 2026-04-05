export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body

    const { prompt } = body || {}

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" })
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [{ role: "user", content: prompt }]
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(500).json({
        error: "OpenRouter error",
        details: data
      })
    }

    return res.status(200).json({
      output: data.choices?.[0]?.message?.content
    })

  } catch (error) {
    return res.status(500).json({
      error: "Server crash",
      details: error.message
    })
  }
}
// redeploy trigger
// trigger fresh deploy
