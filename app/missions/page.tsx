"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { API_CONFIG, getApiUrl } from "@/lib/api-config"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, CheckCircle, Circle, AlertCircle } from "lucide-react"

interface Mission {
  _id: string
  name: string
  operator: string
  start_time: string | null
  end_time: string | null
  status: string
  summary: string | null
  tags: string[]
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/")
      return
    }

    fetchMissions(token)
  }, [router])

  const fetchMissions = async (token: string) => {
    try {
      setIsLoading(true)
      const endpoint = API_CONFIG.endpoints.missions
      const response = await fetch(getApiUrl(endpoint), {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("auth_token")
          router.push("/")
          return
        }
        throw new Error(`Failed to fetch missions: ${response.status}`)
      }

      const data = await response.json()
      setMissions(data)
    } catch (err) {
      console.error("Error fetching missions:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch missions")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "active":
        return <Circle className="w-4 h-4 text-green-500 fill-current" />
      case "planned":
        return <Clock className="w-4 h-4 text-blue-500" />
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Circle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-300"
      case "active":
        return "text-green-500"
      case "planned":
        return "text-blue-500"
      case "failed":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "Not set"
    return new Date(dateString).toLocaleString()
  }

  const handleMissionClick = (missionId: string) => {
    router.push(`/mission/${missionId}`)
  }

  const handleBack = () => {
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="bg-black text-white font-sans min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 uppercase tracking-wider">LOADING MISSIONS...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-black text-white font-sans min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 uppercase tracking-wider">ERROR</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
            RETRY
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black text-white font-sans min-h-screen w-full">
      {/* Header */}
      <div className="border-b border-black-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={handleBack} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-8 h-8 mr-2" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-wider">MISSIONS</h1>
              <p className="text-gray-400 text-sm uppercase tracking-wide">{missions.length} TOTAL MISSIONS</p>
            </div>
          </div>
        </div>
      </div>

      {/* Missions List */}
      <div className="p-4 sm:p-6">
        {missions.length === 0 ? (
            <div className="text-center py-12">
            <Circle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2 uppercase tracking-wider">NO MISSIONS</h3>
            <p className="text-gray-400 text-sm sm:text-base">No missions found in the system.</p>
            </div>
        ) : (
            <div className="space-y-4">
            {missions.map((mission) => (
                <div
                key={mission._id}
                onClick={() => handleMissionClick(mission._id)}
                className="bg-black-900 border border-black-800 p-4 sm:p-6 rounded-lg cursor-pointer hover:bg-black-700 hover:border-white transition-colors"
                >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    {/* Left side (title, status, summary) */}
                    <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        {getStatusIcon(mission.status)}
                        <h3 className="text-base sm:text-lg font-semibold uppercase tracking-wide break-words">
                        {mission.name}
                        </h3>
                        <span
                        className={`text-xs sm:text-sm font-medium uppercase tracking-wider ${getStatusColor(mission.status)}`}
                        >
                        {mission.status}
                        </span>
                    </div>

                    {/* Times grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-gray-400">
                        <div>
                        <span className="text-gray-500 uppercase tracking-wide">Start Time:</span>
                        <br />
                        {formatDateTime(mission.start_time)}
                        </div>
                        <div>
                        <span className="text-gray-500 uppercase tracking-wide">End Time:</span>
                        <br />
                        {formatDateTime(mission.end_time)}
                        </div>
                    </div>

                    {/* Summary */}
                    {mission.summary && (
                        <div className="mt-3">
                        <span className="text-gray-500 uppercase tracking-wide text-xs sm:text-sm">Summary:</span>
                        <p className="text-gray-300 mt-1 text-sm sm:text-base">{mission.summary}</p>
                        </div>
                    )}

                    {/* Tags */}
                    {mission.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                        {mission.tags.map((tag, index) => (
                            <span
                            key={index}
                            className="bg-gray-800 text-gray-300 px-2 py-1 text-[10px] sm:text-xs uppercase tracking-wide border border-gray-700 rounded"
                            >
                            {tag}
                            </span>
                        ))}
                        </div>
                    )}
                    </div>

                    {/* Right side (ID) */}
                    <div className="text-left sm:text-right text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide break-all">
                    ID: {mission._id}
                    </div>
                </div>
                </div>
            ))}
            </div>
        )}
        </div>

    </div>
  )
}
