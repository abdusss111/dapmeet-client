"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser, setToken } = useAuth()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code")
      const error = searchParams.get("error")

      if (error) {
        setStatus("error")
        setMessage(`Authentication error: ${error}`)
        return
      }

      if (!code) {
        setStatus("error")
        setMessage("No authorization code received")
        return
      }

      try {
        const response = await fetch("https://api.dapmeet.kz/api/auth/google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        })

        if (!response.ok) {
          throw new Error(`Authentication failed: ${response.status}`)
        }

        const data = await response.json()

        if (data.token && data.user) {
          // Store token and user data
          localStorage.setItem("auth_token", data.token)
          localStorage.setItem("auth_user", JSON.stringify(data.user))

          setStatus("success")
          setMessage("Authentication successful! Redirecting...")

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push("/dashboard")
          }, 1500)
        } else {
          throw new Error("Invalid response from server")
        }
      } catch (err) {
        console.error("Auth callback error:", err)
        setStatus("error")
        setMessage(err instanceof Error ? err.message : "Authentication failed")
      }
    }

    handleCallback()
  }, [searchParams, router, setUser, setToken])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-center">
            {status === "loading" && (
              <>
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <h2 className="text-lg font-semibold mb-2">Authenticating...</h2>
                <p className="text-sm text-gray-600">Please wait while we complete your sign-in.</p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold mb-2 text-green-800">Success!</h2>
                <p className="text-sm text-gray-600">{message}</p>
              </>
            )}

            {status === "error" && (
              <>
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold mb-2 text-red-800">Authentication Failed</h2>
                <p className="text-sm text-gray-600 mb-4">{message}</p>
                <button
                  onClick={() => router.push("/login")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}
