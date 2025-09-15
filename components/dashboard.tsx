"use client"

import { useState, useEffect } from "react"
import { Activity, Shield, Target, Users, Database, AlertTriangle } from "lucide-react"
import { API_CONFIG, getApiUrl } from "@/lib/api-config"
import { useRouter } from 'next/navigation'

interface DashboardProps {
  onLogout: () => void
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)
  const [stats, setStats] = useState<{
    activeOperations: number;
    activeMissions: any[];
    securityAlerts: number;
    systemStatus: string;
    lastLogin: string;
  } | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Fetch user data and dashboard stats
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        // Replace with your backend endpoint
        const response = await fetch(getApiUrl(API_CONFIG.endpoints.dashboard), {
          headers: {
            Authorization: `${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setStats({
            activeOperations: data.active_missions.length,
            activeMissions: data.active_missions,
            securityAlerts: 0,
            systemStatus: "OPERATIONAL",
            lastLogin: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="bg-black text-white font-sans min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wider">SENTINEL COMMAND CENTER</h1>
            <p className="text-gray-400 text-sm uppercase tracking-wide">
              {user ? `OPERATOR: ${user.name} | CLEARANCE: ADMIN` : "LOADING CREDENTIALS..."}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 border border-gray-600 hover:border-white transition-colors uppercase tracking-wider text-sm"
          >
            LOGOUT
          </button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-6 space-y-8">
        {stats && (
          <>
            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="border border-gray-800 p-6 hover:border-gray-600 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <Activity className="w-5 h-5" />
                  <span className="text-sm uppercase tracking-wider text-gray-400">Active Operations</span>
                </div>
                <div className="text-3xl font-bold">
                  {stats.activeOperations}
                </div>
              </div>

              <div className="border border-gray-800 p-6 hover:border-gray-600 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm uppercase tracking-wider text-gray-400">Security Alerts</span>
                </div>
                <div className="text-3xl font-bold text-red-400">
                  {stats.securityAlerts}
                </div>
              </div>

              <div className="border border-gray-800 p-6 hover:border-gray-600 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm uppercase tracking-wider text-gray-400">System Status</span>
                </div>
                <div className="text-lg font-bold text-green-400">
                  {stats.systemStatus}
                </div>
              </div>

              <div className="border border-gray-800 p-6 hover:border-gray-600 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <Users className="w-5 h-5" />
                  <span className="text-sm uppercase tracking-wider text-gray-400">Last Access</span>
                </div>
                <div className="text-sm">
                  {new Date(stats.lastLogin).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold uppercase tracking-wider border-l-2 border-white pl-4">QUICK ACTIONS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="border border-gray-800 p-4 text-left hover:border-white transition-colors group">
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 group-hover:text-white text-gray-400" />
                    <div>
                      <div className="font-semibold uppercase tracking-wide">INITIATE OPERATION</div>
                      <div className="text-sm text-gray-400">Deploy new tactical mission</div>
                    </div>
                  </div>
                </button>

                <button
                  className="border border-gray-800 p-4 text-left hover:border-white transition-colors group"
                  onClick={() => router.push('/missions')}
                  >
                  <div className="flex items-center space-x-3">
                    <Database className="w-5 h-5 group-hover:text-white text-gray-400" />
                    <div>
                      <div className="font-semibold uppercase tracking-wide">ACCESS INTELLIGENCE</div>
                      <div className="text-sm text-gray-400">Review classified data streams</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Main Content: Operations and Activity */}
            <div className="md:grid md:grid-cols-2 md:gap-8 space-y-8 md:space-y-0">
                {/* Active Operations List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold uppercase tracking-wider border-l-2 border-white pl-4">ACTIVE OPERATIONS</h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {stats.activeMissions.length > 0 ? (
                            stats.activeMissions.map((mission) => (
                                <div
                                    key={mission.id}
                                    onClick={() => router.push(`/mission/${mission.id}`)}
                                    className="border border-gray-800 p-3 flex items-center justify-between hover:border-gray-600 transition-colors"
                                >
                                    <div className="flex flex-col space-y-1">
                                        <span className="text-sm font-semibold">{mission.name}</span>
                                        {mission.steps.length > 0 &&
                                            <span className="text-xs text-gray-500">
                                                CURRENT STEP: {mission.steps[0].name}
                                            </span>
                                        }
                                    </div>
                                    <span
                                        className={`text-xs px-2 py-1 border uppercase tracking-wider ${
                                            mission.status === "active"
                                                ? "text-yellow-400 border-yellow-400"
                                                : "text-gray-400 border-gray-400"
                                        }`}
                                    >
                                        {mission.status.toUpperCase()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-gray-400 text-sm italic">
                                No active operations at this time.
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold uppercase tracking-wider border-l-2 border-white pl-4">RECENT ACTIVITY</h2>
                    <div className="space-y-2 h-96 overflow-y-auto">
                        {[
                            { time: "14:32", action: "Security scan completed", status: "SUCCESS" },
                            { time: "13:45", action: "Operation BLACKBIRD initiated", status: "ACTIVE" },
                            { time: "12:18", action: "Intelligence report generated", status: "CLASSIFIED" },
                            { time: "11:02", action: "System backup completed", status: "SUCCESS" },
                            { time: "10:15", action: "Network diagnostics initiated", status: "ACTIVE" },
                            { time: "09:30", action: "System update applied", status: "SUCCESS" },
                            { time: "08:40", action: "User 'agent007' logged in", status: "INFO" },
                            { time: "07:55", action: "External threat detected", status: "ALERT" },
                            { time: "07:10", action: "Database synchronization", status: "SUCCESS" },
                            { time: "06:20", action: "System readiness check", status: "SUCCESS" },
                        ].map((activity, index) => (
                            <div
                                key={index}
                                className="border border-gray-800 p-3 flex items-center justify-between hover:border-gray-600 transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                    <span className="text-gray-400 text-sm font-mono">{activity.time}</span>
                                    <span className="text-sm">{activity.action}</span>
                                </div>
                                <span
                                    className={`text-xs px-2 py-1 border uppercase tracking-wider ${
                                        activity.status === "SUCCESS"
                                            ? "text-green-400 border-green-400"
                                            : activity.status === "ACTIVE" || activity.status === "ALERT"
                                                ? "text-yellow-400 border-yellow-400"
                                                : "text-gray-400 border-gray-400"
                                    }`}
                                >
                                    {activity.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}