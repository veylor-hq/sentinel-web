"use client"

import { useState, useEffect } from "react"
import LoginForm from "@/components/login-form"
import Dashboard from "@/components/dashboard"
import { API_CONFIG, getApiUrl } from "@/lib/api-config"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      verifyToken(token)
    } else {
      setIsLoading(false)
    }
  }, [])

  const verifyToken = async (token: string) => {
    try {
      const endpoint = API_CONFIG.endpoints.verify_token
      const response = await fetch(getApiUrl(endpoint), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      })
      if (response.ok) {
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem("auth_token")
      }
    } catch (error) {
      console.error("Token verification failed:", error)
      localStorage.removeItem("auth_token")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = (token: string) => {
    localStorage.setItem("auth_token", token)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return (
      <div className="bg-black text-white font-sans min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 uppercase tracking-wider">AUTHENTICATING...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return <Dashboard onLogout={handleLogout} />

}
