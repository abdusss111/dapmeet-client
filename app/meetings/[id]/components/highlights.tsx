"use client"

import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import type { MeetingDetail } from "@/lib/types"
import { formatTime } from "@/lib/utils"

interface HighlightsProps {
  id: string
}

export default function Highlights({ id }: HighlightsProps) {
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
    return <Skeleton className="h-[200px] w-full" />
  }

  if (error || !data) {
    return <div>Error loading highlights: {error?.toString() || "Unknown error"}</div>
  }

  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
      {data.highlights.map((highlight, index) => (
        <div key={index} className="border-l-2 border-primary pl-3 py-1">
          <div className="text-xs text-muted-foreground mb-1">{formatTime(highlight.t)}</div>
          <p className="text-sm">{highlight.text}</p>
        </div>
      ))}
    </div>
  )
}
