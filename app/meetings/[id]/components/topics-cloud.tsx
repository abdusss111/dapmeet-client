"use client"

import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import type { MeetingDetail } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

interface TopicsCloudProps {
  id: string
}

export default function TopicsCloud({ id }: TopicsCloudProps) {
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
    return <div>Error loading topics: {error?.toString() || "Unknown error"}</div>
  }

  // Get font sizes based on frequency (assuming topics are ordered by frequency)
  const getSize = (index: number) => {
    const sizes = ["text-xs", "text-sm", "text-base", "text-lg", "text-xl"]
    const maxIndex = Math.min(index, sizes.length - 1)
    return sizes[sizes.length - 1 - maxIndex]
  }

  return (
    <div className="flex flex-wrap gap-2">
      {data.topics.map((topic, index) => (
        <Badge key={topic} variant="outline" className={`${getSize(index)} px-2 py-1 font-normal`}>
          {topic}
        </Badge>
      ))}
    </div>
  )
}
