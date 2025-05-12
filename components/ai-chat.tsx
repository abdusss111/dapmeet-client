"use client"

import { Copy } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Send, Bot, User } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface AIChatProps {
  meetingId: string
  meetingTitle: string
  transcript: string
}

export function AIChat({ meetingTitle, transcript }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Привет! Я ваш ИИ-ассистент для анализа встречи. Что вы хотите узнать об этой встрече?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const quickPrompts = [
    { label: "Краткое резюме", emoji: "✨", prompt: "Сделай краткое резюме встречи" },
    { label: "Подробное резюме", emoji: "✨", prompt: "Сделай подробное резюме встречи" },
    { label: "Резюме с источниками", emoji: "✨", prompt: "Сделай резюме встречи с указанием источников" },
    { label: "Резюме + действия", emoji: "🧠", prompt: "Сделай резюме и выдели действия, которые нужно выполнить" },
    { label: "Резюме по повестке", emoji: "📍", prompt: "Сделай резюме встречи, ориентируясь на повестку" },
    { label: "Сгенерировать действия", emoji: "✨", prompt: "Сгенерируй список действий по результатам встречи" },
  ]

  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const context = `Встреча: ${meetingTitle}\nТранскрипт:\n${transcript}`
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, context }),
      })
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: data.text,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Произошла ошибка. Попробуйте позже.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <Card className="flex flex-col w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          ИИ-ассистент
        </CardTitle>
      </CardHeader>

      {/* Быстрые подсказки */}
      <CardContent className="pb-0">
        <div className="grid grid-cols-2 gap-2">
          {quickPrompts.map(({ label, emoji, prompt }, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(prompt)}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-md bg-white text-black px-4 py-2 text-left text-sm font-medium shadow hover:bg-blue-100 transition-colors"
            >
              <span className="text-xl">{emoji}</span>
              {label}
            </button>
          ))}
        </div>
      </CardContent>

      <div className="h-5" />

      {/* Сообщения */}
      <CardContent className="pt-2 space-y-2">
        <div className="min-h-[60px] max-h-[400px] overflow-y-auto space-y-2 pr-1">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="flex items-start gap-2 max-w-[80%]">
                {m.role === "assistant" && (
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary text-white text-xs">ИИ</AvatarFallback>
                  </Avatar>
                )}
                <div className="relative group">
  <div className={`rounded-lg px-3 py-1 text-sm ${m.role === "user" ? "bg-primary text-white" : "bg-muted"}`}>
    {m.content}
  </div>

  {m.role === "assistant" && (
    <button
      onClick={() => navigator.clipboard.writeText(m.content)}
      className="absolute right-130 opacity-0 group-hover:opacity-100 transition-opacity"
      title="Скопировать"
    >
      <Copy className="w-6 h-6 text-muted-foreground hover:text-foreground" />
    </button>
  )}
</div>

                {m.role === "user" && (
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Поле ввода */}
      <CardFooter className="border-t p-2">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            placeholder="Ваш вопрос..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="text-sm"
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
