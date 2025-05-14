"use client"

import { Copy, Sparkle, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, Sparkles, Loader } from "lucide-react"

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

export function AIChat({ meetingId, meetingTitle, transcript }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Привет! Я ваш ИИ-ассистент для анализа встречи. Что вы хотите узнать об этой встрече?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)

  useEffect(() => {
  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("APP_JWT")
      const res = await fetch(`https://api.dapmeet.kz/api/chat/history?meeting_id=${meetingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error()
      const history = await res.json()
      if (Array.isArray(history) && history.length > 0) {
        setMessages(history)
      }
    } catch {
      console.warn("Не удалось загрузить историю чата")
    }
  }

  fetchHistory()
}, [meetingId])

 

  const quickPrompts = [
    { label: "Краткое резюме", emoji: "✨", 
      prompt: `Сделай краткое официальное резюме онлайн-встречи. Включи следующие элементы:

Цель встречи и основные обсуждённые темы — сформулируй сжато, но по существу.

Участников встречи — с указанием ролей, если это важно.

Краткий обзор ключевых обсуждений — изложи без лишних деталей, но с акцентом на суть и сделанные выводы. Без нумерации.

Следующие шаги для каждого участника — чётко укажи, кто за что отвечает и в какие сроки.

Упомяни, если была согласована дата следующей встречи.

Стиль оформления — официальный, важные моменты выделяй жирным шрифтом.

Краткое резюме и действия`
    },
    { label: "Подробное резюме", emoji: "🧠", 
      prompt: `Создай подробное резюме онлайн-встречи. Включи следующие структурированные блоки:

Контекст и повестка встречи — 1–2 предложения с описанием цели встречи и ключевых тем обсуждения.

Общие сведения о встрече — укажи дату и время проведения (включая точное время начала и окончания), формат встречи (онлайн/гибридный), платформу проведения (Zoom, Teams, Google Meet и т.д.) и список участников с их ролями (если применимо).

Обсуждаемые темы и подробное резюме — представь нумерованный список всех ключевых тем, поднятых на встрече, и по каждой теме подробно опиши, что обсуждалось. Используй подзаголовки, логичный пересказ, отрази мнения, предложения и выводы участников.

Результаты и действия участников — перечисли принятые решения и договоренности (включая цифры, сроки, показатели), затем распиши следующие шаги и задачи для каждого участника, включая сроки. Укажи также открытые вопросы, перенесённые на следующую встречу.

Цитаты и замечания участников — включи ключевые формулировки, предложения, инициативы и сомнения, прозвучавшие в ходе обсуждения.

Дата следующей встречи — если согласована.

Весь текст должен быть официальным по стилю. Ключевые детали и важные моменты выделяй жирным шрифтом для акцента.`  
    },
    { label: "Оценить Продажу", emoji: "📍", 
      prompt:  `Представь, что ты профессиональный тренер по продажам. На основе предоставленной транскрибации встречи с клиентом по новой продаже, выполни оценку эффективности менеджера по ключевым этапам продаж:

Приветствие

Выявление потребностей

Презентация продукта/услуги

Обработка возражений

Завершение сделки/встречи

Для каждого этапа:

Поставь оценку от 1 до 100;

Кратко обоснуй, предоставь цитаты и почему поставлен именно такой балл;

Дай конкретные рекомендации по улучшению навыков.

Затем добавь блок:

Общее впечатление:
– Сделай краткий вывод по встрече в целом,
– Укажи общую оценку по шкале от 1 до 100,
– Определи 2–3 приоритета для развития менеджера.

Отчёт должен быть профессиональным, конструктивным и ориентированным на рост. Избегай общей критики — фокусируйся на обучении и практических советах.`
    }
    // { label: "Резюме + действия", emoji: "🧠", prompt: "Сделай резюме и выдели действия, которые нужно выполнить" },
    // { label: "Резюме по повестке", emoji: "📍", prompt: "Сделай резюме встречи, ориентируясь на повестку" },
    // { label: "Сгенерировать действия", emoji: "✨", prompt: "Сгенерируй список действий по результатам встречи" },
  ]

  const sendMessage = async (visible: string, actualPrompt: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: visible,
    }
  
    const updated = [...messages, userMessage]
    setMessages(updated)
    setInput("")
    setIsLoading(true)
  
    try {
      const context = `Встреча: ${meetingTitle}\nТранскрипт:\n${transcript}`
    
        const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
  	"Content-Type": "application/json"	
	},
        body: JSON.stringify({ prompt: actualPrompt, context }),
      })
  
      const data = await res.json()
  
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.text,
      }
  
      const newHistory = [...updated, assistantMessage]
      setMessages(newHistory)
  
      // 👇 Save chat history to backend
      const token = localStorage.getItem("APP_JWT")
      await fetch("https://api.dapmeet.kz/api/chat/history", {
        method: "POST",
        headers: { "Content-Type": "application/json",
Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          meeting_id: meetingId,
          history: newHistory,
        }),
      })
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
    sendMessage(input, input)
  }

  const formatAIContent = (text: string) => {
    return text
      .replace(/\\n/g, "\n")                         // замена \n на \n
      .replace(/(?:\r\n|\r|\n)/g, "<br/>")            // реальный перенос строки
      .replace(/(\*\*|__)(.*?)\1/g, "<strong>$2</strong>") // жирный текст **текст**
      .replace(/([А-ЯA-Z][а-яa-z]+):/g, "<strong>$1:</strong>") // имена говорящих
  }
  

  return (
    <Card className="flex flex-col w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          ИИ
        </CardTitle>
      </CardHeader>

      {/* Быстрые подсказки */}
      <CardContent className="pb-0">
        <div className="grid grid-cols-2 gap-2">
          {quickPrompts.map(({ label, emoji, prompt }, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(label, prompt)}
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
          <AvatarFallback className="bg-white text-blue text-xs">
            <Sparkles />
          </AvatarFallback>
        </Avatar>
      )}
      <div className="relative group">
        <div
          className={`rounded-lg px-3 py-1 text-sm ${m.role === "user" ? "bg-primary text-white" : "bg-muted"}`}
          dangerouslySetInnerHTML={{
            __html: m.role === "assistant" ? formatAIContent(m.content) : m.content,
          }}
        />
        {m.role === "assistant" && (
  <button
    onClick={() => {
      navigator.clipboard.writeText(m.content)
      setCopiedMessageId(m.id)
      setTimeout(() => setCopiedMessageId(null), 1500)
    }}
    className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
    title="Скопировать"
  >
    {copiedMessageId === m.id ? (
      <Check className="w-6 h-6 text-green-500" />
    ) : (
      <Copy className="w-6 h-6 text-muted-foreground hover:text-foreground" />
    )}
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

{isLoading && (
  <div className="flex justify-start">
    <div className="flex items-center gap-2 max-w-[80%]">
      <Avatar className="h-6 w-6">
        <AvatarFallback className="bg-white text-blue text-xs">
          <Sparkle className="animate-spin" />
        </AvatarFallback>
      </Avatar>
      <div className="rounded-lg bg-muted px-3 py-1 text-sm text-muted-foreground animate-pulse">
        Думаю...
      </div>
    </div>
  </div>
)}

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
          <Button type="submit" size="icon" disabled={isLoading} className="bg-black">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
