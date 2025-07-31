"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, MessageSquare, Hash } from "lucide-react"
import { formatDateTime, calculateDuration, getUniqueSpeakers } from "@/lib/meeting-utils"
import type { Meeting } from "@/lib/types"

interface MeetingHeaderProps {
  meeting: Meeting
}

export function MeetingHeader({ meeting }: MeetingHeaderProps) {
  const duration = calculateDuration(meeting.segments)
  const uniqueSpeakers = getUniqueSpeakers(meeting.segments)
  const totalMessages = meeting.segments.length

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-900">{meeting.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDateTime(meeting.created_at)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {duration}
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            Завершена
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
              <Hash className="w-4 h-4" />
              ID встречи
            </div>
            <p className="text-sm text-gray-600 font-mono">{meeting.meeting_id}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
              <Users className="w-4 h-4" />
              Участники
            </div>
            <p className="text-sm text-gray-600">{uniqueSpeakers.length} человек</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
              <MessageSquare className="w-4 h-4" />
              Сообщения
            </div>
            <p className="text-sm text-gray-600">{totalMessages} сегментов</p>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-700">Сессия</div>
            <p className="text-xs text-gray-500 font-mono break-all">{meeting.unique_session_id}</p>
          </div>
        </div>

        {uniqueSpeakers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm font-medium text-gray-700 mb-2">Участники встречи:</div>
            <div className="flex flex-wrap gap-2">
              {uniqueSpeakers.map((speaker, index) => (
                <Badge key={speaker} variant="outline" className="text-xs">
                  {speaker}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
