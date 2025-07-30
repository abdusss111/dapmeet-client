"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Users, ArrowLeft, MessageSquare } from "lucide-react"
import Link from "next/link"
import type { MeetingWithSegments } from "@/lib/types"
import { DashboardLayout } from "@/components/dashboard-layout"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.dapmeet.kz"

export default function MeetingDetailPage() {
  const params = useParams()
  const meetingId = params.id as string
  const [meeting, setMeeting] = useState<MeetingWithSegments | null>(null)
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

        const response = await fetch(`${API_URL}/api/meetings/${meetingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Ошибка ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        setMeeting(data)
      } catch (err) {
        console.error("Ошибка загрузки встречи:", err)
        setError(err instanceof Error ? err.message : "Неизвестная ошибка")
      } finally {
        setLoading(false)
      }
    }

    if (meetingId) {
      fetchMeeting()
    }
  }, [meetingId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка встречи...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Link href="/meetings">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Вернуться к встречам
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!meeting) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Встреча не найдена</p>
            <Link href="/meetings">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Вернуться к встречам
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/meetings">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{meeting.title}</h1>
              <p className="text-gray-600">ID: {meeting.meeting_id}</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            {meeting.segments.length} сегментов
          </Badge>
        </div>

        {/* Meeting Info */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <MessageSquare className="w-5 h-5 mr-2" />
              Информация о встрече
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatDate(meeting.created_at)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>{formatTime(meeting.created_at)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                <span>Пользователь: {meeting.user_id}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transcript */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Транскрипт встречи</CardTitle>
          </CardHeader>
          <CardContent>
            {meeting.segments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Транскрипт пока не доступен</p>
            ) : (
              <div className="space-y-4">
                {meeting.segments.map((segment, index) => (
                  <div key={segment.id} className="border-l-4 border-blue-200 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{segment.speaker_username}</span>
                        <Badge variant="outline" className="text-xs">
                          v{segment.version}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">{formatTime(segment.timestamp)}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{segment.text}</p>
                    {index < meeting.segments.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
