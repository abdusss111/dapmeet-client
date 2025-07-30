export interface User {
  id: string
  email: string
  name: string
  image?: string
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

export interface Meeting {
  unique_session_id: string
  meeting_id: string
  user_id: string
  title: string
  segments?: MeetingSegment[]
  created_at: string
}

export interface MeetingDetail extends Meeting {
  segments: MeetingSegment[]
}

export interface MeetingWithSegments extends Meeting {
  segments: MeetingSegment[]
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => void
  logout: () => void
  loading: boolean
}
