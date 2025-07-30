import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "lucide-react"

export function MeetingCard({
  meeting,
}: {
  meeting: {
    unique_session_id: string
    title: string
    created_at: Date | string
  }
}) {
  return (
    <Link href={`/meetings/${meeting.unique_session_id}`}>
      <Card className="hover:bg-muted transition-colors cursor-pointer">
        <CardContent className="py-4">
          <h3 className="text-lg font-semibold">{meeting.title}</h3>
          <p className="text-sm text-muted-foreground">
            <Calendar className="inline w-4 h-4 mr-1" />
            {new Date(meeting.created_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
