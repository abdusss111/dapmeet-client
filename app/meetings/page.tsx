import type { Metadata } from "next"
import MeetingsClientPage from "./MeetingsClientPage"

export const metadata: Metadata = {
  title: "Встречи | Dapter.AI",
  description: "Просмотр и управление встречами",
}

export default function MeetingsPage() {
  return <MeetingsClientPage />
}
