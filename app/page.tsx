"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Image from 'next/image';

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
          <object
            data="/dap.svg"
            type="image/svg+xml"
            className="h-auto w-auto rounded-2xl shadow-md border border-slate-400 dark:border-slate-400"
          >
            {/* fallback на случай, если object не загрузится */}
            <img
              src="/dap.svg"
              alt="Dapmeet.AI Logo"
              className="h-auto w-auto object-contain"
            />
          </object>
        </div>



        {/* Title */}
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-2">
             Ваша цифровая dapter для записей онлайн встреч!
          </h1>
          <p className="text-lg text-muted-foreground">
            Анализируйте и извлекайте ценные идеи, моменты из ваших онлайн-встреч
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-2">
          <Button asChild size="lg" className="gap-2">
            <Link href="/login">
              Начать
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
