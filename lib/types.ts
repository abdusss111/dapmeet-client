export interface Meeting {
  unique_session_id: string
  meeting_id: string
  user_id: string
  title: string
  created_at: string
}

export interface MeetingSegment {
  id: number
  session_id: string
  google_meet_user_id: string
  speaker_username: string
  timestamp: string
  text: string
  version: number
  message_id: string
  created_at: string
}

export interface MeetingDetail {
  unique_session_id: string
  meeting_id: string
  user_id: string
  title: string
  segments: MeetingSegment[]
  created_at: string
  participants?: string[]
  topics?: string[]
  highlights?: { t: number; text: string }[]
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
