"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, Users, MessageSquare, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Meeting {
  id: string
  title: string
  date: string
  duration: number
  participants: number
  status: "completed" | "processing" | "failed"
  summary?: string
  topics?: string[]
}

export default function MeetingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }
  }, [user, loading, router])

  // Fetch meetings when user is authenticated
  useEffect(() => {
    if (user) {
      fetchMeetings()
    }
  }, [user])

  const fetchMeetings = async () => {
    try {
      setIsLoadingMeetings(true)
      const token = localStorage.getItem("APP_JWT")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/meetings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem("APP_JWT")
        router.push("/login")
        return
      }

      if (response.ok) {
        const data = await response.json()
        setMeetings(data.meetings || [])
      } else {
        console.error("Failed to fetch meetings:", response.statusText)
      }
    } catch (error) {
      console.error("Error fetching meetings:", error)
    } finally {
      setIsLoadingMeetings(false)
    }
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Мои встречи</h1>
        <p className="text-gray-600 mt-2">Просматривайте и анализируйте ваши встречи</p>
      </div>

      {isLoadingMeetings ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Загрузка встреч...</span>
        </div>
      ) : meetings.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Встреч пока нет</h3>
            <p className="text-gray-600 mb-4">Установите расширение Chrome и начните записывать встречи</p>
            <Button onClick={() => router.push("/instruction")}>Инструкция по установке</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting) => (
            <Card key={meeting.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{meeting.title}</CardTitle>
                  <Badge className={getStatusColor(meeting.status)}>
                    {meeting.status === "completed" && "Завершено"}
                    {meeting.status === "processing" && "Обработка"}
                    {meeting.status === "failed" && "Ошибка"}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    {formatDistanceToNow(new Date(meeting.date), { addSuffix: true })}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {Math.round(meeting.duration / 60)} мин
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {meeting.participants} участников
                  </span>
                </div>

                {meeting.summary && <p className="text-sm text-gray-700 line-clamp-3 mb-4">{meeting.summary}</p>}

                {meeting.topics && meeting.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {meeting.topics.slice(0, 3).map((topic, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {meeting.topics.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{meeting.topics.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <Button
                  className="w-full mt-4 bg-transparent"
                  variant="outline"
                  onClick={() => router.push(`/meetings/${meeting.id}`)}
                >
                  Открыть встречу
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
