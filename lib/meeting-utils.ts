import type { MeetingSegment, ProcessedSegment } from "./types"

// Speaker colors for consistent UI
const SPEAKER_COLORS = [
  "bg-blue-100 text-blue-800",
  "bg-green-100 text-green-800",
  "bg-purple-100 text-purple-800",
  "bg-orange-100 text-orange-800",
  "bg-pink-100 text-pink-800",
  "bg-indigo-100 text-indigo-800",
  "bg-yellow-100 text-yellow-800",
  "bg-red-100 text-red-800",
]

export const formatTimestamp = (isoString: string): string => {
  const date = new Date(isoString)
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export const formatDate = (isoString: string): string => {
  const date = new Date(isoString)
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const calculateDuration = (segments: MeetingSegment[]): string => {
  if (!segments || segments.length === 0) return "0:00"

  const sortedSegments = [...segments].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  const first = new Date(sortedSegments[0].timestamp)
  const last = new Date(sortedSegments[sortedSegments.length - 1].timestamp)
  const diffMs = last.getTime() - first.getTime()

  const minutes = Math.floor(diffMs / 60000)
  const seconds = Math.floor((diffMs % 60000) / 1000)

  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export const getUniqueSpeakers = (segments: MeetingSegment[]): string[] => {
  if (!segments || !Array.isArray(segments)) return []

  const speakers = new Set<string>()
  segments.forEach((segment) => {
    if (segment && segment.speaker_username) {
      speakers.add(segment.speaker_username)
    }
  })
  return Array.from(speakers)
}

export const getSpeakerColor = (speaker: string, allSpeakers: string[]): string => {
  const index = allSpeakers.indexOf(speaker)
  return SPEAKER_COLORS[index % SPEAKER_COLORS.length]
}

export const processSegments = (segments: MeetingSegment[]): ProcessedSegment[] => {
  if (!segments || !Array.isArray(segments) || segments.length === 0) return []

  // Sort segments by timestamp
  const sortedSegments = [...segments].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  const allSpeakers = getUniqueSpeakers(sortedSegments)
  const processed: ProcessedSegment[] = []

  for (let i = 0; i < sortedSegments.length; i++) {
    const segment = sortedSegments[i]
    const prevSegment = sortedSegments[i - 1]

    // Check if this should be grouped with previous segment
    const shouldGroup =
      prevSegment &&
      prevSegment.speaker_username === segment.speaker_username &&
      new Date(segment.timestamp).getTime() - new Date(prevSegment.timestamp).getTime() < 120000 // 2 minutes

    if (shouldGroup && processed.length > 0) {
      // Add to previous group
      const lastProcessed = processed[processed.length - 1]
      lastProcessed.groupedMessages.push(segment.text)
    } else {
      // Create new group
      processed.push({
        ...segment,
        groupedMessages: [segment.text],
        isFirstInGroup: true,
        speakerColor: getSpeakerColor(segment.speaker_username, allSpeakers),
      })
    }
  }

  return processed
}

export const searchInTranscript = (segments: MeetingSegment[], query: string): MeetingSegment[] => {
  if (!segments || !Array.isArray(segments)) return []
  if (!query.trim()) return segments

  const lowerQuery = query.toLowerCase()
  return segments.filter(
    (segment) =>
      segment &&
      (segment.text.toLowerCase().includes(lowerQuery) || segment.speaker_username.toLowerCase().includes(lowerQuery)),
  )
}

export const exportTranscript = (segments: MeetingSegment[], title: string): void => {
  if (!segments || !Array.isArray(segments)) return

  const sortedSegments = [...segments].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  const content = sortedSegments
    .map((segment) => {
      const time = formatTimestamp(segment.timestamp)
      return `${time} - ${segment.speaker_username}: ${segment.text}`
    })
    .join("\n")

  const blob = new Blob([content], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${title}_transcript.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
