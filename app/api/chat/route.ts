import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { prompt, context } = body

    console.log("Prompt:", prompt)
    console.log("Context length:", context?.length)

    if (!prompt || !context) {
      return NextResponse.json({ error: "Missing prompt or context" }, { status: 400 })
    }

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      system: `Ты ИИ-ассистент для анализа встреч. Отвечай на русском языке. Используй данные из транскрипта:\n${context}`,
    })

    return NextResponse.json({ text })
  } catch (err) {
    console.error("🔥 AI Chat Error:", err)
    return NextResponse.json({ error: "AI processing failed" }, { status: 500 })
  }
}
