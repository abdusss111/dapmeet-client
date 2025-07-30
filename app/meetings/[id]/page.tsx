"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MessageSquare, User } from "lucide-react"
import type { MeetingWithSegments } from "@/lib/types"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function MeetingDetailPage() {
  const params = useParams()
  const [meeting, setMeeting] = useState<MeetingWithSegments | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const response = await fetch(`https://api.dapmeet.kz/api/meetings/${params.id}`)
        if (!response.ok) {
          throw new Error("Встреча не найдена")
        }
        const data = await response.json()
        setMeeting(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Произошла ошибка")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchMeeting()
    }
  }, [params.id])

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (!meeting) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600">Встреча не найдена</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Meeting Header */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">{meeting.title}</CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {formatDateTime(meeting.created_at)}
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="mr-1 h-4 w-4" />
                    {meeting.segments?.length || 0} сообщений
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                Завершена
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">ID встречи:</span>
                <p className="text-gray-600">{meeting.meeting_id}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">ID сессии:</span>
                <p className="text-gray-600 font-mono text-xs">{meeting.unique_session_id}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Пользователь:</span>
                <p className="text-gray-600">{meeting.user_id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transcript */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Транскрипт встречи
            </CardTitle>
          </CardHeader>
          <CardContent>
            {meeting.segments && meeting.segments.length > 0 ? (
              <div className="space-y-4">
                {meeting.segments.map((segment) => (
                  <div key={segment.id} className="border-l-4 border-blue-200 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{segment.speaker_username}</span>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatTime(segment.timestamp)}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        v{segment.version}
                      </Badge>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{segment.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Транскрипт для этой встречи недоступен</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
