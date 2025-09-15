"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Clock, CheckCircle, Circle, AlertCircle, Play } from "lucide-react"
import { API_CONFIG, getApiUrl } from "@/lib/api-config"

interface Location {
  _id: string
  name: string
  location_type: string
  coordinates: {
    lat: number
    lon: number
  }
}

interface Step {
  _id: string
  order: number
  name: string
  step_type: string
  planned_start: string | null
  planned_end: string | null
  actual_start: string | null
  actual_end: string | null
  status: "planned" | "active" | "completed" | "failed"
  location: Location
}

interface Mission {
  _id: string
  name: string
  operator: string
  start_time: string
  end_time: string | null
  status: "planned" | "active" | "completed" | "failed"
  summary: string | null
  tags: string[]
}

interface MissionData {
  mission: Mission
  steps: Step[]
}

const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-5 h-5 text-green-400" />
    case "active":
      return <Circle className="w-5 h-5 text-green-400 fill-current animate-pulse" />
    case "failed":
      return <AlertCircle className="w-5 h-5 text-red-400" />
    default:
      return <Circle className="w-5 h-5 text-gray-400" />
  }
}

export default function MissionPage() {
  const params = useParams()
  const router = useRouter()
  const [missionData, setMissionData] = useState<MissionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [proceeding, setProceeding] = useState(false)

  const id = params.id as string

  const handleProceed = async () => {
    if (!missionData) return

    setProceeding(true)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        router.push("/")
        return
      }

      const endpoint = API_CONFIG.endpoints.proceed_step(id)
      const response = await fetch(getApiUrl(endpoint), {
        method: "POST",
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
        throw new Error(`Failed to proceed mission: ${response.status}`)
      }

      // Refresh mission data after successful proceed
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to proceed mission")
    } finally {
      setProceeding(false)
    }
  }

  useEffect(() => {
    // Validate BSON ObjectId
    if (!isValidObjectId(id)) {
      setError("Invalid mission ID format")
      setLoading(false)
      return
    }

    const fetchMission = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        if (!token) {
          router.push("/")
          return
        }

        const endpoint = API_CONFIG.endpoints.mission_details(id)
        const response = await fetch(getApiUrl(endpoint) + `?include_steps=true&include_locations=true`, {
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
          throw new Error(`Failed to fetch mission: ${response.status}`)
        }

        const data = await response.json()
        console.log("[v0] Mission data received:", data)
        console.log(
          "[v0] Steps with status:",
          data.steps?.map((step: any) => ({ name: step.name, status: step.status, order: step.order })),
        )
        setMissionData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load mission")
      } finally {
        setLoading(false)
      }
    }

    fetchMission()
  }, [id, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading mission data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Error Loading Mission</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded hover:bg-white/20 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!missionData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Mission Not Found</h1>
          <p className="text-gray-400 mb-4">The requested mission could not be found.</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded hover:bg-white/20 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const { mission, steps } = missionData

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="break-words">
              <h1 className="text-xl sm:text-2xl font-bold">{mission.name}</h1>
              <p className="text-gray-400 text-sm break-all">Mission ID: {mission._id}</p>
            </div>
          </div>

          {(mission.status === "planned" || mission.status === "active") && (
            <button
              onClick={handleProceed}
              disabled={proceeding}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 border border-green-500 rounded-lg transition-colors font-medium text-sm sm:text-base"
            >
              {proceeding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Proceed Mission
                </>
              )}
            </button>
          )}
        </div>

        {/* Mission Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className=" border border-white/25 rounded-lg p-4 sm:p-6">
            <h3 className="text-xs sm:text-sm font-medium text-gray-400 mb-2">START TIME</h3>
            <div className="flex items-center gap-2 text-sm sm:text-base">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{new Date(mission.start_time).toLocaleString()}</span>
            </div>
          </div>

          <div className="border border-white/25 rounded-lg p-4 sm:p-6">
            <h3 className="text-xs sm:text-sm font-medium text-black-400 mb-2">DURATION</h3>
            <div className="flex items-center gap-2 text-sm sm:text-base">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>
                {mission.end_time
                  ? `${Math.round(
                      (new Date(mission.end_time).getTime() - new Date(mission.start_time).getTime()) /
                        (1000 * 60),
                    )} min`
                  : "Ongoing"}
              </span>
            </div>
          </div>
        </div>

        {/* Mission Steps */}
        <div className=" border border-white/10 rounded-lg p-4 sm:p-6 mb-8">
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Mission Steps</h2>
          <div className="space-y-3 sm:space-y-4">
            {steps.map((step) => (
              <div
                key={step._id}
                className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-black-800 border border-white/20 rounded-lg"
              >
                {/* Step number */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.status === "active"
                      ? "bg-green-400/20 text-green-400"
                      : step.status === "completed"
                      ? "bg-green-400/20 text-green-400"
                      : step.status === "failed"
                      ? "bg-red-400/20 text-red-400"
                      : "bg-white/10 text-white"
                  }`}
                >
                  {step.order}
                </div>

                {/* Step content */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <h3
                      className={`font-medium text-sm sm:text-base ${
                        step.status === "active" ? "text-green-400" : "text-white"
                      }`}
                    >
                      {step.name}
                    </h3>
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] sm:text-xs font-medium ${
                        step.status === "active"
                          ? "text-green-400 bg-green-400/10 border-green-400/20"
                          : step.status === "completed"
                          ? "text-green-400 bg-green-400/10 border-green-400/20"
                          : step.status === "failed"
                          ? "text-red-400 bg-red-400/10 border-red-400/20"
                          : "text-gray-400 bg-gray-400/10 border-gray-400/20"
                      } border`}
                    >
                      {getStatusIcon(step.status)}
                      {step.status.toUpperCase()}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-400">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{step.location.name}</span>
                    <span className="text-gray-500">
                      ({step.location.coordinates.lat.toFixed(6)},{" "}
                      {step.location.coordinates.lon.toFixed(6)})
                    </span>
                  </div>

                  {/* Timing */}
                  {(step.actual_start || step.planned_start) && (
                    <div className="mt-2 text-xs sm:text-sm text-gray-400">
                      {step.actual_start ? (
                        <span>Started: {new Date(step.actual_start).toLocaleString()}</span>
                      ) : (
                        <span>Planned: {new Date(step.planned_start as string).toLocaleString()}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Summary */}
        {mission.summary && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6 mb-8">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Mission Summary</h2>
            <p className="text-gray-300 text-sm sm:text-base">{mission.summary}</p>
          </div>
        )}

        {/* Tags */}
        {mission.tags.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {mission.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 sm:px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs sm:text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

  )
}
