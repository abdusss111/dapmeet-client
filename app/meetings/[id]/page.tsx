"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { AIChat } from "@/components/ai-chat"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type MeetingMeta = {
  id: string
  title: string
  created_at: Date
  participants?: string[]
  topics?: string[]
  highlights?: { t: number; text: string }[]
}

export default function MeetingDetailPage() {
  const { id } = useParams()
  const [meeting, setMeeting] = useState<MeetingMeta | null>(null)
  const [transcript, setTranscript] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [loadingTranscript, setLoadingTranscript] = useState(false)
  const router = useRouter()

  function formatTranscript(raw: string): string {
    return raw
      .replace(/^"|"$/g, "")
      .replace(/\\n/g, "\n")
      .replace(/\s*\n\s*/g, "\n")
      .replace(/([А-ЯЁ][а-яё]+):/g, "<strong>$1:</strong>")
      .trim()
  }

  // Fetch meeting metadata
  useEffect(() => {
    if (!id || typeof id !== "string") return

    const fetchMeetingMeta = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/meetings/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("APP_JWT")}`,
          },
        })
        if (!res.ok) throw new Error("Failed to fetch meeting metadata")
        const data: MeetingMeta = await res.json()
        setMeeting(data)
      } catch (err) {
        console.error(err)
        router.push("/dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchMeetingMeta()
  }, [id, router])

  // Fetch transcript once metadata is loaded
  useEffect(() => {
    if (!id || typeof id !== "string" || !meeting) return

    setLoadingTranscript(true)
    const fetchTranscript = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/meetings/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("APP_JWT")}`,
          },
        })
        if (!res.ok) throw new Error("Failed to fetch transcript")
        const data = await res.json()
        setTranscript(formatTranscript(data.transcript))
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingTranscript(false)
      }
    }

    fetchTranscript()
  }, [id, meeting])

  const getSize = (index: number) => {
    const sizes = ["text-xs", "text-sm", "text-base", "text-lg", "text-xl"]
    const maxIndex = Math.min(index, sizes.length - 1)
    return sizes[sizes.length - 1 - maxIndex]
  }

  if (loading) {
    return <DashboardLayout>Загрузка...</DashboardLayout>
  }

  if (!meeting) {
    return <DashboardLayout>Встреча не найдена.</DashboardLayout>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/meetings" className="mb-2 inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Назад к панели управления
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">{meeting.title}</h1>
            <p className="text-muted-foreground">
            {new Date(meeting.created_at).toLocaleDateString()}• 
            <Calendar className="h-4 w-4 inline mr-1" />

            {/* {meeting.participants?.length ?? 0} участников */}
            </p>
          </div>
          {/* <div className="flex gap-2 self-end sm:self-auto">
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="h-4 w-4" />
              Скачать транскрипт
            </Button>
            <Button size="sm" className="gap-1">
              <Download className="h-4 w-4" />
              Скачать резюме
            </Button>
          </div> */}
        </div>

        <Tabs defaultValue="ai" className="space-y-4">
          <TabsList>
            {/* <TabsTrigger value="content">Содержание</TabsTrigger> */}
            <TabsTrigger value="ai">ИИ</TabsTrigger>
          </TabsList>

          
          <TabsContent value="ai">
  <div className="flex flex-col gap-6">


    {/* Блок: AI Чат */}
    <div className="w-full">
      <AIChat
        meetingId={meeting.id}
        meetingTitle={meeting.title}
        transcript={transcript}
      />
    </div>

    {/* Блок: Транскрипт */}
    <Card>
      <CardHeader>
        <CardTitle>Транскрипт встречи</CardTitle>
        <CardDescription>Полный текст встречи</CardDescription>
      </CardHeader>
      <CardContent className="max-h-[600px] overflow-y-auto">
        {loadingTranscript ? (
          <p>Загрузка транскрипта...</p>
        ) : (
          <div
            className="space-y-4 whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: transcript }}
          />
        )}
      </CardContent>
    </Card>
  </div>
</TabsContent>

        </Tabs>
      </div>
    </DashboardLayout>
  )
}
