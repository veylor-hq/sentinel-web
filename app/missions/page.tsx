"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { API_CONFIG, getApiUrl } from "@/lib/api-config"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Circle,
  AlertCircle,
  XCircle,
  PauseCircle,
} from "lucide-react"

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

const COLUMNS = [
  { key: "planned", label: "Planned", icon: <Clock className="w-4 h-4" />, color: "text-blue-400" },
  { key: "active", label: "Active", icon: <Circle className="w-4 h-4 fill-current" />, color: "text-green-400" },
  { key: "completed", label: "Completed", icon: <CheckCircle className="w-4 h-4" />, color: "text-green-500" },
  { key: "failed", label: "Failed", icon: <AlertCircle className="w-4 h-4" />, color: "text-red-500" },
  { key: "canceled", label: "Canceled", icon: <XCircle className="w-4 h-4" />, color: "text-gray-400" },
  { key: "delayed", label: "Delayed", icon: <PauseCircle className="w-4 h-4" />, color: "text-yellow-400" },
]

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
        headers: { Authorization: `${token}`, "Content-Type": "application/json" },
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
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 uppercase tracking-wider">Loading missions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 uppercase tracking-wider">Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black text-white min-h-screen w-full">
      {/* Header */}
      <div className="border-b border-black-800 px-6 py-4">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wider">Missions</h1>
            <p className="text-gray-400 text-sm uppercase tracking-wide">{missions.length} Total</p>
          </div>
        </div>
      </div>

      {/* Kanban / Mobile Sections */}
      <div className="p-4 md:p-6 grid grid-cols-1 md:flex md:gap-4">
        {COLUMNS.map((col) => {
          const filtered = missions.filter(
            (m) => m.status.toLowerCase() === col.key.toLowerCase(),
          )

          // hide empty columns
          if (filtered.length === 0) return null

          return (
            <div
              key={col.key}
              className="flex-1 min-w-full md:min-w-[250px] max-w-full md:max-w-sm bg-black-900 border border-black-800 rounded-lg flex flex-col"
            >
              {/* Column Header */}
              <div className="p-3 border-b border-black-700 flex items-center gap-2 sticky top-0 z-10 bg-black-900">
                <span className={col.color}>{col.icon}</span>
                <h2 className="uppercase font-semibold tracking-wide text-sm">{col.label}</h2>
                <span className="ml-auto text-gray-400 text-xs">{filtered.length}</span>
              </div>

              {/* Column Content */}
              <div className="flex-1 p-3 space-y-3">
                {filtered.map((mission) => (
                  <div
                    key={mission._id}
                    onClick={() => handleMissionClick(mission._id)}
                    className="bg-black-800 border border-black-700 rounded-md p-3 cursor-pointer hover:bg-black-700 transition"
                  >
                    <h3 className="text-sm font-semibold uppercase tracking-wide break-words">
                      {mission.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{mission.summary || "No summary"}</p>
                    <div className="text-[10px] text-gray-500 mt-2">
                      Start: {formatDateTime(mission.start_time)} <br />
                      End: {formatDateTime(mission.end_time)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
