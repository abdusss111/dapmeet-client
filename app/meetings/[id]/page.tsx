"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Loader2, ArrowLeft, Clock, Users, Calendar } from "lucide-react"
import Link from "next/link"

interface MeetingSegment {
  id: number
  session_id: string
  google_meet_user_id: string
  speaker_username: string
  timestamp: string
  text: string
  version: number
  message_id: string
  created_at: string
}

interface MeetingDetail {
  unique_session_id: string
  meeting_id: string
  user_id: string
  title: string
  segments: MeetingSegment[]
  created_at: string
}

export default function MeetingDetailPage() {
  const params = useParams()
  const meetingId = params.id as string

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const token = localStorage.getItem("APP_JWT")

        if (!token) {
          setError("Токен авторизации не найден")
          return
        }

        const response = await fetch(`https://api.dapmeet.kz/api/meetings/${meetingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setMeeting(data)
      } catch (err) {
        console.error("Error fetching meeting:", err)
        setError(err instanceof Error ? err.message : "Ошибка загрузки встречи")
      } finally {
        setLoading(false)
      }
    }

    if (meetingId) {
      fetchMeeting()
    }
  }, [meetingId])

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getUniqueSpeakers = (segments: MeetingSegment[]) => {
    const speakers = new Set(segments.map((s) => s.speaker_username))
    return Array.from(speakers)
  }

  const calculateDuration = (segments: MeetingSegment[]) => {
    if (!segments || segments.length === 0) return "0:00"

    const sortedSegments = [...segments].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )

    const start = new Date(sortedSegments[0].timestamp)
    const end = new Date(sortedSegments[sortedSegments.length - 1].timestamp)
    const duration = end.getTime() - start.getTime()

    const minutes = Math.floor(duration / 60000)
    const seconds = Math.floor((duration % 60000) / 1000)

    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Загрузка встречи...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !meeting) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || "Встреча не найдена"}</p>
            <Link href="/meetings" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Вернуться к встречам
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const sortedSegments = [...meeting.segments].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  )

  const uniqueSpeakers = getUniqueSpeakers(meeting.segments)
  const duration = calculateDuration(meeting.segments)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/meetings" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Назад к встречам
          </Link>
        </div>

        {/* Meeting Info */}
        <div className="bg-white rounded-lg border p-6">
          <h1 className="text-3xl font-bold mb-4">{meeting.title}</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{formatDate(meeting.created_at)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Длительность: {duration}</span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Участников: {uniqueSpeakers.length}</span>
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>ID встречи: {meeting.meeting_id}</p>
            <p>ID сессии: {meeting.unique_session_id}</p>
          </div>
        </div>

        {/* Transcript */}
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Транскрипт</h2>
            <p className="text-sm text-muted-foreground">{meeting.segments.length} сообщений</p>
          </div>

          <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
            {sortedSegments.map((segment) => (
              <div key={segment.id} className="flex gap-4">
                <div className="flex-shrink-0 text-xs text-muted-foreground min-w-[60px]">
                  {formatTimestamp(segment.timestamp)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">{segment.speaker_username}</div>
                  <div className="text-sm leading-relaxed">{segment.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
