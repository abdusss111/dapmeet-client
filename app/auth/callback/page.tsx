"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      console.error("OAuth error:", error)
      router.push("/login?error=oauth_error")
      return
    }

    if (code) {
      // Handle the OAuth code
      const handleOAuthCallback = async () => {
        try {
          // Exchange code for tokens and user info
          const response = await fetch(`https://api.dapmeet.kz/api/auth/google/callback?code=${code}`)
          const data = await response.json()

          if (data.user) {
            login(data.user)
            router.push("/dashboard")
          } else {
            router.push("/login?error=auth_failed")
          }
        } catch (error) {
          console.error("Auth callback error:", error)
          router.push("/login?error=auth_failed")
        }
      }

      handleOAuthCallback()
    } else {
      router.push("/login")
    }
  }, [searchParams, router, login])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Авторизация...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}
