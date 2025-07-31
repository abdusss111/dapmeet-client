"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MeetingCard } from "@/components/meeting-card"
import { MeetingFilters } from "@/components/meeting-filters"
import { Loader2 } from "lucide-react"

interface Meeting {
  unique_session_id: string
  meeting_id: string
  user_id: string
  title: string
  created_at: string
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "title">("date")

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const token = localStorage.getItem("APP_JWT")

        if (!token) {
          setError("Токен авторизации не найден")
          return
        }

        const response = await fetch("https://api.dapmeet.kz/api/meetings", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setMeetings(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Error fetching meetings:", err)
        setError(err instanceof Error ? err.message : "Ошибка загрузки встреч")
      } finally {
        setLoading(false)
      }
    }

    fetchMeetings()
  }, [])

  const filteredMeetings = meetings
    .filter(
      (meeting) =>
        meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.meeting_id.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      return a.title.localeCompare(b.title)
    })

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Загрузка встреч...</p>
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
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Встречи</h1>
        </div>

        <MeetingFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {filteredMeetings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{searchTerm ? "Встречи не найдены" : "У вас пока нет встреч"}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMeetings.map((meeting) => (
              <MeetingCard key={meeting.unique_session_id} meeting={meeting} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
