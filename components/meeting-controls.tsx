"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Download, X, Filter } from "lucide-react"
import { exportTranscript, getUniqueSpeakers } from "@/lib/meeting-utils"
import type { Meeting } from "@/lib/types"

interface MeetingControlsProps {
  meeting: Meeting
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedSpeakers: string[]
  onSpeakerToggle: (speaker: string) => void
}

export function MeetingControls({
  meeting,
  searchQuery,
  onSearchChange,
  selectedSpeakers,
  onSpeakerToggle,
}: MeetingControlsProps) {
  const [showFilters, setShowFilters] = useState(false)
  const speakers = getUniqueSpeakers(meeting.segments || [])

  const handleExport = () => {
    exportTranscript(meeting)
  }

  const clearFilters = () => {
    onSearchChange("")
    speakers.forEach((speaker) => {
      if (selectedSpeakers.includes(speaker)) {
        onSpeakerToggle(speaker)
      }
    })
  }

  const hasActiveFilters = searchQuery || selectedSpeakers.length > 0

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          {/* Search and main controls */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transcript..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                    {(searchQuery ? 1 : 0) + selectedSpeakers.length}
                  </Badge>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-2 bg-transparent"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{searchQuery}"
                  <X className="h-3 w-3 cursor-pointer" onClick={() => onSearchChange("")} />
                </Badge>
              )}
              {selectedSpeakers.map((speaker) => (
                <Badge key={speaker} variant="secondary" className="flex items-center gap-1">
                  {speaker}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => onSpeakerToggle(speaker)} />
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
                Clear all
              </Button>
            </div>
          )}

          {/* Speaker filters */}
          {showFilters && speakers.length > 0 && (
            <div className="border-t pt-4">
              <div className="text-sm font-medium mb-2">Filter by speaker:</div>
              <div className="flex flex-wrap gap-2">
                {speakers.map((speaker) => (
                  <Button
                    key={speaker}
                    variant={selectedSpeakers.includes(speaker) ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSpeakerToggle(speaker)}
                    className="text-xs"
                  >
                    {speaker}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
