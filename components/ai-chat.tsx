"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Bot } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Calculate dynamic height based on message count
  const getChatHeight = () => {
    if (messages.length === 0) return "h-32" // 128px - minimum height when empty
    if (messages.length <= 3) return "h-48" // 192px - small conversations
    if (messages.length <= 6) return "h-64" // 256px - medium conversations
    return "h-72" // 288px - maximum height (close to 300px)
  }

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

  const handleSend = async () => {
    if (!message.trim()) return

    const userMessage = message
    setMessage("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    // Save user message
    await saveMessage("user", userMessage)

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
          <div className="h-32 flex items-center justify-center">
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
        <div
          ref={chatContainerRef}
          className={`${getChatHeight()} overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg transition-all duration-300`}
        >
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              <Bot className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Задайте вопрос о встрече, и я помогу вам найти ответ!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === "user" ? "bg-blue-600 text-white" : "bg-white border border-gray-200"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-100 prose-pre:text-gray-800"
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="mb-2 last:mb-0 pl-4">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-2 last:mb-0 pl-4">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        code: ({ children }) => <code className="text-xs">{children}</code>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
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
          <div ref={messagesEndRef} />
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
