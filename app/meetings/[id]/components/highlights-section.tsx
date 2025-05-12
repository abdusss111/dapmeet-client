"use client"

import { formatTime } from "@/lib/utils"

interface HighlightsSectionProps {
  id: string
}

// Mock highlights data
const mockHighlights = [
  { t: 120, text: "We need to prioritize the new feature for the next release." },
  { t: 360, text: "Customer feedback indicates that the UI needs improvement." },
  { t: 540, text: "Team agreed to implement the changes by next week." },
]

export default function HighlightsSection({ id }: HighlightsSectionProps) {
  // In a real app, this would fetch data from an API
  const highlights = mockHighlights

  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
      {highlights.map((highlight, index) => (
        <div key={index} className="border-l-2 border-primary pl-3 py-1">
          <div className="text-xs text-muted-foreground mb-1">{formatTime(highlight.t)}</div>
          <p className="text-sm">{highlight.text}</p>
        </div>
      ))}
    </div>
  )
}
