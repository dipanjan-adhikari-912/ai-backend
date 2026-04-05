export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    let body = req.body

    if (!body || Object.keys(body).length === 0) {
      let raw = ""
      for await (const chunk of req) {
        raw += chunk
      }
      body = raw ? JSON.parse(raw) : {}
    }

    const { prompt } = body

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" })
    }

    // 🔥 Model fallback list (priority order)
    const models = [
      "qwen/qwen3.6-plus:free"
      "openchat/openchat-7b",
      "google/gemma-7b-it",
      "nousresearch/nous-capybara-7b"
    ]

    let lastError = null

    for (const model of models) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }]
          })
        })

        const data = await response.json()

        if (response.ok && data.choices?.[0]?.message?.content) {
          return res.status(200).json({
            output: data.choices[0].message.content,
            model_used: model
          })
        }

        // store error and continue
        lastError = data

      } catch (err) {
        lastError = err.message
      }
    }

    // ❌ If all models fail
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
// redeploy trigger
// trigger fresh deploy
