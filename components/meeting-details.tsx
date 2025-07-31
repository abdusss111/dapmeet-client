"use client"

import { useState, useMemo } from "react"
import { MeetingHeader } from "./meeting-header"
import { MeetingControls } from "./meeting-controls"
import { TranscriptView } from "./transcript-view"
import { processSegments } from "@/lib/meeting-utils"
import type { Meeting } from "@/lib/types"

interface MeetingDetailsProps {
  meeting: Meeting
}

export function MeetingDetails({ meeting }: MeetingDetailsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpeakers, setSelectedSpeakers] = useState<string[]>([])

  const processedSegments = useMemo(() => {
    if (!meeting?.segments) return []
    return processSegments(meeting.segments)
  }, [meeting?.segments])

  const filteredSegments = useMemo(() => {
    if (!processedSegments) return []

    return processedSegments.filter((segment) => {
      // Filter by search query
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        const matchesText = segment.groupedMessages.some((message) => message.toLowerCase().includes(searchLower))
        const matchesSpeaker = segment.speaker_username?.toLowerCase().includes(searchLower)

        if (!matchesText && !matchesSpeaker) {
          return false
        }
      }

      // Filter by selected speakers
      if (selectedSpeakers.length > 0) {
        return selectedSpeakers.includes(segment.speaker_username)
      }

      return true
    })
  }, [processedSegments, searchQuery, selectedSpeakers])

  const handleSpeakerToggle = (speaker: string) => {
    setSelectedSpeakers((prev) => (prev.includes(speaker) ? prev.filter((s) => s !== speaker) : [...prev, speaker]))
  }

  if (!meeting) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">Meeting not found</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <MeetingHeader meeting={meeting} />

      <MeetingControls
        meeting={meeting}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSpeakers={selectedSpeakers}
        onSpeakerToggle={handleSpeakerToggle}
      />

      <TranscriptView segments={filteredSegments} searchQuery={searchQuery} />

      {filteredSegments.length === 0 && (searchQuery || selectedSpeakers.length > 0) && (
        <div className="text-center py-8 text-muted-foreground">No messages match your current filters</div>
      )}
    </div>
  )
}
