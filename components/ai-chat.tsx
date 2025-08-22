"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowUp, Bot, FileText, BookOpen, Copy } from "lucide-react"
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

const extractSpeakersFromTranscript = (transcript: string): string => {
  const speakerMatches = transcript.match(/\d{2}:\d{2}:\d{2}, ([^:]+):/g)
  if (!speakerMatches) return "Не определены"

  const speakers = [...new Set(speakerMatches.map((match) => match.split(", ")[1].replace(":", "")))]
  return speakers.join(", ")
}

const calculateMeetingDuration = (transcript: string): string => {
  const timeMatches = transcript.match(/\d{2}:\d{2}:\d{2}/g)
  if (!timeMatches || timeMatches.length < 2) return "Не определена"

  const startTime = timeMatches[0]
  const endTime = timeMatches[timeMatches.length - 1]

  const start = new Date(`1970-01-01T${startTime}`)
  const end = new Date(`1970-01-01T${endTime}`)
  const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60))

  return `${duration} минут`
}

export function AIChat({ sessionId, meetingTitle, transcript }: AIChatProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [copySuccess, setCopySuccess] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom of chat container
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Remove this entire function

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

  const handleSend = async (customMessage?: string, displayMessage?: string) => {
    const messageToSend = customMessage || message
    const messageToDisplay = displayMessage || messageToSend
    const messageToSave = displayMessage || messageToSend

    if (!messageToSend.trim()) return

    if (!customMessage) {
      setMessage("")
    }

    setMessages((prev) => [...prev, { role: "user", content: messageToDisplay }])
    setIsLoading(true)

    // Save user message (display version for history)
    await saveMessage("user", messageToSave)

    try {
      const meetingContext = `
Информация о встрече:
- Название: ${meetingTitle}
- Дата и время: ${new Date().toLocaleDateString("ru-RU")} ${new Date().toLocaleTimeString("ru-RU")}
- Участники: ${extractSpeakersFromTranscript(transcript)}
- Продолжительность: ${calculateMeetingDuration(transcript)}

Транскрипт встречи:
${transcript}
      `.trim()

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: messageToSend,
          context: meetingContext, // Using enhanced context instead of just transcript
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

  const handleQuickPrompt = (promptType: "brief" | "detailed") => {
    const prompts = {
      brief: {
        full: `Сделай краткое официальное резюме онлайн-встречи. Включи следующие элементы:

        Цель встречи и основные обсуждённые темы — сформулируй сжато, но по существу.

        Участников встречи — с указанием ролей, если это важно.

        Краткий обзор ключевых обсуждений — изложи без лишних деталей, но с акцентом на суть и сделанные выводы. Без нумерации.

        Следующие шаги для каждого участника — чётко укажи, кто за что отвечает и в какие сроки.

        Упомяни, если была согласована дата следующей встречи.

        Стиль оформления — официальный, важные моменты выделяй жирным шрифтом.

        Краткое резюме и действия`,
        display: "Краткое резюме и следующие действия",
      },
      detailed: {
        full: `Создай подробное официальное резюме внутренней командной онлайн-встречи. Включи следующие структурированные блоки:

        Контекст и повестка встречи — 1–2 предложения с описанием цели встречи и ключевых тем обсуждения.

        Общие сведения о встрече — укажи дату и время проведения (включая точное время начала и окончания), формат встречи (онлайн/гибридный), платформу проведения (Zoom, Teams, Google Meet и т.д.) и список участников с их ролями (если применимо).

        Обсуждаемые темы и подробное резюме — представь нумерованный список всех ключевых тем, поднятых на встрече, и по каждой теме подробно опиши, что обсуждалось. Используй подзаголовки, логичный пересказ, отрази мнения, предложения и выводы участников.

        Результаты и действия участников — перечисли принятые решения и договоренности (включая цифры, сроки, показатели), затем распиши следующие шаги и задачи для каждого участника, включая сроки. Укажи также открытые вопросы, перенесённые на следующую встречу.

        Цитаты и замечания участников — включи ключевые формулировки, предложения, инициативы и сомнения, прозвучавшие в ходе обсуждения.

        Дата следующей встречи — если согласована.

        Весь текст должен быть официальным по стилю. Ключевые детали и важные моменты выделяй жирным шрифтом для акцента.`,
        display: "Подробное резюме",
      },
    }

    const selectedPrompt = prompts[promptType]
    handleSend(selectedPrompt.full, selectedPrompt.display)
  }

  const handleCopyMessage = async (content: string, index: number) => {
    try {
      const textToCopy = `${content}\n\nСоздано на dapmeet.kz`
      await navigator.clipboard.writeText(textToCopy)
      setCopySuccess(index)
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (error) {
      console.error("Failed to copy message:", error)
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
          <div className="h-40 flex items-center justify-center">
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
        <div ref={chatContainerRef} className="min-h-40 max-h-[1200px] overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              <Bot className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Задайте вопрос о встрече, и я помогу вам найти ответ!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} group animate-in slide-in-from-bottom-2 duration-500`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`max-w-[85%] md:max-w-[80%] p-2 md:p-3 rounded-lg relative ${
                    msg.role === "user" ? "bg-blue-600 text-white" : "bg-white border border-gray-200"
                  }`}
                >
                  {/* Copy button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 ${
                      msg.role === "user"
                        ? "bg-blue-500 hover:bg-blue-400 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                    } ${copySuccess === index ? "opacity-100" : ""}`}
                    onClick={() => handleCopyMessage(msg.content, index)}
                    title="Копировать сообщение"
                  >
                    {copySuccess === index ? <span className="text-xs">✓</span> : <Copy className="w-3 h-3" />}
                  </Button>

                  {msg.role === "assistant" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      className="prose prose-xs max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-100 prose-pre:text-gray-800"
                      components={{
                        p: ({ children }) => (
                          <p className="mb-1.5 last:mb-0 text-xs md:text-sm leading-relaxed">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="mb-1.5 last:mb-0 pl-3 md:pl-4 text-xs md:text-sm">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="mb-1.5 last:mb-0 pl-3 md:pl-4 text-xs md:text-sm">{children}</ol>
                        ),
                        li: ({ children }) => <li className="mb-0.5 text-xs md:text-sm">{children}</li>,
                        h1: ({ children }) => <h1 className="text-sm md:text-lg font-bold mb-1.5">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xs md:text-base font-bold mb-1.5">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-xs md:text-sm font-bold mb-1">{children}</h3>,
                        strong: ({ children }) => (
                          <strong className="font-semibold text-xs md:text-sm">{children}</strong>
                        ),
                        code: ({ children }) => <code className="text-xs">{children}</code>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <span className="text-xs md:text-sm leading-relaxed">{msg.content}</span>
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

        {/* Quick Prompt Buttons */}
        <div
          className="flex flex-col sm:flex-row gap-2 p-3 rounded-lg border border-blue-200"
          style={{ backgroundColor: "rgba(7, 65, 210, 0.05)" }}
        >
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickPrompt("brief")}
              disabled={isLoading}
              className="flex-1 justify-start gap-1 md:gap-2 bg-white hover:bg-blue-50 border-blue-200 transition-all duration-200 text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2"
              style={{ color: "rgb(7, 65, 210)" }}
            >
              <FileText className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span className="truncate">Краткое резюме</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickPrompt("detailed")}
              disabled={isLoading}
              className="flex-1 justify-start gap-1 md:gap-2 bg-white hover:bg-blue-50 border-blue-200 transition-all duration-200 text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2"
              style={{ color: "rgb(7, 65, 210)" }}
            >
              <BookOpen className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span className="truncate">Подробное резюме</span>
            </Button>
          </div>
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
            className="flex-1 h-10 resize-none"
          />
          <Button onClick={() => handleSend()} disabled={!message.trim() || isLoading}>
            <ArrowUp className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
