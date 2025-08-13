import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "Dapmeet",
  description: "Платформа для анализа встреч",
  icons: {
    icon: [
      {
        url: "/favicon.png",
        sizes: "128x128",
        type: "image/png",
      },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`}>
        <AuthProvider>
          <Suspense fallback={<div className="text-center p-8">Загрузка...</div>}>{children}</Suspense>
          <footer className="border-t p-4 text-center text-sm text-muted-foreground">
            <a href="/privacy" className="hover:underline">
              Политика конфиденциальности
            </a>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
