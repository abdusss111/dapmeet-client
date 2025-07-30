"use client"

import type { ReactNode } from "react"

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>
}

export default ThemeProvider
