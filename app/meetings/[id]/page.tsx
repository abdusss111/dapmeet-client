"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { MeetingDetails } from "@/components/meeting-details"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Meeting } from "@/lib/types"

export default function MeetingDetailPage() {
  const params = useParams()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMeeting = async () => {
      if (!params.id) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`https://api.dapmeet.kz/api/meetings/${params.id}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch meeting: ${response.status}`)
        }

        const data = await response.json()

        // Ensure segments is always an array
        const meetingData: Meeting = {
          ...data,
          segments: Array.isArray(data.segments) ? data.segments : [],
        }

        setMeeting(meetingData)
      } catch (err) {
        console.error("Error fetching meeting:", err)
        setError(err instanceof Error ? err.message : "Failed to load meeting")
      } finally {
        setLoading(false)
      }
    }

    fetchMeeting()
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Skeleton className="h-8 w-64 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-20" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <Skeleton className="h-10 w-full mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 border-b last:border-b-0">
                <div className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-red-600 mb-2">Error loading meeting</div>
            <div className="text-muted-foreground text-sm">{error}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">Meeting not found</CardContent>
        </Card>
      </div>
    )
  }

  return <MeetingDetails meeting={meeting} />
}
