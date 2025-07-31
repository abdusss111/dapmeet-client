"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Bot } from "lucide-react"

interface AIChatProps {
  meetingId: string
  meetingTitle: string
  transcript: string
}

export function AIChat({ meetingId, meetingTitle, transcript }: AIChatProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [isLoading, setIsLoading] = useState(false)

  const saveChatMessage = async (sender: string, content: string) => {
    try {
      const token = localStorage.getItem("APP_JWT")
      if (!token) return

      await fetch("https://api.dapmeet.kz/api/chat/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sender,
          content,
          created_at: new Date().toISOString(),
        }),
      })
    } catch (error) {
      console.error("Error saving chat message:", error)
    }
  }

  const handleSend = async () => {
    if (!message.trim()) return

    const userMessage = message
    setMessage("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    // Save user message
    await saveChatMessage("user", userMessage)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: userMessage,
          context: transcript,
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const data = await response.json()
      const assistantMessage = data.text

      setMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }])

      // Save assistant message
      await saveChatMessage("assistant", assistantMessage)
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage = "Извините, произошла ошибка при обработке вашего запроса."
      setMessages((prev) => [...prev, { role: "assistant", content: errorMessage }])

      // Save error message
      await saveChatMessage("assistant", errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Задайте вопрос о встрече, и я помогу вам найти ответ!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === "user" ? "bg-blue-600 text-white" : "bg-white border border-gray-200"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Думаю...
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Textarea
            placeholder="Задайте вопрос о встрече..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            className="flex-1"
            rows={2}
          />
          <Button onClick={handleSend} disabled={!message.trim() || isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
