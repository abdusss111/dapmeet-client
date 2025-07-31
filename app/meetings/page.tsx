"use client"

import { useEffect, useState } from "react"
import { Suspense } from "react"
import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import DashboardLayout from "@/components/dashboard-layout"
// import MeetingFilters from "@/components/meeting-filters"
import { CalendarView } from "@/components/calendar-view"
import { MeetingCard } from "@/components/meeting-card" // 👈 create this if not yet

// export const metadata: Metadata = {
//   title: "Встречи | Dapter.AI",
//   description: "Просмотр и управление встречами",
// }

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
            <h1 className="text-3xl font-bold tracking-tight">Встречи</h1>
            <p className="text-muted-foreground">Просмотр и управление всеми встречами</p>
          </div>
        </div>

        <Tabs defaultValue="list" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="list">Список</TabsTrigger>
              {/* <TabsTrigger value="calendar">Календарь</TabsTrigger> */}
            </TabsList>
            {/* <MeetingFilters /> */}
          </div>

          <TabsContent value="list" className="space-y-4">
            {loading ? (
              <MeetingsListSkeleton />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Встречи</CardTitle>
                  <CardDescription>Ваши недавние и предстоящие встречи</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {meetings.length === 0 ? (
                      <p className="text-muted-foreground">Нет встреч</p>
                    ) : (
                      meetings.map((meeting) => (
                        <MeetingCard key={meeting.id} meeting={meeting} />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* <TabsContent value="calendar" className="space-y-4">
            <Suspense fallback={<CalendarSkeleton />}>
              <CalendarView />
            </Suspense>
          </TabsContent> */}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

// Skeletons for loading
function MeetingsListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Встречи</CardTitle>
        <CardDescription>Ваши недавние и предстоящие встречи</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}

function CalendarSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Календарь встреч</CardTitle>
        <CardDescription>Просмотр встреч в календаре</CardDescription>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[500px] w-full" />
      </CardContent>
    </Card>
  )
}
