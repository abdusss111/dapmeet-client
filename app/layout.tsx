import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Suspense } from "react"
import Link from "next/link"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "Dapmeet.AI",
  description: "Платформа для анализа встреч",
  icons: "/favicon.png",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${inter.className} bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <Suspense fallback={<div className="text-center p-8">Загрузка...</div>}>
              {children}
            </Suspense>
	   <footer className="border-t p-4 text-center text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:underline">
              Политика конфиденциальности
            </Link>
          </footer>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

