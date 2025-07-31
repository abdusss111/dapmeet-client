"use client"
import { createContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => void
  logout: () => void
  loading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem("auth_token")
    const storedUser = localStorage.getItem("auth_user")

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const publicRoutes = ["/login", "/privacy", "/"] // add any more public routes here
    const isPublicPage = publicRoutes.includes(pathname)

    if (!user && !isPublicPage) {
      router.push("/")
    } else if (user && pathname === "/login") {
      router.push("/meetings")
    }
  }, [user, loading, pathname, router])

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
    const scope = "openid email profile"

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

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("https://api.dapmeet.kz/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error("Login failed")
      }

      const data = await response.json()
      setToken(data.token)
      setUser(data.user)

      // Store in localStorage
      localStorage.setItem("auth_token", data.token)
      localStorage.setItem("auth_user", JSON.stringify(data.user))
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, token, login, loginWithGoogle, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
