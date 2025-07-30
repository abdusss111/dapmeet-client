"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, MessageSquare, User } from 'lucide-react'
import { Meeting } from "@/lib/types"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function MeetingDetailPage() {
  const params = useParams()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const token = localStorage.getItem("APP_JWT")
        const response = await fetch(
          `https://api.dapmeet.kz/api/meetings/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error("Встреча не найдена")
        }

        const data = await response.json()
        setMeeting(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchMeeting()
    }
  }, [params.id])

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !meeting) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Встреча не найдена
          </h2>
          <p className="text-gray-600">{error || "Встреча не существует"}</p>
        </div>
      </DashboardLayout>
    )
  }

  const { date, time } = formatDateTime(meeting.created_at)

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Meeting Header */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {meeting.title}
                </CardTitle>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {date}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {time}
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                Завершено
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Meeting Transcript */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Транскрипт встречи
            </CardTitle>
          </CardHeader>
          <CardContent>
            {meeting.segments && meeting.segments.length > 0 ? (
              <div className="space-y-4">
                {meeting.segments.map((segment, index) => (
                  <div key={segment.id} className="border-l-2 border-blue-200 pl-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">
                        {segment.speaker_username}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatTimestamp(segment.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {segment.text}
                    </p>
                    {index < meeting.segments.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Транскрипт для этой встречи недоступен</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
