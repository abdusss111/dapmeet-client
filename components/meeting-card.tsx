import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users } from "lucide-react"
import Link from "next/link"
import type { Meeting } from "@/lib/types"

interface MeetingCardProps {
  meeting: Meeting
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Link href={`/meetings/${meeting.unique_session_id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">{meeting.title}</CardTitle>
            <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700">
              {meeting.segments?.length || 0} сегментов
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
              {formatTime(meeting.created_at)}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              ID: {meeting.meeting_id}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
