"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Users } from "lucide-react"
import { formatDate, formatTimestamp } from "@/lib/meeting-utils"
import { useAuth } from "@/hooks/use-auth"
import type { Meeting } from "@/lib/types"

interface MeetingCardProps {
  meeting: Meeting
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  const { user } = useAuth()

  // Filter out current user from speakers list
  const otherSpeakers = meeting.speakers?.filter((speaker) => speaker !== user?.name) || []
  const speakersToShow = otherSpeakers.slice(0, 3)
  const remainingCount = otherSpeakers.length - speakersToShow.length

  const speakersText =
    speakersToShow.length > 0
      ? `${speakersToShow.join(", ")}${remainingCount > 0 ? ` и еще ${remainingCount}` : ""}`
      : "Нет других участников"

  return (
    <Link href={`/meetings/${meeting.unique_session_id || meeting.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
              {meeting.title || "Без названия"}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              {meeting.created_at ? formatDate(meeting.created_at) : "Дата не указана"}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              {meeting.created_at ? formatTimestamp(meeting.created_at) : "--:--"}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">
                {otherSpeakers.length} участников: {speakersText}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default MeetingCard
