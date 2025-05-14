"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()

  const routes = [
    {
      title: "Встречи",
      href: "/meetings",
      icon: Calendar,
    },
    {
      title: "Оплата",
      href: "/payments",
      icon: CreditCard,
    },
  ]

  return (
    <div className="flex h-screen flex-col border-r bg-background">
      <div className="flex h-16 items-center px-4">
        <Link href="/meetings" className="flex items-center">
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === route.href ? "bg-muted" : "hover:bg-muted hover:text-primary",
            )}
          >
            <route.icon className="h-5 w-5 text-muted-foreground" />
            {route.title}
          </Link>
        ))}
      </nav>
    </div>
  )
}
