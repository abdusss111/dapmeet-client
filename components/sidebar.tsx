"use client"

import { Button } from "@/components/ui/button"
import { MessageSquare, BookOpen } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Sidebar() {
  const pathname = usePathname()

  const navigation = [
    /*  { name: "Панель управления", href: "/dashboard", icon: Home },*/
    { name: "Встречи", href: "/meetings", icon: MessageSquare },
    { name: "Инструкция", href: "/instruction", icon: BookOpen },
    /* { name: "Календарь", href: "/calendar", icon: Calendar },*/
    /*{ name: "Участники", href: "/participants", icon: Users },*/
    /*{ name: "Настройки", href: "/settings", icon: Settings },*/
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <Button variant={isActive ? "default" : "ghost"} className="w-full justify-start gap-2">
                <item.icon className="w-4 h-4" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
