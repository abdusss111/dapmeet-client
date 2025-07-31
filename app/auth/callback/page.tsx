"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const code = searchParams.get("code")
      const state = searchParams.get("state")
      const error = searchParams.get("error")

      if (error) {
        console.error("OAuth error:", error)
        router.push("/login?error=oauth_error")
        return
      }

      if (!code) {
        console.error("No authorization code received")
        router.push("/login?error=no_code")
        return
      }

      try {
        // Exchange the authorization code for tokens
        const response = await fetch("https://api.dapmeet.kz/api/auth/google/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            state,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.access_token) {
          // Store the token
          localStorage.setItem("APP_JWT", data.access_token)

          // Redirect to dashboard
          router.push("/dashboard")
        } else {
          throw new Error("No access token received")
        }
      } catch (error) {
        console.error("Error during Google callback:", error)
        router.push("/login?error=callback_failed")
      }
    }

    handleGoogleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Обработка авторизации...</p>
      </div>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка...</p>
          </div>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  )
}
