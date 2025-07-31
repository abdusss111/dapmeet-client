import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "Dapmeet",
  description: "Платформа для анализа встреч",
  icons: {
    icon: "/dapmeet-logo.png", // rel="icon"
    shortcut: "/dapmeet-logo.png", // rel="shortcut icon"
    // apple: "/apple-touch-icon.png" // if you add an Apple touch icon
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <Suspense fallback={<div className="text-center p-8">Загрузка...</div>}>{children}</Suspense>
            <footer className="border-t p-4 text-center text-sm text-muted-foreground">
              {/* move links out of head */}
              <a href="/privacy" className="hover:underline">
                Политика конфиденциальности
              </a>
            </footer>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
