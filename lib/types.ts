export interface Meeting {
  unique_session_id: string
  meeting_id: string
  user_id: string
  title: string
  created_at: string
}

export interface MeetingDetail {
  unique_session_id: string
  meeting_id: string
  user_id: string
  title: string
  created_at: string
  segments: MeetingSegment[]
  participants?: string[]
  topics?: string[]
  highlights?: {
    t: number
    text: string
  }[]
}

export interface MeetingSegment {
  id: number
  meeting_id: string
  google_meet_user_id: string
  username: string
  timestamp: string
  text: string
  ver: number
  mess_id: string
  created_at: string
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
