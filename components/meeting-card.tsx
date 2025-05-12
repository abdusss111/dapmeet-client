import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export function MeetingCard({ meeting }: { meeting: { id: string; title: string; date: string } }) {
  return (
    <Link href={`/dashboard/meetings/${meeting.id}`}>
      <Card className="hover:bg-muted transition-colors cursor-pointer">
        <CardContent className="py-4">
          <h3 className="text-lg font-semibold">{meeting.title}</h3>
          <p className="text-sm text-muted-foreground">{new Date(meeting.date).toLocaleDateString()}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
