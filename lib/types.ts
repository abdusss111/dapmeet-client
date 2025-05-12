export interface Meeting {
  id: string
  title: string
  date: string
  participants: string[]
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
}

export interface MeetingDetail {
  id: string
  title: string
  date: string
  participants: string[]
  transcript: string
  topics: string[]
  highlights: {
    t: number
    text: string
  }[]
}

// Extend the next-auth session type
declare module "next-auth" {
  interface Session {
    accessToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
  }
}
