"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function GoogleCallbackPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    const code = searchParams.get("code")

    if (!code) {
      setStatus("error")
      setErrorMsg("Код авторизации не получен из URL")
      return
    }

    const authenticate = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        })

        if (!res.ok) {
          const text = await res.text()
          throw new Error(text)
        }

        const data = await res.json()

        localStorage.setItem("APP_JWT", data.access_token)
        localStorage.setItem("dapter_user", JSON.stringify(data.user))

        // Надежный редирект
        window.location.href = "/meetings"
      } catch (err: any) {
        console.error("Ошибка авторизации:", err)
        setErrorMsg("Не удалось авторизоваться. Попробуйте снова.")
        setStatus("error")
      }
    }

    authenticate()
  }, [searchParams])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
        <p className="text-muted-foreground">Авторизация через Google...</p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 space-y-4">
        <p className="text-red-500 font-semibold">{errorMsg}</p>
        <button
          onClick={() => (window.location.href = "/login")}
          className="px-4 py-2 bg-slate-900 text-white rounded-md"
        >
          Вернуться на страницу входа
        </button>
      </div>
    )
  }

  return null
}
