import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, MessageSquare } from "lucide-react"
import { formatDate, calculateDuration, getUniqueSpeakers } from "@/lib/meeting-utils"
import type { Meeting } from "@/lib/types"

interface MeetingHeaderProps {
  meeting: Meeting
}

export function MeetingHeader({ meeting }: MeetingHeaderProps) {
  if (!meeting) return null

  const speakers = getUniqueSpeakers(meeting.segments || [])
  const duration = calculateDuration(meeting.segments || [])
  const segmentCount = meeting.segments?.length || 0

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">{meeting.title}</CardTitle>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="font-medium">Meeting ID:</span>
                <code className="px-2 py-1 bg-muted rounded text-xs">{meeting.meeting_id}</code>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">Session ID:</span>
                <code className="px-2 py-1 bg-muted rounded text-xs">{meeting.unique_session_id}</code>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <div className="font-medium">Created</div>
                <div className="text-muted-foreground">{formatDate(meeting.created_at)}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <div className="font-medium">Duration</div>
                <div className="text-muted-foreground">{duration}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <div className="font-medium">Participants</div>
                <div className="text-muted-foreground">{speakers.length}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <div className="font-medium">Messages</div>
                <div className="text-muted-foreground">{segmentCount}</div>
              </div>
            </div>
          </div>

          {speakers.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Speakers:</div>
              <div className="flex flex-wrap gap-2">
                {speakers.map((speaker, index) => (
                  <Badge key={speaker} variant="secondary" className="text-xs">
                    {speaker}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  )
}
