"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Send, Target, Plus, CheckSquare, X, FileText, Edit2, Trash2, ChevronUp, ChevronDown, Save, ArrowLeft, MapPin, Navigation, Route, Crosshair } from "lucide-react"
import { getApiUrl } from "@/lib/api-config"
import { useRouter } from "next/navigation"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

const STEP_TYPES = ["custom", "movement", "activity", "waiting", "social"]
function getToken() { return localStorage.getItem("auth_token") || "" }

interface Coord { lat: number; lon: number }
interface GeoJSONPoint { type: string; coordinates: [number, number] }

interface StepTemplate {
    _id: string
    name: string
    step_type: string
    order: number
    end_time_offset?: number | null
    origin?: GeoJSONPoint | null
    destination?: GeoJSONPoint | null
    route_waypoints?: GeoJSONPoint[]
}

interface MissionTemplateWithSteps {
    mission_template: { _id: string; name: string; tags?: any[] }
    step_templates: StepTemplate[]
}

// ─── Route Planner Map Modal ─────────────────────────────────────────────────

function RoutePlannerModal({ initial, onSave, onClose }: {
    initial: { origin?: Coord | null; destination?: Coord | null; waypoints?: Coord[] }
    onSave: (data: { origin: Coord | null; destination: Coord | null; waypoints: Coord[] }) => void
    onClose: () => void
}) {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<maplibregl.Map | null>(null)
    const originMarker = useRef<maplibregl.Marker | null>(null)
    const destMarker = useRef<maplibregl.Marker | null>(null)
    const waypointMarkers = useRef<maplibregl.Marker[]>([])

    const [origin, setOrigin] = useState<Coord | null>(initial.origin || null)
    const [destination, setDestination] = useState<Coord | null>(initial.destination || null)
    const [waypoints, setWaypoints] = useState<Coord[]>(initial.waypoints || [])
    const [mode, setMode] = useState<"origin" | "destination" | "waypoint" | null>(null)
    const modeRef = useRef<typeof mode>(null)

    // Keep modeRef in sync
    useEffect(() => { modeRef.current = mode }, [mode])

    // Helper to create coloured marker els
    const makeMarkerEl = (color: string, label: string) => {
        const el = document.createElement("div")
        el.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;">
          <div style="background:${color};border:2px solid white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 8px ${color}88;font-size:10px;font-weight:bold;color:white;">${label}</div>
        </div>`
        return el
    }

    const addWaypointMarker = useCallback((coord: Coord, index: number, mapInst: maplibregl.Map) => {
        const el = makeMarkerEl("#f59e0b", String(index + 1))
        const m = new maplibregl.Marker(el).setLngLat([coord.lon, coord.lat]).addTo(mapInst)
        waypointMarkers.current.push(m)
    }, [])

    const clearWaypointMarkers = useCallback(() => {
        waypointMarkers.current.forEach(m => m.remove())
        waypointMarkers.current = []
    }, [])

    useEffect(() => {
        if (!mapContainer.current || map.current) return

        const m = new maplibregl.Map({
            container: mapContainer.current,
            style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
            center: [origin?.lon ?? 30, origin?.lat ?? 50],
            zoom: 12
        })
        map.current = m

        m.on("load", () => {
            // Draw existing origin
            if (origin) {
                const el = makeMarkerEl("#22c55e", "A")
                originMarker.current = new maplibregl.Marker(el).setLngLat([origin.lon, origin.lat]).addTo(m)
            }
            if (destination) {
                const el = makeMarkerEl("#ef4444", "B")
                destMarker.current = new maplibregl.Marker(el).setLngLat([destination.lon, destination.lat]).addTo(m)
            }
            waypoints.forEach((w, i) => addWaypointMarker(w, i, m))

            // Draw route line if we have at least origin + destination
            drawRoute(m, origin, destination, waypoints)
        })

        m.on("click", (e) => {
            const clicked: Coord = { lat: e.lngLat.lat, lon: e.lngLat.lng }
            const currentMode = modeRef.current

            if (currentMode === "origin") {
                originMarker.current?.remove()
                const el = makeMarkerEl("#22c55e", "A")
                originMarker.current = new maplibregl.Marker(el).setLngLat([clicked.lon, clicked.lat]).addTo(m)
                setOrigin(clicked)
                setMode(null)
                m.getCanvas().style.cursor = ""
            } else if (currentMode === "destination") {
                destMarker.current?.remove()
                const el = makeMarkerEl("#ef4444", "B")
                destMarker.current = new maplibregl.Marker(el).setLngLat([clicked.lon, clicked.lat]).addTo(m)
                setDestination(clicked)
                setMode(null)
                m.getCanvas().style.cursor = ""
            } else if (currentMode === "waypoint") {
                setWaypoints(prev => {
                    const next = [...prev, clicked]
                    addWaypointMarker(clicked, prev.length, m)
                    return next
                })
                // Don't reset mode — allow adding multiple
            }
        })

        return () => { m.remove(); map.current = null }
    }, [])

    // Redraw route whenever origin/destination/waypoints change
    useEffect(() => {
        if (map.current && map.current.loaded()) {
            drawRoute(map.current, origin, destination, waypoints)
        }
    }, [origin, destination, waypoints])

    const drawRoute = (m: maplibregl.Map, o: Coord | null, d: Coord | null, wps: Coord[]) => {
        const points: [number, number][] = []
        if (o) points.push([o.lon, o.lat])
        wps.forEach(w => points.push([w.lon, w.lat]))
        if (d) points.push([d.lon, d.lat])

        const sourceId = "route-line"
        const layerId = "route-line-layer"

        if (m.getSource(sourceId)) {
            (m.getSource(sourceId) as maplibregl.GeoJSONSource).setData({
                type: "Feature",
                properties: {},
                geometry: { type: "LineString", coordinates: points }
            })
        } else if (points.length >= 2) {
            m.addSource(sourceId, {
                type: "geojson",
                data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: points } }
            })
            m.addLayer({
                id: layerId,
                type: "line",
                source: sourceId,
                paint: { "line-color": "#06b6d4", "line-width": 2, "line-dasharray": [3, 2] }
            })
        }
    }

    const setMapMode = (newMode: typeof mode) => {
        setMode(prev => {
            const next = prev === newMode ? null : newMode
            if (map.current) map.current.getCanvas().style.cursor = next ? "crosshair" : ""
            return next
        })
    }

    const clearWaypoints = () => {
        clearWaypointMarkers()
        setWaypoints([])
    }

    const handleSave = () => {
        onSave({ origin, destination, waypoints })
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[#050505] border border-cyan-900 shadow-[0_0_60px_rgba(0,0,0,0.95)] w-[820px] max-w-[96vw] font-mono text-white flex flex-col" style={{ height: "580px" }}>
                {/* Header */}
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-cyan-950 to-transparent border-b border-cyan-900 shrink-0">
                    <div className="flex items-center gap-2">
                        <Route className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs text-cyan-400 tracking-widest font-bold uppercase">Route Planner</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
                </div>

                <div className="flex flex-1 min-h-0">
                    {/* Map */}
                    <div className="flex-1 relative">
                        <div ref={mapContainer} className="w-full h-full" />
                        {/* Active mode banner */}
                        {mode && (
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/90 border border-cyan-600 px-3 py-1.5 text-[10px] text-cyan-400 uppercase tracking-widest animate-pulse">
                                {mode === "origin" ? "Click to place POINT A" : mode === "destination" ? "Click to place POINT B" : "Click to add waypoints — click DONE to finish"}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="w-52 border-l border-[#1a1a1a] flex flex-col p-3 gap-3 shrink-0">
                        {/* Point A */}
                        <div>
                            <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Point A (Origin)</p>
                            <button
                                onClick={() => setMapMode("origin")}
                                className={`w-full flex items-center gap-2 p-2 border text-[10px] uppercase tracking-widest transition-all ${mode === "origin" ? "border-green-500 bg-green-900/20 text-green-400 animate-pulse" : "border-[#333] text-gray-500 hover:border-green-700 hover:text-green-500"}`}
                            >
                                <MapPin className="w-3 h-3 text-green-500" />
                                {origin ? `${origin.lat.toFixed(4)}, ${origin.lon.toFixed(4)}` : "Set Point A"}
                            </button>
                            {origin && (
                                <button onClick={() => { originMarker.current?.remove(); setOrigin(null) }} className="text-[9px] text-red-600 hover:text-red-400 mt-0.5 w-full text-left pl-1">Clear</button>
                            )}
                        </div>

                        {/* Waypoints */}
                        <div>
                            <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Waypoints ({waypoints.length})</p>
                            <button
                                onClick={() => setMapMode("waypoint")}
                                className={`w-full flex items-center gap-2 p-2 border text-[10px] uppercase tracking-widest transition-all ${mode === "waypoint" ? "border-yellow-500 bg-yellow-900/20 text-yellow-400 animate-pulse" : "border-[#333] text-gray-500 hover:border-yellow-700 hover:text-yellow-500"}`}
                            >
                                <Crosshair className="w-3 h-3 text-yellow-500" />
                                {mode === "waypoint" ? "Done adding" : "Add Waypoints"}
                            </button>
                            {waypoints.length > 0 && (
                                <div className="mt-1 max-h-24 overflow-y-auto space-y-0.5">
                                    {waypoints.map((w, i) => (
                                        <div key={i} className="text-[8px] text-gray-600 pl-1">{i + 1}. {w.lat.toFixed(4)}, {w.lon.toFixed(4)}</div>
                                    ))}
                                    <button onClick={clearWaypoints} className="text-[9px] text-red-600 hover:text-red-400 pl-1">Clear all</button>
                                </div>
                            )}
                        </div>

                        {/* Point B */}
                        <div>
                            <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Point B (Destination)</p>
                            <button
                                onClick={() => setMapMode("destination")}
                                className={`w-full flex items-center gap-2 p-2 border text-[10px] uppercase tracking-widest transition-all ${mode === "destination" ? "border-red-500 bg-red-900/20 text-red-400 animate-pulse" : "border-[#333] text-gray-500 hover:border-red-700 hover:text-red-500"}`}
                            >
                                <Navigation className="w-3 h-3 text-red-500" />
                                {destination ? `${destination.lat.toFixed(4)}, ${destination.lon.toFixed(4)}` : "Set Point B"}
                            </button>
                            {destination && (
                                <button onClick={() => { destMarker.current?.remove(); setDestination(null) }} className="text-[9px] text-red-600 hover:text-red-400 mt-0.5 w-full text-left pl-1">Clear</button>
                            )}
                        </div>

                        <div className="mt-auto flex flex-col gap-2">
                            <button
                                onClick={handleSave}
                                disabled={!origin && !destination}
                                className="w-full bg-cyan-900/20 border border-cyan-800 text-cyan-400 py-2 text-[10px] tracking-widest uppercase hover:bg-cyan-900/40 transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
                            >
                                <Save className="w-3 h-3" /> Save Route
                            </button>
                            <button onClick={onClose} className="w-full border border-[#333] text-gray-500 py-2 text-[10px] tracking-widest uppercase hover:border-gray-500 transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Template Editor ────────────────────────────────────────────────────────

function TemplateEditor({ template, onClose, onDeleted }: {
    template: MissionTemplateWithSteps
    onClose: () => void
    onDeleted: (id: string) => void
}) {
    const [name, setName] = useState(template.mission_template.name)
    const [steps, setSteps] = useState<StepTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [nameEditing, setNameEditing] = useState(false)

    const [addName, setAddName] = useState("")
    const [addType, setAddType] = useState("custom")
    const [addDuration, setAddDuration] = useState("")
    const [addError, setAddError] = useState("")
    const [addLoading, setAddLoading] = useState(false)

    const [editingStep, setEditingStep] = useState<string | null>(null)
    const [editStepName, setEditStepName] = useState("")
    const [editStepType, setEditStepType] = useState("custom")
    const [editStepDuration, setEditStepDuration] = useState("")

    // Route planner
    const [routePlannerStep, setRoutePlannerStep] = useState<StepTemplate | null>(null)

    const tid = template.mission_template._id

    useEffect(() => { fetchSteps() }, [tid])

    const fetchSteps = async () => {
        setLoading(true)
        try {
            const res = await fetch(getApiUrl(`/api/private/mission/templates/${tid}/steps/`), {
                headers: { Authorization: getToken() }
            })
            if (res.ok) setSteps(await res.json())
        } finally {
            setLoading(false)
        }
    }

    const handleSaveName = async () => {
        setSaving(true)
        try {
            const res = await fetch(getApiUrl(`/api/private/mission/templates/${tid}`), {
                method: "PATCH",
                headers: { Authorization: getToken(), "Content-Type": "application/json" },
                body: JSON.stringify({ name })
            })
            if (res.ok) setNameEditing(false)
        } finally { setSaving(false) }
    }

    const handleAddStep = async () => {
        if (!addName.trim()) return
        setAddLoading(true)
        setAddError("")
        try {
            const res = await fetch(getApiUrl(`/api/private/mission/templates/${tid}/steps/`), {
                method: "POST",
                headers: { Authorization: getToken(), "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: addName.trim(),
                    step_type: addType,
                    duration_seconds: addDuration ? parseFloat(addDuration) * 60 : null
                })
            })
            if (res.ok) {
                const s: StepTemplate = await res.json()
                setSteps(prev => [...prev, s])
                setAddName(""); setAddDuration(""); setAddType("custom")
            } else { setAddError("Failed to add phase") }
        } finally { setAddLoading(false) }
    }

    const handleDeleteStep = async (stepId: string) => {
        await fetch(getApiUrl(`/api/private/mission/templates/${tid}/steps/${stepId}`), {
            method: "DELETE",
            headers: { Authorization: getToken() }
        })
        setSteps(prev => prev.filter(s => s._id !== stepId))
    }

    const startEditStep = (s: StepTemplate) => {
        setEditingStep(s._id)
        setEditStepName(s.name)
        setEditStepType(s.step_type)
        setEditStepDuration(s.end_time_offset ? String(Math.round(s.end_time_offset / 60)) : "")
    }

    const handleSaveStep = async (stepId: string) => {
        const res = await fetch(getApiUrl(`/api/private/mission/templates/${tid}/steps/${stepId}`), {
            method: "PATCH",
            headers: { Authorization: getToken(), "Content-Type": "application/json" },
            body: JSON.stringify({
                name: editStepName,
                step_type: editStepType,
                duration_seconds: editStepDuration ? parseFloat(editStepDuration) * 60 : null
            })
        })
        if (res.ok) {
            const updated: StepTemplate = await res.json()
            setSteps(prev => prev.map(s => s._id === stepId ? updated : s))
            setEditingStep(null)
        }
    }

    const saveRoute = async (stepId: string, data: { origin: Coord | null; destination: Coord | null; waypoints: Coord[] }) => {
        const body: any = {
            origin_lat: data.origin?.lat ?? null,
            origin_lon: data.origin?.lon ?? null,
            destination_lat: data.destination?.lat ?? null,
            destination_lon: data.destination?.lon ?? null,
            route_waypoints: data.waypoints.map(w => ({ lat: w.lat, lon: w.lon }))
        }
        const res = await fetch(getApiUrl(`/api/private/mission/templates/${tid}/steps/${stepId}`), {
            method: "PATCH",
            headers: { Authorization: getToken(), "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })
        if (res.ok) {
            const updated: StepTemplate = await res.json()
            setSteps(prev => prev.map(s => s._id === stepId ? updated : s))
        }
        setRoutePlannerStep(null)
    }

    const moveStep = async (idx: number, dir: -1 | 1) => {
        const target = steps[idx + dir], current = steps[idx]
        if (!target) return
        await Promise.all([
            fetch(getApiUrl(`/api/private/mission/templates/${tid}/steps/${current._id}`), {
                method: "PATCH", headers: { Authorization: getToken(), "Content-Type": "application/json" },
                body: JSON.stringify({ order: target.order })
            }),
            fetch(getApiUrl(`/api/private/mission/templates/${tid}/steps/${target._id}`), {
                method: "PATCH", headers: { Authorization: getToken(), "Content-Type": "application/json" },
                body: JSON.stringify({ order: current.order })
            })
        ])
        await fetchSteps()
    }

    const handleDeleteTemplate = async () => {
        if (!confirm(`Delete template "${name}"? This cannot be undone.`)) return
        await fetch(getApiUrl(`/api/private/mission/templates/${tid}`), {
            method: "DELETE", headers: { Authorization: getToken() }
        })
        onDeleted(tid)
    }

    const coordFromGeo = (pt?: GeoJSONPoint | null): Coord | null => pt
        ? { lat: pt.coordinates[1], lon: pt.coordinates[0] }
        : null

    return (
        <>
            {routePlannerStep && (
                <RoutePlannerModal
                    initial={{
                        origin: coordFromGeo(routePlannerStep.origin),
                        destination: coordFromGeo(routePlannerStep.destination),
                        waypoints: (routePlannerStep.route_waypoints || []).map(p => ({ lat: p.coordinates[1], lon: p.coordinates[0] }))
                    }}
                    onSave={(data) => saveRoute(routePlannerStep._id, data)}
                    onClose={() => setRoutePlannerStep(null)}
                />
            )}

            <div className="flex flex-col h-full font-mono text-white">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <button onClick={onClose} className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 text-[10px] uppercase tracking-widest">
                        <ArrowLeft className="w-4 h-4" /> All Templates
                    </button>
                    <button onClick={handleDeleteTemplate} className="flex items-center gap-1 text-red-600 hover:text-red-400 text-[10px] uppercase tracking-widest">
                        <Trash2 className="w-3 h-3" /> Delete Template
                    </button>
                </div>

                {/* Template name */}
                <div className="mb-6">
                    {nameEditing ? (
                        <div className="flex gap-2 items-center">
                            <input autoFocus className="bg-black border border-cyan-800 text-lg text-gray-100 px-2 py-1 flex-1 tracking-wider uppercase outline-none focus:border-cyan-500"
                                value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleSaveName() }} />
                            <button onClick={handleSaveName} disabled={saving} className="text-cyan-400 hover:text-cyan-300 p-1"><Save className="w-4 h-4" /></button>
                            <button onClick={() => setNameEditing(false)} className="text-gray-500 hover:text-gray-300 p-1"><X className="w-4 h-4" /></button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setNameEditing(true)}>
                            <h2 className="text-xl text-gray-100 tracking-wider uppercase font-bold">{name}</h2>
                            <Edit2 className="w-4 h-4 text-gray-600 group-hover:text-cyan-500 transition-colors" />
                        </div>
                    )}
                    <p className="text-[9px] text-gray-600 mt-1 uppercase tracking-widest">{steps.length} phase{steps.length !== 1 ? "s" : ""} defined</p>
                </div>

                {/* Phase list */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-2">
                    {loading ? (
                        <div className="text-[10px] text-gray-600 tracking-widest uppercase py-8 text-center">Loading...</div>
                    ) : steps.length === 0 ? (
                        <div className="border border-dashed border-[#222] py-8 flex flex-col items-center justify-center gap-2">
                            <p className="text-[10px] text-gray-600 tracking-widest uppercase">No phases yet</p>
                        </div>
                    ) : steps.map((s, idx) => (
                        <div key={s._id} className="border border-[#1a1a1a] bg-[#080808] hover:border-[#2a2a2a] transition-all">
                            {editingStep === s._id ? (
                                <div className="p-3 space-y-2">
                                    <input autoFocus
                                        className="w-full bg-black border border-cyan-900 text-sm px-2 py-1 text-gray-200 outline-none focus:border-cyan-600 uppercase tracking-wider"
                                        value={editStepName} onChange={e => setEditStepName(e.target.value)}
                                        onKeyDown={e => { if (e.key === "Enter") handleSaveStep(s._id) }} />
                                    <div className="flex gap-2">
                                        <select className="flex-1 bg-black border border-[#333] text-xs px-2 py-1 text-gray-400 outline-none"
                                            value={editStepType} onChange={e => setEditStepType(e.target.value)}>
                                            {STEP_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                                        </select>
                                        <input className="w-24 bg-black border border-[#333] text-xs px-2 py-1 text-gray-400 outline-none"
                                            placeholder="Mins" value={editStepDuration}
                                            onChange={e => setEditStepDuration(e.target.value)} type="number" />
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => setEditingStep(null)} className="text-gray-500 hover:text-gray-300 text-[10px] uppercase tracking-widest px-3 py-1 border border-[#333]">Cancel</button>
                                        <button onClick={() => handleSaveStep(s._id)} className="text-cyan-400 hover:text-cyan-300 text-[10px] uppercase tracking-widest px-3 py-1 border border-cyan-900 bg-cyan-900/20 flex gap-1 items-center">
                                            <Save className="w-3 h-3" /> Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col gap-0.5 shrink-0">
                                            <button onClick={() => moveStep(idx, -1)} disabled={idx === 0} className="text-gray-700 hover:text-gray-400 disabled:opacity-20"><ChevronUp className="w-3 h-3" /></button>
                                            <button onClick={() => moveStep(idx, 1)} disabled={idx === steps.length - 1} className="text-gray-700 hover:text-gray-400 disabled:opacity-20"><ChevronDown className="w-3 h-3" /></button>
                                        </div>
                                        <span className="text-[9px] text-gray-600 w-5 text-right shrink-0">{idx + 1}.</span>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm text-gray-200 uppercase tracking-wide truncate block">{s.name}</span>
                                            <div className="flex gap-2 mt-0.5 items-center">
                                                <span className="text-[9px] px-1.5 py-0.5 border border-[#333] text-gray-600 uppercase">{s.step_type}</span>
                                                {s.end_time_offset && <span className="text-[9px] text-gray-700">{Math.round(s.end_time_offset / 60)} min</span>}
                                                {/* Movement summaries */}
                                                {s.step_type === "movement" && s.origin && (
                                                    <span className="text-[9px] text-green-700">A set</span>
                                                )}
                                                {s.step_type === "movement" && s.destination && (
                                                    <span className="text-[9px] text-red-700">B set</span>
                                                )}
                                                {s.step_type === "movement" && s.route_waypoints && s.route_waypoints.length > 0 && (
                                                    <span className="text-[9px] text-yellow-700">{s.route_waypoints.length} WP</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-1 shrink-0 items-center">
                                            {/* Route button only for movement */}
                                            {s.step_type === "movement" && (
                                                <button
                                                    onClick={() => setRoutePlannerStep(s)}
                                                    className={`p-1 text-xs transition-colors flex items-center gap-1 ${s.origin || s.destination ? "text-cyan-500 hover:text-cyan-300" : "text-gray-600 hover:text-cyan-600"
                                                        }`}
                                                    title="Plan route"
                                                >
                                                    <Route className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            <button onClick={() => startEditStep(s)} className="p-1 text-gray-600 hover:text-cyan-500 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => handleDeleteStep(s._id)} className="p-1 text-gray-600 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>

                                    {/* Movement route summary */}
                                    {s.step_type === "movement" && (s.origin || s.destination) && (
                                        <div className="mt-2 ml-12 border border-[#111] bg-[#050505] p-2 text-[9px] text-gray-600 space-y-0.5">
                                            {s.origin && <div><span className="text-green-700">A:</span> {s.origin.coordinates[1].toFixed(5)}, {s.origin.coordinates[0].toFixed(5)}</div>}
                                            {s.destination && <div><span className="text-red-700">B:</span> {s.destination.coordinates[1].toFixed(5)}, {s.destination.coordinates[0].toFixed(5)}</div>}
                                            {s.route_waypoints && s.route_waypoints.length > 0 && (
                                                <div><span className="text-yellow-700">WP:</span> {s.route_waypoints.length} intermediate point{s.route_waypoints.length !== 1 ? "s" : ""}</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add phase */}
                <div className="border border-[#222] bg-[#050505] p-3 shrink-0">
                    <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-2">Add Phase</p>
                    <div className="flex gap-2 mb-2">
                        <input className="flex-1 bg-black border border-[#333] text-sm px-2 py-1.5 text-gray-300 focus:border-cyan-800 outline-none uppercase tracking-wide placeholder-gray-700"
                            placeholder="PHASE NAME" value={addName}
                            onChange={e => setAddName(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") handleAddStep() }} />
                        <select className="bg-black border border-[#333] text-xs px-2 py-1 text-gray-500 outline-none"
                            value={addType} onChange={e => setAddType(e.target.value)}>
                            {STEP_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                        </select>
                        <input className="w-20 bg-black border border-[#333] text-xs px-2 py-1 text-gray-500 outline-none"
                            placeholder="Mins" value={addDuration}
                            onChange={e => setAddDuration(e.target.value)} type="number" />
                    </div>
                    {addError && <p className="text-red-500 text-[10px] mb-2">{addError}</p>}
                    <button onClick={handleAddStep} disabled={addLoading || !addName.trim()}
                        className="w-full bg-cyan-900/20 border border-cyan-900 text-cyan-400 py-1.5 text-[10px] tracking-widest uppercase hover:bg-cyan-900/40 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                        <Plus className="w-3 h-3" />
                        {addLoading ? "ADDING..." : "ADD PHASE"}
                    </button>
                    {addType === "movement" && (
                        <p className="text-[9px] text-gray-600 mt-1 text-center">Add the phase first, then click the <Route className="inline w-3 h-3 text-cyan-600" /> route icon to set A→B</p>
                    )}
                </div>
            </div>
        </>
    )
}

// ─── Main Template Manager ───────────────────────────────────────────────────

export function MissionTemplateManager() {
    const router = useRouter()
    const [templates, setTemplates] = useState<MissionTemplateWithSteps[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState<MissionTemplateWithSteps | null>(null)

    const [showNewModal, setShowNewModal] = useState(false)
    const [newTemplateName, setNewTemplateName] = useState("")
    const [isSavingTemplate, setIsSavingTemplate] = useState(false)
    const [createError, setCreateError] = useState("")

    const [showNewMissionModal, setShowNewMissionModal] = useState(false)
    const [newMissionName, setNewMissionName] = useState("")
    const [isSavingMission, setIsSavingMission] = useState(false)
    const [missionError, setMissionError] = useState("")

    useEffect(() => { fetchTemplates() }, [])

    const fetchTemplates = async () => {
        setLoading(true)
        try {
            const res = await fetch(getApiUrl("/api/private/mission/templates/"), {
                headers: { Authorization: getToken() }
            })
            if (res.ok) setTemplates(await res.json())
        } finally { setLoading(false) }
    }

    const handleLaunch = async (templateId: string) => {
        setIsCreating(true)
        try {
            const res = await fetch(getApiUrl(`/api/private/mission/${templateId}/from_template?fast_start=true`), {
                method: "POST", headers: { Authorization: getToken() }
            })
            if (res.ok) router.push(`/mission/${(await res.json())._id}`)
        } finally { setIsCreating(false) }
    }

    const handleCreateTemplate = async () => {
        if (!newTemplateName.trim()) return
        setIsSavingTemplate(true); setCreateError("")
        try {
            const res = await fetch(getApiUrl("/api/private/mission/templates/"), {
                method: "POST",
                headers: { Authorization: getToken(), "Content-Type": "application/json" },
                body: JSON.stringify({ name: newTemplateName.trim() })
            })
            if (res.ok) {
                const data: MissionTemplateWithSteps = await res.json()
                setTemplates(prev => [...prev, data])
                setShowNewModal(false); setNewTemplateName("")
                setSelectedTemplate(data)
            } else {
                const err = await res.json()
                setCreateError(err.detail || "Failed to create template")
            }
        } finally { setIsSavingTemplate(false) }
    }

    const handleCreateMission = async () => {
        if (!newMissionName.trim()) return
        setIsSavingMission(true); setMissionError("")
        try {
            const res = await fetch(getApiUrl("/api/private/mission/"), {
                method: "POST",
                headers: { Authorization: getToken(), "Content-Type": "application/json" },
                body: JSON.stringify({ name: newMissionName.trim() })
            })
            if (res.ok) router.push(`/mission/${(await res.json())._id}`)
            else setMissionError((await res.json()).detail || "Failed to create mission")
        } finally { setIsSavingMission(false) }
    }

    if (selectedTemplate) {
        return (
            <TemplateEditor
                template={selectedTemplate}
                onClose={() => { setSelectedTemplate(null); fetchTemplates() }}
                onDeleted={id => { setTemplates(prev => prev.filter(t => t.mission_template._id !== id)); setSelectedTemplate(null) }}
            />
        )
    }

    return (
        <div className="flex flex-col h-full relative">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-sm text-cyan-500 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                        <Target className="w-4 h-4" /> Operations Control
                    </h2>
                    <p className="text-[10px] text-gray-500 tracking-widest uppercase mt-1">Manage Templates &amp; Deploy Missions</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => { setShowNewMissionModal(true); setMissionError("") }}
                        className="flex items-center gap-2 bg-[#111] border border-red-900/50 hover:border-red-700 px-4 py-2 text-xs text-red-400 hover:text-red-300 uppercase tracking-widest transition-colors">
                        <Send className="w-3 h-3" /> New Mission
                    </button>
                    <button onClick={() => { setShowNewModal(true); setCreateError("") }}
                        className="flex items-center gap-2 bg-[#111] border border-[#333] hover:border-cyan-900 px-4 py-2 text-xs text-gray-400 hover:text-cyan-400 uppercase tracking-widest transition-colors">
                        <Plus className="w-4 h-4" /> New Template
                    </button>
                </div>
            </div>

            {showNewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-[#0a0a0a] border border-cyan-900 shadow-[0_0_40px_rgba(0,0,0,0.9)] w-80 font-mono text-white">
                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-cyan-950 to-transparent border-b border-cyan-900">
                            <span className="text-xs text-cyan-400 tracking-widest font-bold">CREATE OP TEMPLATE</span>
                            <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="p-4">
                            <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">Template Name</label>
                            <input autoFocus className="w-full bg-black border border-[#333] text-sm p-2 text-gray-200 focus:border-cyan-700 outline-none mb-3 uppercase"
                                placeholder="e.g. URBAN RECON" value={newTemplateName}
                                onChange={e => setNewTemplateName(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleCreateTemplate()} />
                            {createError && <p className="text-red-500 text-[10px] mb-2">{createError}</p>}
                            <button onClick={handleCreateTemplate} disabled={isSavingTemplate || !newTemplateName.trim()}
                                className="w-full bg-cyan-900/20 border border-cyan-800 text-cyan-400 p-2 text-xs tracking-widest hover:bg-cyan-900/40 transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
                                <FileText className="w-3 h-3" />
                                {isSavingTemplate ? "SAVING..." : "CREATE AND EDIT"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showNewMissionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-[#0a0a0a] border border-red-900 shadow-[0_0_40px_rgba(0,0,0,0.9)] w-80 font-mono text-white">
                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-950 to-transparent border-b border-red-900">
                            <span className="text-xs text-red-400 tracking-widest font-bold">INITIALIZE NEW MISSION</span>
                            <button onClick={() => setShowNewMissionModal(false)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="p-4">
                            <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">Mission Designation</label>
                            <input autoFocus className="w-full bg-black border border-[#333] text-sm p-2 text-gray-200 focus:border-red-700 outline-none mb-3 uppercase"
                                placeholder="e.g. OPERATION NIGHTFALL" value={newMissionName}
                                onChange={e => setNewMissionName(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleCreateMission()} />
                            {missionError && <p className="text-red-500 text-[10px] mb-2">{missionError}</p>}
                            <button onClick={handleCreateMission} disabled={isSavingMission || !newMissionName.trim()}
                                className="w-full bg-red-900/20 border border-red-800 text-red-400 p-2 text-xs tracking-widest hover:bg-red-900/40 transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
                                <Send className="w-3 h-3" />
                                {isSavingMission ? "INITIALIZING..." : "LAUNCH MISSION"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 bg-[#050505] p-1 overflow-y-auto">
                {loading ? (
                    <div className="w-full py-12 flex justify-center text-[10px] text-gray-600 tracking-widest uppercase">Loading Templates...</div>
                ) : templates.length === 0 ? (
                    <div className="w-full py-12 flex flex-col items-center justify-center gap-3 border border-dashed border-[#222]">
                        <p className="text-[10px] text-gray-600 tracking-widest uppercase">No registered templates</p>
                        <p className="text-[9px] text-gray-700 tracking-widest uppercase">Create a template or launch a blank mission above</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {templates.map(t => (
                            <div key={t.mission_template._id} className="border border-[#1a1a1a] bg-[#0a0a0a] p-5 flex flex-col group hover:border-[#333] transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs text-cyan-600 tracking-widest uppercase font-bold mb-1 block">OP TEMPLATE</span>
                                        <h3 className="text-lg text-gray-200 tracking-wider font-bold uppercase truncate">{t.mission_template.name}</h3>
                                    </div>
                                    <div className="text-[9px] px-2 py-1 border border-[#222] text-gray-500 flex gap-2 shrink-0 ml-2">
                                        <span className="flex items-center"><CheckSquare className="w-3 h-3 mr-1" /> {t.step_templates?.length || 0} PHASES</span>
                                    </div>
                                </div>
                                {(t.step_templates || []).length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {(t.step_templates || []).slice(0, 4).map((s: any, i: number) => (
                                            <span key={s._id || i} className={`text-[8px] px-2 py-0.5 border uppercase tracking-wider ${s.step_type === "movement" ? "border-cyan-900/50 text-cyan-800 bg-cyan-950/20" : "border-[#222] text-gray-600 bg-[#111]"}`}>
                                                {s.step_type === "movement" && <span className="mr-1">↗</span>}{s.name}
                                            </span>
                                        ))}
                                        {(t.step_templates || []).length > 4 && <span className="text-[8px] px-2 py-0.5 text-gray-700 uppercase tracking-wider">+{(t.step_templates || []).length - 4} more</span>}
                                    </div>
                                )}
                                <div className="flex gap-2 mt-auto pt-4 border-t border-[#1a1a1a] justify-end">
                                    <button onClick={() => setSelectedTemplate(t)}
                                        className="px-3 py-2 flex items-center gap-1 border border-[#333] bg-[#111] hover:border-cyan-900 text-gray-400 hover:text-cyan-400 text-[10px] tracking-widest uppercase transition-colors">
                                        <Edit2 className="w-3 h-3" /> Edit
                                    </button>
                                    <button onClick={() => handleLaunch(t.mission_template._id)} disabled={isCreating}
                                        className="px-4 py-2 flex items-center gap-2 border border-red-900/50 bg-red-900/10 hover:bg-red-900/30 text-red-400 text-[10px] tracking-widest font-bold uppercase disabled:opacity-50 transition-colors">
                                        {isCreating ? "LAUNCHING..." : "FAST LAUNCH"}
                                        {!isCreating && <Send className="w-3 h-3" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
