// dashboard-layout.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Header from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, isLoading } = useAuth()

  useEffect(() => {
    setSidebarOpen(isDesktop)
  }, [isDesktop])

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Загрузка...</div>
  }

  if (!user) return null

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="px-6 py-4 text-xl font-bold">
          <span className="text-[#2D2D2D]">dap</span>
          <span className="text-[#6670F0]">meet</span>
        </div>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col md:ml-64">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-muted">{children}</main>
      </div>
    </div>
  )
}
