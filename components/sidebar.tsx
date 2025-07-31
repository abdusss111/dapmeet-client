"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Calendar, Users, Settings, CreditCard, FileText } from "lucide-react"

const navigation = [
  { name: "Главная", href: "/dashboard", icon: Home },
  { name: "Встречи", href: "/meetings", icon: Calendar },
  { name: "Пользователи", href: "/users", icon: Users },
  { name: "Настройки", href: "/settings", icon: Settings },
  { name: "Платежи", href: "/payments", icon: CreditCard },
  { name: "Документы", href: "/documents", icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-white shadow-sm">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-semibold">DapMeet</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default Sidebar
