"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, MessageSquare } from "lucide-react"
import { formatDate, formatTimestamp, getUniqueSpeakers } from "@/lib/meeting-utils"
import type { Meeting } from "@/lib/types"

interface MeetingCardProps {
  meeting: Meeting
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  const uniqueSpeakers = getUniqueSpeakers(meeting.segments)
  const segmentCount = meeting.segments?.length || 0

  return (
    <Link href={`/meetings/${meeting.unique_session_id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">{meeting.title}</CardTitle>
            <Badge variant="secondary" className="ml-2 bg-green-50 text-green-700 border-green-200">
              Завершена
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(meeting.created_at)}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              {formatTimestamp(meeting.created_at)}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              {uniqueSpeakers.length} участников
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MessageSquare className="w-4 h-4 mr-2" />
              {segmentCount} сегментов
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default MeetingCard
