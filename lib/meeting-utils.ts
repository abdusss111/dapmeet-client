import type { MeetingSegment, ProcessedSegment, Meeting } from "./types"

// Speaker colors for consistent identification
const SPEAKER_COLORS = [
  "#3B82F6", // blue
  "#EF4444", // red
  "#10B981", // green
  "#F59E0B", // amber
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#84CC16", // lime
]

export function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString)
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  } catch (error) {
    console.error("Error formatting timestamp:", error)
    return "Invalid time"
  }
}

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString)
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid date"
  }
}

export function calculateDuration(segments: MeetingSegment[]): string {
  if (!segments || segments.length === 0) return "0:00"

  try {
    const sortedSegments = [...segments].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )

    const first = new Date(sortedSegments[0].timestamp)
    const last = new Date(sortedSegments[sortedSegments.length - 1].timestamp)
    const diffMs = last.getTime() - first.getTime()

    const minutes = Math.floor(diffMs / 60000)
    const seconds = Math.floor((diffMs % 60000) / 1000)

    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  } catch (error) {
    console.error("Error calculating duration:", error)
    return "0:00"
  }
}

export function getUniqueSpeakers(segments: MeetingSegment[]): string[] {
  if (!segments) return []

  const speakers = new Set<string>()
  segments.forEach((segment) => {
    if (segment.speaker_username) {
      speakers.add(segment.speaker_username)
    }
  })
  return Array.from(speakers)
}

export function getSpeakerColor(speaker: string, speakers: string[]): string {
  const index = speakers.indexOf(speaker)
  return SPEAKER_COLORS[index % SPEAKER_COLORS.length]
}

export function processSegments(segments: MeetingSegment[]): ProcessedSegment[] {
  if (!segments || segments.length === 0) return []

  try {
    // Sort segments by timestamp
    const sortedSegments = [...segments].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )

    const speakers = getUniqueSpeakers(sortedSegments)
    const processed: ProcessedSegment[] = []

    for (let i = 0; i < sortedSegments.length; i++) {
      const segment = sortedSegments[i]
      const prevSegment = i > 0 ? sortedSegments[i - 1] : null

      // Check if this should be grouped with previous message
      const shouldGroup =
        prevSegment &&
        prevSegment.speaker_username === segment.speaker_username &&
        new Date(segment.timestamp).getTime() - new Date(prevSegment.timestamp).getTime() < 120000 // 2 minutes

      const processedSegment: ProcessedSegment = {
        ...segment,
        groupedMessages: [segment.text],
        isFirstInGroup: !shouldGroup,
        speakerColor: getSpeakerColor(segment.speaker_username, speakers),
      }

      if (shouldGroup && processed.length > 0) {
        // Add to previous group
        const lastProcessed = processed[processed.length - 1]
        lastProcessed.groupedMessages.push(segment.text)
      } else {
        processed.push(processedSegment)
      }
    }

    return processed
  } catch (error) {
    console.error("Error processing segments:", error)
    return []
  }
}

export function exportTranscript(meeting: Meeting): void {
  if (!meeting || !meeting.segments) return

  try {
    const speakers = getUniqueSpeakers(meeting.segments)
    const processed = processSegments(meeting.segments)

    let transcript = `Meeting: ${meeting.title}\n`
    transcript += `Date: ${formatDate(meeting.created_at)}\n`
    transcript += `Duration: ${calculateDuration(meeting.segments)}\n`
    transcript += `Participants: ${speakers.join(", ")}\n\n`
    transcript += "--- Transcript ---\n\n"

    processed.forEach((segment) => {
      transcript += `[${formatTimestamp(segment.timestamp)}] ${segment.speaker_username}:\n`
      segment.groupedMessages.forEach((message) => {
        transcript += `${message}\n`
      })
      transcript += "\n"
    })

    const blob = new Blob([transcript], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${meeting.title}_transcript.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error exporting transcript:", error)
  }
}
