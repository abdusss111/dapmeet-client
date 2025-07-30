"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { AIChat } from "@/components/ai-chat"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { MeetingDetail, MeetingSegment } from "@/lib/types"

export default function MeetingDetailPage() {
  const { id } = useParams()
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null)
  const [transcript, setTranscript] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [loadingTranscript, setLoadingTranscript] = useState(false)
  const router = useRouter()

  function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  function formatTranscript(segments: MeetingSegment[]): string {
    return segments
      .map((segment) => {
        const timecode = formatTimestamp(segment.timestamp)
        const speakerName = segment.speaker_username
        const text = segment.text
        return `${timecode}, ${speakerName}: ${text}`
      })
      .join("\n")
  }

  // Fetch meeting metadata and transcript
  useEffect(() => {
    if (!id || typeof id !== "string") return

    const fetchMeetingData = async () => {
      try {
        const res = await fetch(`https://api.dapmeet.kz/api/meetings/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("APP_JWT")}`,
          },
        })
        if (!res.ok) throw new Error("Failed to fetch meeting data")
        const data: MeetingDetail = await res.json()

        setMeeting(data)

        // Format transcript from segments
        if (data.segments && data.segments.length > 0) {
          setTranscript(formatTranscript(data.segments))
        }
      } catch (err) {
        console.error(err)
        router.push("/dashboard")
      } finally {
        setLoading(false)
        setLoadingTranscript(false)
      }
    }

    setLoadingTranscript(true)
    fetchMeetingData()
  }, [id, router])

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
            <Link href="/meetings" className="mb-2 inline-flex items-center gap-1 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4" />
              Назад к встречам
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{meeting.title}</h1>
            <p className="text-gray-600">
              {new Date(meeting.created_at).toLocaleDateString("ru-RU")} •
              <Calendar className="h-4 w-4 inline mr-1 ml-2" />
              ID: {meeting.meeting_id}
            </p>
          </div>
        </div>

        <Tabs defaultValue="ai" className="space-y-4">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="ai" className="data-[state=active]:bg-white">
              ИИ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai">
            <div className="flex flex-col gap-6">
              {/* AI Chat Block */}
              <div className="w-full">
                <AIChat meetingId={meeting.unique_session_id} meetingTitle={meeting.title} transcript={transcript} />
              </div>

              {/* Transcript Block */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Транскрипт встречи</CardTitle>
                  <CardDescription className="text-gray-600">
                    Полный текст встречи ({meeting.segments?.length || 0} сегментов)
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-[600px] overflow-y-auto">
                  {loadingTranscript ? (
                    <p className="text-gray-600">Загрузка транскрипта...</p>
                  ) : transcript ? (
                    <div className="space-y-4 whitespace-pre-line text-gray-800">{transcript}</div>
                  ) : (
                    <p className="text-gray-600">Транскрипт недоступен</p>
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
