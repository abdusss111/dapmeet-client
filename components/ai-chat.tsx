"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Bot } from "lucide-react"

interface AIChatProps {
  sessionId: string
  meetingTitle: string
  transcript: string
}

interface ChatMessage {
  id: number
  session_id: string
  sender: string
  content: string
  created_at: string
}

interface ChatHistoryResponse {
  session_id: string
  total_messages: number
  messages: ChatMessage[]
}

export function AIChat({ sessionId, meetingTitle, transcript }: AIChatProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  // Load chat history on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const token = localStorage.getItem("APP_JWT")
        if (!token) {
          setIsLoadingHistory(false)
          return
        }

        const response = await fetch(`https://api.dapmeet.kz/api/chat/${sessionId}/history?page=1&size=50`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data: ChatHistoryResponse = await response.json()
          const formattedMessages = data.messages.map((msg) => ({
            role: msg.sender === "user" ? ("user" as const) : ("assistant" as const),
            content: msg.content,
          }))
          setMessages(formattedMessages)
        }
      } catch (error) {
        console.error("Error loading chat history:", error)
      } finally {
        setIsLoadingHistory(false)
      }
    }

    loadChatHistory()
  }, [sessionId])

  const saveMessage = async (sender: "user" | "ai", content: string) => {
    try {
      const token = localStorage.getItem("APP_JWT")
      if (!token) return

      const response = await fetch(`https://api.dapmeet.kz/api/chat/${sessionId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sender,
          content,
        }),
      })

      if (!response.ok) {
        console.error("Failed to save message")
      }
    } catch (error) {
      console.error("Error saving message:", error)
    }
  }

  const formatChatHistory = () => {
    return messages.map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`).join("\n")
  }

  const handleSend = async () => {
    if (!message.trim()) return

    const userMessage = message
    setMessage("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    // Save user message
    await saveMessage("user", userMessage)

    try {
      const chatHistory = formatChatHistory()
      const fullContext = `TRANSCRIPT:
${transcript}

CHAT HISTORY:
${chatHistory}`

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: userMessage,
          context: fullContext,
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const data = await response.json()
      const assistantMessage = data.text

      setMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }])

      // Save assistant message
      await saveMessage("ai", assistantMessage)
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage = "Извините, произошла ошибка при обработке вашего запроса."
      setMessages((prev) => [...prev, { role: "assistant", content: errorMessage }])

      // Save error message
      await saveMessage("ai", errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingHistory) {
    return (
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка истории чата...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
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
