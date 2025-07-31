"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { MeetingDetails } from "@/components/meeting-details"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { MeetingWithSegments } from "@/lib/types"

export default function MeetingDetailPage() {
  const params = useParams()
  const { token } = useAuth()
  const [meeting, setMeeting] = useState<MeetingWithSegments | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMeeting = async () => {
      if (!params.id || !token) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`https://api.dapmeet.kz/api/meetings/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch meeting: ${response.status}`)
        }

        const data = await response.json()
        setMeeting(data)
      } catch (err) {
        console.error("Error fetching meeting:", err)
        setError(err instanceof Error ? err.message : "Failed to load meeting")
      } finally {
        setLoading(false)
      }
    }

    fetchMeeting()
  }, [params.id, token])

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to view meeting details.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Meeting not found.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MeetingDetails meeting={meeting} />
    </div>
  )
}
