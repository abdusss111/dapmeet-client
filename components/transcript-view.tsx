import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatTimestamp } from "@/lib/meeting-utils"
import type { ProcessedSegment } from "@/lib/types"

interface TranscriptViewProps {
  segments: ProcessedSegment[]
  searchQuery: string
}

export function TranscriptView({ segments, searchQuery }: TranscriptViewProps) {
  const highlightText = (text: string, query: string) => {
    if (!query) return text

    const regex = new RegExp(`(${query})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  if (!segments || segments.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">No transcript segments available</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {segments.map((segment) => (
            <div key={segment.id} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback
                    className="text-xs font-medium text-white"
                    style={{ backgroundColor: segment.speakerColor }}
                  >
                    {segment.speaker_username?.charAt(0)?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{segment.speaker_username || "Unknown Speaker"}</span>
                    <span className="text-xs text-muted-foreground">{formatTimestamp(segment.timestamp)}</span>
                  </div>

                  <div className="space-y-1">
                    {segment.groupedMessages.map((message, index) => (
                      <p key={index} className="text-sm leading-relaxed">
                        {highlightText(message, searchQuery)}
                      </p>
                    ))}
                  </div>

                  {/* Debug info (hidden by default) */}
                  <details className="mt-2">
                    <summary className="text-xs text-muted-foreground cursor-pointer">Debug info</summary>
                    <div className="text-xs text-muted-foreground mt-1 space-y-1">
                      <div>Message ID: {segment.message_id}</div>
                      <div>Version: {segment.version}</div>
                      <div>Google Meet User ID: {segment.google_meet_user_id}</div>
                      <div>Created: {formatTimestamp(segment.created_at)}</div>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
