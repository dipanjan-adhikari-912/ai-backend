import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    // Parse body safely
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

    // ✅ Use Gemini SDK (this works even when REST fails)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return res.status(200).json({ output: text })

  } catch (error) {
    return res.status(500).json({
      error: "Server crash",
      details: error.message
    })
  }
}
// redeploy trigger
// trigger fresh deploy
