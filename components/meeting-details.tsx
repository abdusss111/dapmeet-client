"use client"

import { useState } from "react"
import { MeetingHeader } from "./meeting-header"
import { MeetingControls } from "./meeting-controls"
import { TranscriptView } from "./transcript-view"
import type { Meeting } from "@/lib/types"

interface MeetingDetailsProps {
  meeting: Meeting
}

export function MeetingDetails({ meeting }: MeetingDetailsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpeakers, setSelectedSpeakers] = useState<string[]>([])

  const handleSpeakerToggle = (speaker: string) => {
    setSelectedSpeakers((prev) => (prev.includes(speaker) ? prev.filter((s) => s !== speaker) : [...prev, speaker]))
  }

  return (
    <div className="space-y-6">
      <MeetingHeader meeting={meeting} />
      <TranscriptView meeting={meeting} searchQuery={searchQuery} selectedSpeakers={selectedSpeakers} />
    </div>
  )
}
