"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Wallet } from "lucide-react"
import Image from "next/image"
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
      icon: Wallet,
    },
  ]

  return (
    <div className="flex h-screen flex-col border-r bg-background">
      {/* ЛОГО */}
      <div className="flex h-16 items-center px-4">
        <Link href="/meetings" className="flex items-center">
          <Image src="/logo.png" alt="Dapmeet Logo" width={200} height={32} />
        </Link>
      </div>

	<div className="border-b border-border" />
	<br></br>

      {/* МЕНЮ */}
      <nav className="flex-1 space-y-1 px-2">
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
