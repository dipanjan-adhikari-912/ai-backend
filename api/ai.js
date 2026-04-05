export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { prompt } = req.body

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" })
    }

    console.log("API KEY:", process.env.OPENROUTER_API_KEY)

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    })

    const data = await response.json()

    console.log("OpenRouter response:", data)

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
    console.error("CRASH:", error)

    return res.status(500).json({
      error: "Server crash",
      details: error.message
    })
  }
}
// redeploy trigger
// trigger fresh deploy
