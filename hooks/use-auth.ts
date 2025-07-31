"use client"

import { useState, useEffect } from "react"

const useAuth = () => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuthStatus = async () => {
      // Проверить наличие токенов в localStorage/cookies
      if (typeof window !== "undefined") {
        const authToken = localStorage.getItem("auth-token")
        const refreshToken = localStorage.getItem("refresh-token")

        if (authToken && refreshToken) {
          // Пользователь авторизован
          setIsAuthenticated(true)
          setUser({ authToken, refreshToken })
        } else {
          // Пользователь не авторизован
          setIsAuthenticated(false)
          setUser(null)
        }
      }
      setIsLoading(false)
    }

    checkAuthStatus()
  }, [])

  const login = async (authToken: string, refreshToken: string) => {
    // Сохранить токены в localStorage/cookies
    if (typeof window !== "undefined") {
      localStorage.setItem("auth-token", authToken)
      localStorage.setItem("refresh-token", refreshToken)
    }

    // Установить состояние пользователя
    setUser({ authToken, refreshToken })
    setIsAuthenticated(true)
  }

  const logout = async () => {
    // Очистить токены из localStorage/cookies
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-token")
      localStorage.removeItem("refresh-token")
    }

    // Сбросить состояние пользователя
    setUser(null)
    setIsAuthenticated(false)
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }
}

export default useAuth
