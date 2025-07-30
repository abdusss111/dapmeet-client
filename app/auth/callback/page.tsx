"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.dapmeet.kz"

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      console.error("OAuth error:", error)
      setStatus("error")
      setErrorMsg("Ошибка авторизации Google")
      return
    }

    if (!code) {
      setStatus("error")
      setErrorMsg("Код авторизации не получен")
      return
    }

    const authenticate = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/google`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText || "Authentication failed")
        }

        const data = await response.json()

        // Store the JWT token and user data
        localStorage.setItem("APP_JWT", data.access_token)
        localStorage.setItem("dapter_user", JSON.stringify(data.user))

        // Handle Chrome extension communication if needed
        const token = localStorage.getItem("APP_JWT")
        if (token && window.opener) {
          window.opener.postMessage(
            { token },
            "chrome-extension://liphcklmjpciifdofjfhhoibflpocpnc"
          )
          window.close()
        }

        setStatus("success")
        // Redirect to meetings page
        window.location.href = "/meetings"
      } catch (err: any) {
        console.error("Authentication error:", err)
        setStatus("error")
        setErrorMsg("Не удалось авторизоваться. Попробуйте снова.")
      }
    }

    authenticate()
  }, [searchParams])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
        <p className="text-gray-600">Авторизация через Google...</p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 space-y-4">
        <p className="text-red-500 font-semibold">{errorMsg}</p>
        <button
          onClick={() => (window.location.href = "/login")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Вернуться на страницу входа
        </button>
      </div>
    )
  }

  return null
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}
