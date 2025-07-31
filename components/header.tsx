"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"

export function Header() {
  const { user } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image src="/dap.svg" alt="Dapmeet" width={32} height={32} />
          <h1 className="text-xl font-semibold text-gray-900">Dapmeet</h1>
        </div>

        <div className="flex items-center gap-4">
          <Avatar className="w-8 h-8">
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback>{user?.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
