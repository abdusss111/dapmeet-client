"use client"

import type React from "react"
import { useState } from "react"
import Header from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { useAuth } from "@/hooks/use-auth"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, isLoading } = useAuth()

  // Show loading state if auth is still loading
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Загрузка...</div>
  }

  // Ensure user is authenticated
  if (!user) {
    return null // Auth provider will redirect to login
  }

  return (
    <div className="flex h-screen">
      <Sidebar open={sidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
