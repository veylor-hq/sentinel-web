"use client"

import { useState, useEffect, useRef } from "react"
import { Activity, Shield, Target, Users, Database, AlertTriangle, Fingerprint, Crosshair, Radar, Terminal, LogOut, X, Settings, MapPin, Save } from "lucide-react"
import { API_CONFIG, getApiUrl } from "@/lib/api-config"
import { useRouter } from 'next/navigation'
import { TacticalMap } from "./tactical-map"
import { AssetManager } from "./asset-manager"
import { MissionTemplateManager } from "./mission-template-manager"
import { FederationManager } from "./federation-manager"
import { motion, AnimatePresence } from "framer-motion"

const HQ_STORAGE_KEY = "sentinel_hq_center"

function loadHQ(): [number, number] {
  try {
    const raw = localStorage.getItem(HQ_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length === 2) return parsed as [number, number]
    }
  } catch { }
  return [30.5234, 50.4501] // Default: Kyiv
}

interface DashboardProps { onLogout: () => void }

export default function Dashboard({ onLogout }: DashboardProps) {
  const [user, setUser] = useState<{ name: string; role: string; email?: string } | null>(null)
  const [stats, setStats] = useState<{
    activeOperations: number;
    activeMissions: any[];
    securityAlerts: number;
    systemStatus: string;
  } | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [activeAlert, setActiveAlert] = useState<{ message: string; type: string } | null>(null)

  const [personnel, setPersonnel] = useState<{ id: string; name: string; coordinates: [number, number] }[]>([])
  const [pois, setPois] = useState<{ id: string; name: string; coordinates: [number, number]; poi_type?: string; threat_level?: string }[]>([])

  const [sysLogs, setSysLogs] = useState<{ time: string, action: string, stat: string, color: string }[]>([
    { time: new Date().toLocaleTimeString('en-US', { hour12: false }), action: "SYSTEM_INIT", stat: "OK", color: "text-green-500" }
  ])

  // HQ settings
  const [hqCenter, setHqCenter] = useState<[number, number]>(() => {
    if (typeof window === "undefined") return [30.5234, 50.4501]
    return loadHQ()
  })
  const [hqLat, setHqLat] = useState(String(hqCenter[1]))
  const [hqLon, setHqLon] = useState(String(hqCenter[0]))
  const [hqSaved, setHqSaved] = useState(false)

  const router = useRouter()

  const addLog = (action: string, stat: string, color: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false })
    setSysLogs(prev => [{ time, action, stat, color }, ...prev].slice(0, 50))
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        const response = await fetch(getApiUrl(API_CONFIG.endpoints.dashboard), {
          headers: { Authorization: `${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setStats({
            activeOperations: data.active_missions.length,
            activeMissions: data.active_missions,
            securityAlerts: 0,
            systemStatus: "OPERATIONAL"
          })
          addLog("DASHBOARD_SYNC", "OK", "text-green-500")
        }

        const poiResponse = await fetch(getApiUrl("/api/private/poi/"), {
          headers: { Authorization: `${token}` }
        })
        if (poiResponse.ok) {
          const poiData = await poiResponse.json()
          setPois(poiData.map((p: any) => ({
            id: p._id,
            name: p.name,
            coordinates: p.location.coordinates,
            poi_type: p.poi_type || "location",
            threat_level: p.threat_level || "unknown"
          })))
          if (poiData.length > 0) addLog(`POI_LOAD: ${poiData.length} markers`, "OK", "text-cyan-500")
        }
      } catch (error) {
        addLog("DASHBOARD_FETCH_ERR", "ERR", "text-red-500")
      }
    }
    fetchDashboardData()
  }, [])

  const handlePoiAdded = (newPoi: any) => {
    setPois(prev => [...prev, {
      id: newPoi._id,
      name: newPoi.name,
      coordinates: newPoi.location.coordinates,
      poi_type: newPoi.poi_type || "location",
      threat_level: newPoi.threat_level || "unknown"
    }])
    addLog(`POI_DROPPED: ${newPoi.name}`, "OK", "text-red-500")
  }

  // WebSocket
  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) return
    const wsUrl = getApiUrl('').replace(/^http/, 'ws') + `/api/ws/telemetry?token=${token}`
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => addLog("WS_LINK_ESTABLISHED", "LIVE", "text-green-500")
    ws.onclose = () => addLog("WS_LINK_LOST", "WARN", "text-orange-500")
    ws.onerror = () => addLog("WS_ERROR", "ERR", "text-red-500")

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        const { type, data, user_id, username } = payload
        const now = new Date().toLocaleTimeString('en-US', { hour12: false })

        if (type === "telemetry_update" || !type) {
          const telemData = type ? data : payload.data
          const uId = user_id || telemData?.asset_id
          const uName = username || "ASSET-" + String(uId).substring(0, 4)
          const lat = telemData?.lat || telemData?.last_location?.coordinates?.[1]
          const lon = telemData?.lon || telemData?.last_location?.coordinates?.[0]
          if (lat && lon) {
            setPersonnel(prev => {
              const idx = prev.findIndex(p => p.id === uId)
              const updated = [...prev]
              if (idx >= 0) updated[idx] = { ...updated[idx], coordinates: [lon, lat] }
              else updated.push({ id: uId, name: uName, coordinates: [lon, lat] })
              return updated
            })
          }
          if (Math.random() > 0.75) addLog(`TELEM_RX: ${uName}`, "OK", "text-green-500")
        } else if (type === "mission_alert") {
          addLog(`MISSION_UPDATE: ${data?.message || "state changed"}`, "ACT", "text-yellow-500")
          setActiveAlert({ message: data?.message || "Mission Status Updated", type: "warning" })
          setTimeout(() => setActiveAlert(null), 5000)
        } else if (type === "security_alert") {
          addLog(`SEC_ALERT: ${data?.message || "triggered"}`, "WARN", "text-red-500")
          setActiveAlert({ message: data?.message || "Security Alert TRIGGERED", type: "danger" })
          setTimeout(() => setActiveAlert(null), 5000)
        } else if (type === "sitrep_alert") {
          addLog(`SITREP_RX: ${data?.operator || 'UNK'} / ${data?.severity || ''}`, "INT", "text-purple-400")
        } else {
          addLog(`WS_EVT: ${type}`, "DBG", "text-gray-600")
        }
      } catch (err) {
        addLog("WS_PARSE_ERR", "ERR", "text-red-500")
      }
    }
    return () => ws.close()
  }, [])

  const saveHQ = () => {
    const lat = parseFloat(hqLat)
    const lon = parseFloat(hqLon)
    if (isNaN(lat) || isNaN(lon)) return
    const center: [number, number] = [lon, lat]
    setHqCenter(center)
    localStorage.setItem(HQ_STORAGE_KEY, JSON.stringify(center))
    setHqSaved(true)
    addLog(`HQ_CENTER_SET: ${lat.toFixed(4)}, ${lon.toFixed(4)}`, "OK", "text-cyan-500")
    setTimeout(() => setHqSaved(false), 2000)
  }

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }
  const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }

  return (
    <div className="bg-[#050505] text-white font-mono min-h-screen flex selection:bg-cyan-900 selection:text-cyan-100">

      {/* Global Alert */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] border px-6 py-3 flex items-center gap-3 font-mono text-sm tracking-widest ${activeAlert.type === 'danger' ? 'bg-red-900/90 border-red-500 shadow-[0_0_30px_rgba(255,0,0,0.5)]' : 'bg-yellow-900/90 border-yellow-500 shadow-[0_0_30px_rgba(255,255,0,0.5)]'}`}
          >
            <AlertTriangle className={`w-5 h-5 animate-pulse ${activeAlert.type === 'danger' ? 'text-red-400' : 'text-yellow-400'}`} />
            <span className="uppercase font-bold">{activeAlert.message}</span>
            <button onClick={() => setActiveAlert(null)} className="ml-4 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className="w-16 md:w-64 border-r border-[#1a1a1a] bg-[#0a0a0a] flex flex-col justify-between hidden sm:flex shrink-0">
        <div className="flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-center md:justify-start md:px-5 border-b border-[#1a1a1a] shadow-[0_0_15px_rgba(0,255,255,0.05)] gap-2">
            <Fingerprint className="w-5 h-5 text-cyan-500 shrink-0" />
            <div className="hidden md:block">
              <div className="text-cyan-500 font-black tracking-[0.15em] text-sm leading-none">VEYLOR</div>
              <div className="text-gray-600 tracking-[0.2em] text-[9px] leading-tight">/// SENTINEL</div>
            </div>
          </div>

          <nav className="flex flex-col gap-1 p-2 mt-4">
            {[
              { id: 'overview', icon: Radar, label: 'COP View' },
              { id: 'missions', icon: Target, label: 'Operations' },
              { id: 'intel', icon: Database, label: 'Intelligence' },
              { id: 'comms', icon: Terminal, label: 'Federation / SIGINT' },
              { id: 'settings', icon: Settings, label: 'Settings' },
            ].map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`flex items-center p-3 rounded-md transition-all duration-300 relative group overflow-hidden ${activeTab === item.id ? 'bg-[#151515]' : 'hover:bg-[#111]'}`}>
                {activeTab === item.id && (
                  <motion.div layoutId="activeNav" className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_rgba(0,255,255,0.8)]" />
                )}
                <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                <span className={`ml-3 text-xs tracking-widest hidden md:block ${activeTab === item.id ? 'text-cyan-100 font-bold' : 'text-gray-500 group-hover:text-gray-300'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-[#1a1a1a]">
          <button onClick={onLogout} className="flex items-center justify-center md:justify-start w-full p-2 text-gray-500 hover:text-red-400 transition-colors group">
            <LogOut className="w-5 h-5" />
            <span className="ml-3 text-xs tracking-widest hidden md:block uppercase group-hover:text-red-400">Terminate</span>
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="h-16 border-b border-[#1a1a1a] bg-[#080808] flex items-center justify-between px-6 shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(0,255,255,0.02),transparent)] translate-x-[-100%] animate-[scan_3s_linear_infinite]" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <h1 className="text-sm md:text-md text-gray-300 tracking-[0.3em] font-medium">SENTINEL_CORE</h1>
          </div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">ID: {user?.name || 'GUEST'}</span>
              <span className="text-[9px] text-cyan-600 uppercase tracking-widest">CLEARANCE: TS/SCI</span>
            </div>
            <div className="w-8 h-8 rounded border border-[#333] bg-[#111] flex items-center justify-center">
              <Shield className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#000000] relative">
          <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none"
            style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

          {!stats ? (
            <div className="flex flex-col items-center justify-center flex-1 space-y-4">
              <Crosshair className="w-8 h-8 text-cyan-900 animate-spin-slow" />
              <p className="text-xs text-cyan-900 tracking-[0.3em] animate-pulse">ESTABLISHING LINK...</p>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col flex-1 relative z-10 overflow-hidden">

              {/* ── Metric ribbon (always visible) ── */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 border-b border-[#111] shrink-0">
                {[
                  { label: 'ACTIVE OPS', value: stats.activeOperations, icon: Activity, color: 'text-green-400' },
                  { label: 'ALERTS', value: stats.securityAlerts, icon: AlertTriangle, color: 'text-red-500' },
                  { label: 'INTEGRITY', value: stats.systemStatus, icon: Shield, color: 'text-cyan-400' },
                  { label: 'NODES', value: '4 ONLINE', icon: Users, color: 'text-gray-300' }
                ].map((metric, i) => (
                  <div key={i} className={`border-r border-[#111] bg-[#0a0a0a] px-6 py-3 relative overflow-hidden group ${i === 3 ? 'border-r-0' : ''}`}>
                    <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-15 transition-opacity">
                      <metric.icon className="w-10 h-10" />
                    </div>
                    <p className="text-[9px] text-gray-600 tracking-widest uppercase mb-0.5">{metric.label}</p>
                    <p className={`text-lg tracking-wider font-light ${metric.color}`}>{metric.value}</p>
                  </div>
                ))}
              </motion.div>

              {/* ── Tab content ── */}
              {activeTab === 'overview' && (
                <div className="flex flex-1 overflow-hidden">
                  {/* MAP — takes all remaining space */}
                  <div className="flex-1 flex flex-col min-w-0 relative border-r border-[#1a1a1a]">
                    <div className="h-8 border-b border-[#1a1a1a] bg-[#0a0a0a] flex items-center justify-between px-4 shrink-0">
                      <div className="flex items-center gap-2">
                        <Radar className="w-3 h-3 text-cyan-500" />
                        <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-500">COMMON OPERATING PICTURE</span>
                      </div>
                      <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      </div>
                    </div>
                    <div className="flex-1 relative">
                      <TacticalMap personnel={personnel} pois={pois} onPoiAdded={handlePoiAdded} initialCenter={hqCenter} />
                      <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] z-20" />
                    </div>
                  </div>

                  {/* Right sidebar: Active Missions + SYS_LOG */}
                  <div className="w-72 xl:w-80 flex flex-col shrink-0 overflow-hidden">
                    {/* Active Missions */}
                    <div className="border-b border-[#1a1a1a] flex flex-col" style={{ maxHeight: '45%' }}>
                      <div className="p-3 border-b border-[#1a1a1a] bg-[#0d0d0d] shrink-0">
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <Target className="w-3 h-3 text-cyan-600" /> ACTIVE MISSIONS
                        </span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-2">
                        {stats.activeMissions.length > 0 ? stats.activeMissions.map((mission) => (
                          <div key={mission.id} onClick={() => router.push(`/mission/${mission.id}`)}
                            className="p-3 mb-2 border border-[#1a1a1a] hover:border-cyan-900/50 hover:bg-[#111] transition-all cursor-pointer relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-yellow-500/50" />
                            <div className="pl-2">
                              <span className="text-xs text-gray-200 tracking-wider font-bold block mb-1">{mission.name}</span>
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] text-gray-500 tracking-widest">{mission.steps?.[0]?.name || 'NO ACTIVE STEP'}</span>
                                <span className="text-[8px] px-1.5 py-0.5 border border-yellow-500/30 text-yellow-500 bg-yellow-500/10">
                                  {mission.status?.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                        )) : (
                          <div className="h-full flex items-center justify-center p-4">
                            <span className="text-[10px] text-gray-600 tracking-widest uppercase text-center border border-dashed border-[#222] p-4 w-full">No active operations</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SYS_LOG — live, functional */}
                    <div className="flex flex-col flex-1 overflow-hidden bg-[#050505]">
                      <div className="p-2 border-b border-[#1a1a1a] flex justify-between items-center bg-[#080808] shrink-0">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">SYS_LOG</span>
                        <span className="text-[9px] text-green-500/60 animate-pulse flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" /> REC
                        </span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-[10px]">
                        {sysLogs.map((log, idx) => (
                          <div key={idx} className="flex gap-2 hover:bg-[#0d0d0d] px-1 py-0.5 transition-colors">
                            <span className="text-gray-700 shrink-0 w-16">{log.time}</span>
                            <span className="flex-1 text-gray-400 truncate">{log.action}</span>
                            <span className={`shrink-0 ${log.color}`}>{log.stat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'intel' && (
                <motion.div variants={itemVariants} className="flex-1 overflow-y-auto p-6 border border-[#1a1a1a] bg-[#050505] m-4">
                  <AssetManager />
                </motion.div>
              )}

              {activeTab === 'missions' && (
                <motion.div variants={itemVariants} className="flex-1 overflow-y-auto p-6 border border-[#1a1a1a] bg-[#050505] m-4">
                  <MissionTemplateManager />
                </motion.div>
              )}

              {activeTab === 'comms' && (
                <motion.div variants={itemVariants} className="flex-1 overflow-y-auto p-6 border border-[#1a1a1a] bg-[#050505] m-4">
                  <FederationManager />
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div variants={itemVariants} className="flex-1 overflow-y-auto p-6 m-4">
                  <h2 className="text-sm text-cyan-500 font-bold uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                    <Settings className="w-4 h-4" /> System Configuration
                  </h2>

                  {/* HQ Point */}
                  <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-5 mb-4 max-w-md">
                    <p className="text-xs text-cyan-600 tracking-widest uppercase font-bold mb-1 flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> HQ Default Location
                    </p>
                    <p className="text-[10px] text-gray-600 mb-4 tracking-wider">
                      The COP map will open centered on this point on every session.
                    </p>
                    <div className="flex gap-2 mb-3">
                      <div className="flex-1">
                        <label className="text-[9px] text-gray-600 uppercase tracking-widest mb-1 block">Latitude</label>
                        <input
                          type="number" step="0.0001"
                          className="w-full bg-black border border-[#333] text-sm p-2 text-gray-300 focus:border-cyan-700 outline-none"
                          value={hqLat} onChange={e => setHqLat(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") saveHQ() }}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[9px] text-gray-600 uppercase tracking-widest mb-1 block">Longitude</label>
                        <input
                          type="number" step="0.0001"
                          className="w-full bg-black border border-[#333] text-sm p-2 text-gray-300 focus:border-cyan-700 outline-none"
                          value={hqLon} onChange={e => setHqLon(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") saveHQ() }}
                        />
                      </div>
                    </div>
                    <button onClick={saveHQ}
                      className={`flex items-center gap-2 px-4 py-2 text-xs tracking-widest uppercase transition-all ${hqSaved ? 'bg-green-900/20 border-green-700 text-green-400 border' : 'bg-cyan-900/20 border border-cyan-800 text-cyan-400 hover:bg-cyan-900/40'}`}>
                      <Save className="w-3 h-3" />
                      {hqSaved ? "SAVED ✓" : "SAVE HQ POINT"}
                    </button>
                    {hqCenter && (
                      <p className="text-[9px] text-gray-600 mt-2">
                        Current: {hqCenter[1].toFixed(5)}, {hqCenter[0].toFixed(5)}
                      </p>
                    )}
                  </div>

                  {/* Operator info */}
                  <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-5 max-w-md">
                    <p className="text-xs text-cyan-600 tracking-widest uppercase font-bold mb-3 flex items-center gap-2">
                      <Shield className="w-3 h-3" /> Operator Identity
                    </p>
                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between border-b border-[#111] pb-1">
                        <span className="text-gray-600 uppercase tracking-widest">Callsign</span>
                        <span className="text-gray-300">{user?.name || "—"}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#111] pb-1">
                        <span className="text-gray-600 uppercase tracking-widest">Role</span>
                        <span className="text-gray-300">{user?.role || "OPERATOR"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 uppercase tracking-widest">Clearance</span>
                        <span className="text-cyan-500">TS/SCI</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            </motion.div>
          )}
        </main>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateX(-100%) }
          100% { transform: translateX(100%) }
        }
      `}</style>
    </div>
  )
}