"use client"

import { CardContent } from "@/components/ui/card"
import { CardDescription } from "@/components/ui/card"
import { CardTitle } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { MeetingCard } from "@/components/meeting-card"
import { createDemoMeeting } from "@/lib/demo-meeting"
import type { Meeting } from "@/lib/types"

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await fetch("https://api.dapmeet.kz/api/meetings/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("APP_JWT")}`,
          },
        })

        if (!res.ok) throw new Error("Failed to fetch meetings")

        const data = await res.json()
        setMeetings(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchMeetings()
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Просмотр и управление встречами</h1>
          </div>
        </div>

        <MeetingsList meetings={meetings} loading={loading} />
      </div>
    </DashboardLayout>
  )
}

function MeetingsList({ meetings, loading }: { meetings: Meeting[]; loading: boolean }) {
  const displayMeetings = meetings.length === 0 && !loading ? [createDemoMeeting()] : meetings

  return (
    <div className="space-y-4">
      {loading ? (
        <p className="text-muted-foreground">Загрузка встреч...</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Встречи</CardTitle>
            {meetings.length === 0 && !loading && (
              <CardDescription className="text-blue-600">
                Демонстрационная встреча - показывает как работает сервис
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayMeetings.length === 0 ? (
                <p className="text-muted-foreground">Нет встреч</p>
              ) : (
                displayMeetings.map((meeting) => (
                  <MeetingCard key={meeting.meeting_id || meeting.unique_session_id} meeting={meeting} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
