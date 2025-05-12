"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
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
      const isAuthPage = pathname === "/login"
      if (!user && !isAuthPage && pathname !== "/") {
        router.push("/login")
      } else if (user && isAuthPage) {
        router.push("/dashboard")
      }
    }
  }, [user, isLoading, pathname, router])

  const loginWithGoogle = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
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

    window.location.href = authUrl
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("dapter_user")
    localStorage.removeItem("APP_JWT")
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
