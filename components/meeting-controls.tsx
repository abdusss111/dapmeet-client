"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Filter, X } from "lucide-react"
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
  const uniqueSpeakers = getUniqueSpeakers(meeting.segments)

  const handleExport = () => {
    exportTranscript(meeting.segments, meeting.title)
  }

  const clearSearch = () => {
    onSearchChange("")
  }

  const clearFilters = () => {
    uniqueSpeakers.forEach((speaker) => {
      if (selectedSpeakers.includes(speaker)) {
        onSpeakerToggle(speaker)
      }
    })
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Поиск в транскрипте..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
              <Filter className="w-4 h-4" />
              Фильтры
              {selectedSpeakers.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                  {selectedSpeakers.length}
                </Badge>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Экспорт
            </Button>
          </div>
        </div>

        {/* Speaker Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-700">Фильтр по участникам:</div>
              {selectedSpeakers.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                  Очистить
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {uniqueSpeakers.map((speaker) => (
                <Badge
                  key={speaker}
                  variant={selectedSpeakers.includes(speaker) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => onSpeakerToggle(speaker)}
                >
                  {speaker}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(searchQuery || selectedSpeakers.length > 0) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Активные фильтры:
              {searchQuery && (
                <Badge variant="secondary" className="ml-2">
                  Поиск: "{searchQuery}"
                </Badge>
              )}
              {selectedSpeakers.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  Участники: {selectedSpeakers.length}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
