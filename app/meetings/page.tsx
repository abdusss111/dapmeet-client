"use client"

import { CardContent } from "@/components/ui/card"

import { CardDescription } from "@/components/ui/card"

import { CardTitle } from "@/components/ui/card"

import { CardHeader } from "@/components/ui/card"

import { Card } from "@/components/ui/card"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { MeetingCard } from "@/components/meeting-card" // 👈 create this if not yet

type Meeting = {
  id: string
  title: string
  created_at: Date
  participants?: string[]
  transcript?: string
}

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

        <MeetingsList />
      </div>
    </DashboardLayout>
  )
}

function MeetingsList() {
  const { meetings, loading } = useMeetingsContext()

  return (
    <div className="space-y-4">
      {loading ? (
        <p className="text-muted-foreground">Загрузка встреч...</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Встречи</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {meetings.length === 0 ? (
                <p className="text-muted-foreground">Нет встреч</p>
              ) : (
                meetings.map((meeting) => <MeetingCard key={meeting.id} meeting={meeting} />)
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function useMeetingsContext() {
  const [meetings, setMeetings] = useState([])
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

  return { meetings, loading }
}
