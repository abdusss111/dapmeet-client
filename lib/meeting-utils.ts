import type { MeetingSegment, ProcessedSegment } from "./types"

export const formatTimestamp = (isoString: string): string => {
  return new Date(isoString).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export const formatDateTime = (isoString: string): string => {
  return new Date(isoString).toLocaleString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const calculateDuration = (segments: MeetingSegment[]): string => {
  if (!segments.length) return "0:00"

  const sortedSegments = [...segments].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  const first = new Date(sortedSegments[0].timestamp)
  const last = new Date(sortedSegments[sortedSegments.length - 1].timestamp)
  const diffMs = last.getTime() - first.getTime()

  const minutes = Math.floor(diffMs / 60000)
  const seconds = Math.floor((diffMs % 60000) / 1000)

  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export const getUniqueSpeakers = (segments: MeetingSegment[]): string[] => {
  const speakers = new Set(segments.map((s) => s.speaker_username).filter(Boolean))
  return Array.from(speakers)
}

export const getSpeakerColor = (speaker: string): string => {
  const colors = [
    "bg-blue-100 text-blue-800",
    "bg-green-100 text-green-800",
    "bg-purple-100 text-purple-800",
    "bg-orange-100 text-orange-800",
    "bg-pink-100 text-pink-800",
    "bg-indigo-100 text-indigo-800",
    "bg-yellow-100 text-yellow-800",
    "bg-red-100 text-red-800",
  ]

  let hash = 0
  for (let i = 0; i < speaker.length; i++) {
    hash = speaker.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

export const processSegments = (segments: MeetingSegment[]): ProcessedSegment[] => {
  if (!segments.length) return []

  const sortedSegments = [...segments].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  const processed: ProcessedSegment[] = []
  let currentGroup: MeetingSegment[] = []
  let currentSpeaker = ""

  for (const segment of sortedSegments) {
    const speaker = segment.speaker_username || "Unknown"
    const segmentTime = new Date(segment.timestamp).getTime()

    // Check if we should start a new group
    const shouldStartNewGroup =
      speaker !== currentSpeaker ||
      (currentGroup.length > 0 &&
        segmentTime - new Date(currentGroup[currentGroup.length - 1].timestamp).getTime() > 120000) // 2 minutes

    if (shouldStartNewGroup && currentGroup.length > 0) {
      // Process the current group
      const firstSegment = currentGroup[0]
      processed.push({
        ...firstSegment,
        groupedMessages: currentGroup.map((s) => s.text),
        isFirstInGroup: true,
        speakerColor: getSpeakerColor(currentSpeaker),
      })
      currentGroup = []
    }

    currentGroup.push(segment)
    currentSpeaker = speaker
  }

  // Process the last group
  if (currentGroup.length > 0) {
    const firstSegment = currentGroup[0]
    processed.push({
      ...firstSegment,
      groupedMessages: currentGroup.map((s) => s.text),
      isFirstInGroup: true,
      speakerColor: getSpeakerColor(currentSpeaker),
    })
  }

  return processed
}

export const searchInTranscript = (segments: MeetingSegment[], query: string): MeetingSegment[] => {
  if (!query.trim()) return segments

  const lowerQuery = query.toLowerCase()
  return segments.filter(
    (segment) =>
      segment.text.toLowerCase().includes(lowerQuery) || segment.speaker_username.toLowerCase().includes(lowerQuery),
  )
}

export const exportTranscript = (segments: MeetingSegment[], title: string): void => {
  const sortedSegments = [...segments].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  const transcript = sortedSegments
    .map((segment) => {
      const time = formatTimestamp(segment.timestamp)
      return `${time} - ${segment.speaker_username}: ${segment.text}`
    })
    .join("\n")

  const blob = new Blob([`${title}\n\n${transcript}`], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_transcript.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
