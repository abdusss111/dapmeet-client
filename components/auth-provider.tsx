"use client"

import { createContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

export type User = {
  id: string
  name: string
  email: string
  image: string | null
}

export type AuthContextType = {
  user: User | null
  isLoading: boolean
  loginWithGoogle: () => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  loginWithGoogle: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const storedUser = localStorage.getItem("dapter_user")

    try {
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (err) {
      console.error("Ошибка чтения пользователя:", err)
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      const publicRoutes = ["/login", "/privacy", "/"] // add any more public routes here
      const isPublicPage = publicRoutes.includes(pathname)

      if (!user && !isPublicPage) {
        router.push("/")
      } else if (user && pathname === "/login") {
        router.push("/meetings")
      }
    }
  }, [user, isLoading, pathname, router])

  const loginWithGoogle = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    // Add debugging
    console.log("Google Client ID:", clientId)

    if (!clientId) {
      console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set!")
      alert("Google Client ID is not configured. Please check your environment variables.")
      return
    }

    const redirectUri = `${window.location.origin}/auth/callback`
    const scope = "openid profile email"

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&access_type=offline` +
      `&prompt=consent`

    console.log("Auth URL:", authUrl)
    window.location.href = authUrl
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("dapter_user")
    localStorage.removeItem("APP_JWT")
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, isLoading, loginWithGoogle, logout }}>{children}</AuthContext.Provider>
}
