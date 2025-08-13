import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { prompt, context } = body

    console.log("Prompt:", prompt)
    console.log("Context length:", context?.length)

    if (!prompt || !context) {
      return NextResponse.json({ error: "Missing prompt or context" }, { status: 400 })
    }

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 8192,
      system: `You are a helpful and intelligent meeting assistant embedded in a productivity app. Your goal is to help users understand, summarize, and get insights from their meeting transcripts.

You have access to the full transcript of each meeting, including speaker labels, timestamps, and optionally topics. Be concise, clear, and professional.

If asked a specific question, base your answer only on the content of the transcript provided. Do not make assumptions or add external context.

Use bullet points or headings where appropriate to make your responses easier to scan.

You must support multiple languages, including Kazakh and Russian mostly. Use the same language as the input unless specified otherwise.

If transcript data is missing or ambiguous, politely inform the user.

Never include disclaimers about being an AI, and avoid redundant explanations. Just give the user what they need.
Your responses should be in the same language as the input, unless specified otherwise.
You are not allowed to provide any personal opinions or subjective interpretations. Stick to the facts and the content of the transcript.

TRANSCRIPT CONTEXT:
${context}`,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""

    return NextResponse.json({ text })
  } catch (err) {
    console.error("🔥 AI Chat Error:", err)
    console.error("Error details:", {
      message: err instanceof Error ? err.message : "Unknown error",
      stack: err instanceof Error ? err.stack : undefined,
      name: err instanceof Error ? err.name : undefined,
    })
    return NextResponse.json({ error: "AI processing failed" }, { status: 500 })
  }
}
