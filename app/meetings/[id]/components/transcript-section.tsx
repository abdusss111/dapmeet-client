"use client"

interface TranscriptSectionProps {
  id: string
}

// Mock transcript data
const mockTranscript =
  "This is a sample transcript of the meeting. It would contain the full text of what was discussed during the meeting. The transcript would be much longer in a real application and would include timestamps, speaker identification, and the full content of the conversation.\n\nJohn: Hi everyone, thanks for joining today's meeting.\n\nJane: Happy to be here. Let's discuss the project updates.\n\nBob: I've completed the frontend changes we discussed last week.\n\nJohn: Great work! What about the customer feedback we received?\n\nJane: The feedback indicates that users find the new UI intuitive, but they're requesting more customization options.\n\nBob: I can work on adding those options this sprint.\n\nJohn: Sounds good. Let's prioritize that for the next release."

export default function TranscriptSection({ id }: TranscriptSectionProps) {
  // In a real app, this would fetch data from an API
  const transcript = mockTranscript

  return (
    <div className="max-h-[600px] overflow-y-auto pr-2">
      <div className="space-y-4 whitespace-pre-line">{transcript}</div>
    </div>
  )
}
