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

  // Filter out current user from speakers list for display
  const otherSpeakers = meeting.speakers?.filter((speaker) => speaker !== user?.name) || []

  // Total speakers count includes current user
  const totalSpeakersCount = meeting.speakers?.length || 0

  const speakersText = otherSpeakers.length > 0 ? `${otherSpeakers.join(", ")}` : "Нет других участников"

  return (
    <Link href={`/meetings/${meeting.unique_session_id || meeting.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-gray-200">
        <CardHeader className="pb-2 md:pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm md:text-lg font-semibold text-gray-900 line-clamp-2 pr-2">
              {meeting.title || "Без названия"}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-1.5 md:space-y-2">
          <div className="flex items-center text-xs md:text-sm text-gray-600">
            <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0" />
            <span className="truncate">{meeting.created_at ? formatDate(meeting.created_at) : "Дата не указана"}</span>
          </div>
          <div className="flex items-center text-xs md:text-sm text-gray-600">
            <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0" />
            <span className="truncate">{meeting.created_at ? formatTimestamp(meeting.created_at) : "--:--"}</span>
          </div>
          <div className="flex items-start text-xs md:text-sm text-gray-600">
            <Users className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="truncate">
                <span className="font-medium">{totalSpeakersCount} участников</span>
                {otherSpeakers.length > 0 && (
                  <>
                    <span className="hidden sm:inline">: {speakersText}</span>
                    <span className="sm:hidden">
                      : {otherSpeakers[0]}
                      {otherSpeakers.length > 1 ? ` и еще ${otherSpeakers.length - 1}` : ""}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default MeetingCard
