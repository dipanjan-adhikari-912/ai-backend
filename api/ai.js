export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    let body = {}

    // Safe parsing
    try {
      body = req.body || {}
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON body" })
    }

    const prompt = body?.prompt

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" })
    }

    const models = [
      "qwen/qwen-2-7b-instruct",
      "meta-llama/llama-3-8b-instruct",
      "google/gemma-7b-it"
    ]

    let lastError = null

    for (const model of models) {
      try {
        console.log("Trying model:", model)

        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 8000)

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }]
          }),
          signal: controller.signal
        })

        clearTimeout(timeout)

        const data = await response.json()

        if (response.ok && data?.choices?.[0]?.message?.content) {
          return res.status(200).json({
            output: data.choices[0].message.content,
            model_used: model
          })
        }

        lastError = data

      } catch (err) {
        lastError = err.message
        console.error("Model failed:", model, err.message)
      }
    }

    return res.status(500).json({
      error: "All models failed",
      details: lastError
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
