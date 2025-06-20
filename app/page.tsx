"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("APP_JWT")
    if (token) {
      router.push("/meetings")
    }
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-100 px-4">
      <div className="mx-auto max-w-2xl text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src="/logo.png"
            alt="Dapmeet.AI Logo"
            className="rounded-2xl shadow-md dark:border-slate-400 border-slate-400"
          />
        </div>

        {/* Title */}
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-2">
            Ваша цифровая dapter для записей онлайн встреч!
          </h1>
          <p className="text-lg text-muted-foreground">
            Анализируйте и извлекайте ценные идеи из ваших онлайн-встреч
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-2">
          <Button asChild size="lg" className="gap-2">
            <Link href="/login">
              Начать!
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          {/* Privacy Policy Link */}
          <Link href="/privacy" className="text-sm hover:underline">
            Политика конфиденциальности
          </Link>
        </div>
      </div>
    </div>
  )
}
