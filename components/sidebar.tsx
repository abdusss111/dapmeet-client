"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart, Calendar, Home, Settings, Users, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  open: boolean
}

export function Sidebar({ open }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    // {
    //   title: "Панель управления",
    //   href: "/dashboard",
    //   icon: Home,
    // },
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
    // {
    //   title: "Команда",
    //   href: "/team",
    //   icon: Users,
    // },
    // {
    //   title: "Настройки",
    //   href: "/settings",
    //   icon: Settings,
    // },
  ]

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r bg-background transition-transform md:static",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-16",
      )}
    >
      <div className="flex h-14 items-center border-b px-4 pb-4 mt-4">
        <Link href="/meetings" className="flex items-center gap-2 font-semibold">
          <img
            src="/logo.png"
            alt="Dapmeet.AI Logo"
            className="h-full w-full"
            ></img>
        </Link>
      </div>  
      <nav className="flex-1 overflow-auto p-2">
        <ul className="flex flex-col gap-1">
          {routes.map((route) => (
            <li key={route.href}>
              <Link
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === route.href || pathname.startsWith(`${route.href}/`)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                )}
              >
                <route.icon className="h-4 w-4" />
                {open && <span>{route.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t p-4">
        <div className="flex flex-col gap-2">
          {/* {open && <div className="text-xs text-muted-foreground">Версия 1.0.0</div>} */}
        </div>
      </div>
    </aside>
  )
}
