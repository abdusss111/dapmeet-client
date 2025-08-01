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
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: messageToSend, // Send full prompt to API
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
      <Card className="bg-white border-gray-200 h-[600px] flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="w-5 h-5 text-blue-600" />
            AI Ассистент
            <span className="text-sm font-normal text-gray-500 ml-2">({meetingTitle})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка истории чата...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-gray-200 h-[600px] flex flex-col">
      <CardHeader className="pb-4 border-b border-gray-100">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="w-5 h-5 text-blue-600" />
          AI Ассистент
          <span className="text-sm font-normal text-gray-500 ml-2">({meetingTitle})</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4 p-4 min-h-0">
        {/* Chat Messages Area - Takes up most of the space */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-100 min-h-0"
          style={{ minHeight: '300px' }}
        >
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-base mb-2">Добро пожаловать в AI чат!</p>
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                  Задайте вопрос о встрече или воспользуйтесь быстрыми командами ниже для создания резюме
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} group animate-in slide-in-from-bottom-2 duration-300`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-xl relative shadow-sm ${
                      msg.role === "user" 
                        ? "bg-blue-600 text-white ml-12" 
                        : "bg-white border border-gray-200 mr-12"
                    }`}
                  >
                    {/* Copy button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 h-7 w-7 p-0 shadow-md ${
                        msg.role === "user"
                          ? "bg-blue-500 hover:bg-blue-400 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                      } ${copySuccess === index ? "opacity-100 scale-110" : ""}`}
                      onClick={() => handleCopyMessage(msg.content, index)}
                      title="Копировать сообщение"
                    >
                      {copySuccess === index ? (
                        <span className="text-xs font-bold">✓</span>
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>

                    {msg.role === "assistant" ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-gray-100 prose-pre:text-gray-800 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700"
                        components={{
                          p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="mb-3 last:mb-0 pl-4 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="mb-3 last:mb-0 pl-4 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-gray-900">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-lg font-bold mb-2 text-gray-900">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-base font-bold mb-2 text-gray-900">{children}</h3>,
                          strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                          code: ({ children }) => <code className="text-sm">{children}</code>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm mr-12">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-gray-600">Обрабатываю запрос...</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Быстрые действия:</h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickPrompt("brief")}
                disabled={isLoading}
                className="flex-1 justify-start gap-2 bg-white hover:bg-blue-50 border-blue-200 transition-all duration-200 text-blue-700 hover:text-blue-800"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Краткое резюме</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickPrompt("detailed")}
                disabled={isLoading}
                className="flex-1 justify-start gap-2 bg-white hover:bg-blue-50 border-blue-200 transition-all duration-200 text-blue-700 hover:text-blue-800"
              >
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">Подробное резюме</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Textarea
              placeholder="Задайте вопрос о встрече или попросите создать резюме..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              className="min-h-[60px] max-h-[120px] resize-none border-gray-200 focus:border-blue-300 focus:ring-blue-200 text-sm leading-relaxed"
              rows={2}
            />
            <div className="text-xs text-gray-400 mt-1 ml-1">
              Нажмите Enter для отправки, Shift+Enter для новой строки
            </div>
          </div>
          <Button 
            onClick={() => handleSend()} 
            disabled={!message.trim() || isLoading}
            className="h-[60px] px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 transition-colors duration-200"
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
