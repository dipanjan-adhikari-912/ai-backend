export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    // Read raw body (Vercel-safe)
    const rawBody = await new Promise((resolve) => {
      let data = ""
      req.on("data", (chunk) => (data += chunk))
      req.on("end", () => resolve(data))
    })

    const body = rawBody ? JSON.parse(rawBody) : {}
    const prompt = body.prompt

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" })
    }

    // Model fallback (all available for your key)
    const models = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-flash-latest"
    ]

    let lastError = null

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }]
                }
              ]
            })
          }
        )

        const data = await response.json()

        if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          return res.status(200).json({
            output: data.candidates[0].content.parts[0].text,
            model_used: model
          })
        }

        lastError = data
      } catch (err) {
        lastError = err.message
      }
    }

    return res.status(500).json({
      error: "All models failed",
      details: lastError
    })

  } catch (error) {
    return res.status(500).json({
      error: "Server crash",
      details: error.message
    })
  }
}
}
// redeploy trigger
// trigger fresh deploy
