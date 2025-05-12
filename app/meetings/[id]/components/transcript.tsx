"use client"

import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import type { MeetingDetail } from "@/lib/types"

interface TranscriptProps {
  id: string
}

export default function Transcript({ id }: TranscriptProps) {
  const { data, isLoading, error } = useQuery<MeetingDetail>({
    queryKey: ["meeting", id],
    queryFn: async () => {
      const response = await fetch(`/api/meetings/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch meeting details")
      }
      return response.json()
    },
  })

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />
  }

  if (error || !data) {
    return <div>Error loading transcript: {error?.toString() || "Unknown error"}</div>
  }

  return (
    <div className="max-h-[600px] overflow-y-auto pr-2">
      <div className="space-y-4 whitespace-pre-line">{data.transcript}</div>
    </div>
  )
}
