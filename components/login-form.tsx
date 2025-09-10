"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, Shield, AlertCircle } from "lucide-react"
import { API_CONFIG, getApiUrl } from "@/lib/api-config"

interface LoginFormProps {
  onLogin: (token: string) => void
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const endpoint = isLogin ? API_CONFIG.endpoints.login : API_CONFIG.endpoints.register
      const response = await fetch(getApiUrl(endpoint), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onLogin(data.token)
      } else {
        setError(data.message || "Authentication failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-black text-white font-sans min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">SENTINEL ACCESS</h1>
          <p className="text-gray-400 uppercase tracking-wide text-sm">CLASSIFIED OPERATIONS PLATFORM</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 border border-red-500 bg-red-500/10 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium uppercase tracking-wide mb-2">USERNAME</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 bg-transparent border border-gray-600 focus:border-white focus:outline-none transition-colors"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium uppercase tracking-wide mb-2">PASSWORD</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 pr-12 bg-transparent border border-gray-600 focus:border-white focus:outline-none transition-colors"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium uppercase tracking-wide mb-2">CONFIRM PASSWORD</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 bg-transparent border border-gray-600 focus:border-white focus:outline-none transition-colors"
                placeholder="Confirm password"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-white text-black font-medium uppercase tracking-wide hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "AUTHENTICATING..." : isLogin ? "ACCESS SYSTEM" : "CREATE ACCOUNT"}
          </button>
        </form>

        {/* Toggle */}
        <div className="text-center mt-8">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-400 hover:text-white transition-colors uppercase tracking-wide text-sm"
          >
            {isLogin ? "Need an account? Register" : "Already have access? Login"}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600 text-xs uppercase tracking-wide">AUTHORIZED PERSONNEL ONLY</div>
      </div>
    </div>
  )
}
