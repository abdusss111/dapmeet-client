"use client"

import { Badge } from "@/components/ui/badge"

interface TopicsSectionProps {
  id: string
}

// Mock topics data
const mockTopics = ["Project Updates", "Roadmap", "Customer Feedback", "Action Items", "Next Steps"]

export default function TopicsSection({ id }: TopicsSectionProps) {
  // In a real app, this would fetch data from an API
  const topics = mockTopics

  // Get font sizes based on frequency (assuming topics are ordered by frequency)
  const getSize = (index: number) => {
    const sizes = ["text-xs", "text-sm", "text-base", "text-lg", "text-xl"]
    const maxIndex = Math.min(index, sizes.length - 1)
    return sizes[sizes.length - 1 - maxIndex]
  }

  return (
    <div className="flex flex-wrap gap-2">
      {topics.map((topic, index) => (
        <Badge key={topic} variant="outline" className={`${getSize(index)} px-2 py-1 font-normal`}>
          {topic}
        </Badge>
      ))}
    </div>
  )
}
