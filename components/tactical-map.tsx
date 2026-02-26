"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Shield, Send, X, Crosshair, MapPin, Plus, Eye, CheckCheck, Radio, Truck, Link as LinkIcon } from "lucide-react"
import maplibregl from "maplibre-gl"
// @ts-ignore
import MapboxDraw from "@mapbox/mapbox-gl-draw"
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css"
import "maplibre-gl/dist/maplibre-gl.css"
import { stateManager } from "@/lib/state-manager"
import { getApiUrl } from "@/lib/api-config"

const MAP_STYLE = {
    version: 8,
    sources: {
        osm: {
            type: "raster",
            tiles: ["https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
        },
    },
    layers: [{ id: "osm", type: "raster", source: "osm", minzoom: 0, maxzoom: 22 }],
}

// ── Civilian POI catalogue ────────────────────────────────────────────────────
// Each entry: pin fill colour + SVG paths drawn white inside a teardrop pin
const POI_DEF: Record<string, { pin: string; label: string; icon: string }> = {
    location: { pin: "#6b7280", label: "Location", icon: `<circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 0 0-8-8z"/>` },
    shelter: { pin: "#16a34a", label: "Shelter", icon: `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>` },
    medical: { pin: "#dc2626", label: "Medical", icon: `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/>` },
    meeting_point: { pin: "#2563eb", label: "Meeting Point", icon: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>` },
    supply: { pin: "#d97706", label: "Supply", icon: `<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>` },
    vehicle: { pin: "#7c3aed", label: "Vehicle", icon: `<rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 4v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>` },
    checkpoint: { pin: "#eab308", label: "Checkpoint", icon: `<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>` },
    hazard: { pin: "#f97316", label: "Hazard", icon: `<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>` },
    comms: { pin: "#0891b2", label: "Comms", icon: `<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>` },
    observation: { pin: "#0f766e", label: "Observation", icon: `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>` },
    asset: { pin: "#f59e0b", label: "Asset", icon: `<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>` },
}

const URGENCY_COLOR: Record<string, string> = {
    routine: "#6b7280",
    elevated: "#eab308",
    urgent: "#f97316",
    critical: "#ef4444",
}

const SEVERITY_COLOR: Record<string, string> = {
    ROUTINE: "text-gray-400 border-gray-700",
    SIGNIFICANT: "text-yellow-400 border-yellow-800",
    URGENT: "text-orange-400 border-orange-800",
    FLASH: "text-red-400 border-red-700",
}

const CIVILIAN_SITREP_TYPES = ["INCIDENT", "MEDICAL", "SUPPLY_REQUEST", "ROUTE_STATUS", "OBSERVATION", "PERSONNEL", "INFRASTRUCTURE", "OTHER"]

// Builds a teardrop SVG pin element, anchored at its tip (bottom centre)
function makePinEl(fillColor: string, iconPaths: string, label: string): HTMLElement {
    const el = document.createElement("div")
    el.style.cssText = "display:flex;flex-direction:column;align-items:center;cursor:pointer;user-select:none;"
    el.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="34" height="46" viewBox="0 0 34 46"
             style="filter:drop-shadow(0 3px 6px rgba(0,0,0,0.7));overflow:visible;">
          <!-- shadow blur -->
          <ellipse cx="17" cy="44" rx="6" ry="2" fill="rgba(0,0,0,0.3)"/>
          <!-- teardrop body -->
          <path d="M17 1C10 1 4 7 4 14c0 10 13 31 13 31S30 24 30 14C30 7 24 1 17 1z" fill="${fillColor}"/>
          <!-- inner circle -->
          <circle cx="17" cy="14" r="8" fill="rgba(0,0,0,0.25)"/>
          <!-- icon (white, centered at 17,14) -->
          <g transform="translate(9,6)" stroke="white" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
             viewBox="0 0 24 24" width="16" height="16" style="overflow:visible;">
            <svg width="16" height="16" viewBox="0 0 24 24">${iconPaths}</svg>
          </g>
        </svg>
        <span style="font-size:9px;font-family:monospace;font-weight:700;background:rgba(0,0,0,0.88);color:${fillColor};border:1px solid ${fillColor}55;padding:1px 5px;margin-top:-6px;white-space:nowrap;text-transform:uppercase;letter-spacing:0.08em;border-radius:2px;">${label}</span>
    `
    return el
}

const BLANK_POI = { name: "", type: "location", desc: "", urgency: "routine", asset_id: "" }
const BLANK_SITREP = { type: "INCIDENT", severity: "ROUTINE", unit: "", grid_ref: "", contact_type: "", description: "", assets_involved: "", action_taken: "" }

interface TacticalMapProps {
    personnel?: { id: string; name: string; coordinates: [number, number] }[]
    pois?: { id: string; name: string; coordinates: [number, number]; poi_type?: string; threat_level?: string; description?: string; asset_id?: string }[]
    onPoiAdded?: (newPoi: any) => void
    initialCenter?: [number, number]
}

export function TacticalMap({ personnel = [], pois = [], onPoiAdded, initialCenter }: TacticalMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null)
    const mapInstance = useRef<maplibregl.Map | null>(null)
    const drawInstance = useRef<any>(null)
    const personnelMarkers = useRef<{ [id: string]: maplibregl.Marker }>({})
    const poiMarkers = useRef<{ [id: string]: maplibregl.Marker }>({})
    const sitrepMarkersRef = useRef<maplibregl.Marker[]>([])

    const [isAimingPoi, setIsAimingPoi] = useState(false)
    const [poiModal, setPoiModal] = useState<{ open: boolean; lat: number; lon: number }>({ open: false, lat: 0, lon: 0 })
    const [poiForm, setPoiForm] = useState(BLANK_POI)
    const [isSubmittingPoi, setIsSubmittingPoi] = useState(false)
    const [selectedPoi, setSelectedPoi] = useState<any>(null)

    const [isAimingSitrep, setIsAimingSitrep] = useState(false)
    const [sitrepModal, setSitrepModal] = useState<{ open: boolean; lat: number; lon: number }>({ open: false, lat: 0, lon: 0 })
    const [sitrepForm, setSitrepForm] = useState(BLANK_SITREP)
    const [isSubmittingSitrep, setIsSubmittingSitrep] = useState(false)
    const [sitreps, setSitreps] = useState<any[]>([])
    const [selectedSitrep, setSelectedSitrep] = useState<any>(null)
    const [showSitrepPanel, setShowSitrepPanel] = useState(false)

    const [dbAssets, setDbAssets] = useState<any[]>([])

    const tok = () => localStorage.getItem("auth_token") || ""

    const fetchSitreps = useCallback(async () => {
        try {
            const res = await fetch(getApiUrl("/api/private/sitrep/"), { headers: { Authorization: tok() } })
            if (res.ok) setSitreps(await res.json())
        } catch { }
    }, [])

    const fetchAssets = useCallback(async () => {
        try {
            const res = await fetch(getApiUrl("/api/private/asset/"), { headers: { Authorization: tok() } })
            if (res.ok) setDbAssets(await res.json())
        } catch { }
    }, [])

    useEffect(() => { fetchSitreps(); fetchAssets() }, [])

    // ── Map init ──────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!mapContainer.current || mapInstance.current) return

        mapInstance.current = new maplibregl.Map({
            container: mapContainer.current,
            style: MAP_STYLE as any,
            center: initialCenter ?? [30.5234, 50.4501],
            zoom: 12,
            attributionControl: false,
        })

        // Draw tools available in code but NOT added to map (disabled by default)
        drawInstance.current = new MapboxDraw({
            displayControlsDefault: false,
            controls: { polygon: true, line_string: true, trash: true },
            defaultMode: "simple_select",
        })

        mapInstance.current.addControl(new maplibregl.NavigationControl(), "bottom-right")

        mapInstance.current.on("load", () => {
            const token = localStorage.getItem("auth_token") || ""
            stateManager.connect(token)
            stateManager.rois.observe(() => { })
            stateManager.routes.observe(() => { })
        })

        return () => {
            stateManager.disconnect()
            mapInstance.current?.remove()
            mapInstance.current = null
        }
    }, [])

    // ── Dynamic click handler ──────────────────────────────────────────────────
    useEffect(() => {
        if (!mapInstance.current) return
        const map = mapInstance.current
        const handler = (e: maplibregl.MapMouseEvent) => {
            if (isAimingSitrep) {
                setSitrepModal({ open: true, lat: e.lngLat.lat, lon: e.lngLat.lng })
                setSitrepForm(f => ({ ...f, grid_ref: `${e.lngLat.lat.toFixed(5)}, ${e.lngLat.lng.toFixed(5)}` }))
                setIsAimingSitrep(false)
                map.getCanvas().style.cursor = ""
            } else if (isAimingPoi) {
                setPoiModal({ open: true, lat: e.lngLat.lat, lon: e.lngLat.lng })
                setPoiForm({ ...BLANK_POI, name: `MRK-${Math.floor(Math.random() * 1000)}` })
                setIsAimingPoi(false)
                map.getCanvas().style.cursor = ""
            }
        }
        map.on("click", handler)
        return () => { map.off("click", handler) }
    }, [isAimingSitrep, isAimingPoi])

    // ── Personnel markers ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!mapInstance.current) return
        personnel.forEach(p => {
            if (!personnelMarkers.current[p.id]) {
                const el = makePinEl("#22d3ee", `<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`, p.name)
                personnelMarkers.current[p.id] = new maplibregl.Marker({ element: el, anchor: "bottom" })
                    .setLngLat(p.coordinates).addTo(mapInstance.current!)
            } else {
                personnelMarkers.current[p.id].setLngLat(p.coordinates)
            }
        })
    }, [personnel])

    // ── POI markers ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!mapInstance.current) return
        pois.forEach(poi => {
            if (poiMarkers.current[poi.id]) {
                poiMarkers.current[poi.id].setLngLat(poi.coordinates)
                return
            }
            const typeKey = poi.poi_type || "location"
            const def = POI_DEF[typeKey] || POI_DEF.location
            // Urgency can override pin colour
            const urgencyOverride = poi.threat_level ? URGENCY_COLOR[poi.threat_level] : null
            const pinColor = urgencyOverride || def.pin

            const el = makePinEl(pinColor, def.icon, poi.name)
            el.addEventListener("click", e => { e.stopPropagation(); setSelectedPoi(poi) })

            poiMarkers.current[poi.id] = new maplibregl.Marker({ element: el, anchor: "bottom" })
                .setLngLat(poi.coordinates).addTo(mapInstance.current!)
        })
    }, [pois])

    // ── SITREP markers on map ──────────────────────────────────────────────────
    useEffect(() => {
        if (!mapInstance.current) return
        sitrepMarkersRef.current.forEach(m => m.remove())
        sitrepMarkersRef.current = []

        sitreps.forEach((s: any) => {
            const coords = s.location?.coordinates
            if (!coords) return
            const isResolved = s.status === "RESOLVED"
            const sevColor = { ROUTINE: "#6b7280", SIGNIFICANT: "#eab308", URGENT: "#f97316", FLASH: "#ef4444" }[s.severity as string] || "#6b7280"

            const el = document.createElement("div")
            el.style.cssText = `cursor:pointer;opacity:${isResolved ? 0.3 : 1};display:flex;flex-direction:column;align-items:center;`
            el.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                     fill="${sevColor}22" stroke="${sevColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                     style="filter:drop-shadow(0 2px 4px ${sevColor}66)">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                  <path d="M12 9v4"/><path d="M12 17h.01"/>
                </svg>
                <span style="font-size:8px;font-family:monospace;font-weight:700;background:rgba(0,0,0,0.85);color:${sevColor};border:1px solid ${sevColor}55;padding:1px 4px;margin-top:1px;white-space:nowrap;text-transform:uppercase;border-radius:2px;">${s.sitrep_type || "SITREP"}</span>
            `
            el.addEventListener("click", e => { e.stopPropagation(); setSelectedSitrep(s); setShowSitrepPanel(false) })
            sitrepMarkersRef.current.push(
                new maplibregl.Marker({ element: el, anchor: "bottom" })
                    .setLngLat([coords[0], coords[1]]).addTo(mapInstance.current!)
            )
        })
    }, [sitreps])

    // ── Submit handlers ────────────────────────────────────────────────────────
    const submitSitrep = async () => {
        if (!sitrepForm.description.trim()) return
        setIsSubmittingSitrep(true)
        try {
            const res = await fetch(getApiUrl("/api/private/sitrep/"), {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: tok() },
                body: JSON.stringify({ ...sitrepForm, lat: sitrepModal.lat, lon: sitrepModal.lon, sitrep_type: sitrepForm.type }),
            })
            if (res.ok) {
                setSitrepModal({ open: false, lat: 0, lon: 0 })
                setSitrepForm(BLANK_SITREP)
                await fetchSitreps()
            }
        } finally { setIsSubmittingSitrep(false) }
    }

    const submitPoi = async () => {
        if (!poiForm.name.trim()) return
        setIsSubmittingPoi(true)
        // Map civilian urgency → backend threat_level enum
        const urgencyToThreat: Record<string, string> = {
            routine: "unknown",
            elevated: "elevated",
            urgent: "high",
            critical: "critical",
        }
        try {
            const body: any = {
                name: poiForm.name,
                description: poiForm.desc,
                poi_type: poiForm.type,
                threat_level: urgencyToThreat[poiForm.urgency] ?? "unknown",
                lat: poiModal.lat,
                lon: poiModal.lon,
            }
            if (poiForm.asset_id) body.asset_id = poiForm.asset_id
            const res = await fetch(getApiUrl("/api/private/poi/"), {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: tok() },
                body: JSON.stringify(body),
            })
            if (res.ok) {
                const newPoi = await res.json()
                setPoiModal({ open: false, lat: 0, lon: 0 })
                setPoiForm(BLANK_POI)
                if (onPoiAdded) onPoiAdded(newPoi)
            }
        } finally { setIsSubmittingPoi(false) }
    }

    const updateSitrep = async (id: string, patch: any) => {
        await fetch(getApiUrl(`/api/private/sitrep/${id}`), {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: tok() },
            body: JSON.stringify(patch),
        })
        await fetchSitreps()
        setSelectedSitrep((prev: any) => prev?._id === id ? { ...prev, ...patch } : prev)
    }

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="w-full h-full relative overflow-hidden">
            <div ref={mapContainer} className="w-full h-full absolute inset-0" />

            {/* Controls */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                <div className="bg-black/90 border border-gray-800 px-3 py-2 text-[10px] font-mono uppercase">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold tracking-wider mb-1">
                        <Shield className="w-3 h-3" /> TRACKING
                    </div>
                    <div className="text-gray-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                        {personnel.length} units · {pois.length} POIs · {sitreps.filter(s => s.status !== "RESOLVED").length} active
                    </div>
                </div>

                <button
                    onClick={() => { setIsAimingSitrep(s => !s); setIsAimingPoi(false); if (mapInstance.current) mapInstance.current.getCanvas().style.cursor = !isAimingSitrep ? "crosshair" : "" }}
                    className={`flex items-center gap-1.5 px-3 py-2 border font-mono text-[10px] uppercase font-bold tracking-widest transition-all ${isAimingSitrep ? "bg-cyan-900/40 text-cyan-400 border-cyan-500 animate-pulse" : "bg-black/80 text-gray-400 border-gray-700 hover:border-gray-500"}`}>
                    <Crosshair className="w-3.5 h-3.5" />
                    {isAimingSitrep ? "Targeting…" : "File Report"}
                </button>

                <button
                    onClick={() => { setIsAimingPoi(s => !s); setIsAimingSitrep(false); if (mapInstance.current) mapInstance.current.getCanvas().style.cursor = !isAimingPoi ? "crosshair" : "" }}
                    className={`flex items-center gap-1.5 px-3 py-2 border font-mono text-[10px] uppercase font-bold tracking-widest transition-all ${isAimingPoi ? "bg-red-900/50 text-red-400 border-red-500 animate-pulse" : "bg-black/80 text-gray-400 border-gray-700 hover:border-gray-500"}`}>
                    <MapPin className="w-3.5 h-3.5" />
                    {isAimingPoi ? "Select location…" : "Mark Location"}
                </button>

                <button
                    onClick={() => { setShowSitrepPanel(s => !s); setSelectedSitrep(null) }}
                    className={`flex items-center gap-1.5 px-3 py-2 border font-mono text-[10px] uppercase font-bold tracking-widest transition-all ${showSitrepPanel ? "bg-yellow-900/30 text-yellow-400 border-yellow-700" : "bg-black/80 text-gray-400 border-gray-700 hover:border-gray-500"}`}>
                    <Radio className="w-3.5 h-3.5" />
                    Reports ({sitreps.filter(s => s.status !== "RESOLVED").length})
                </button>
            </div>

            {/* ── File Incident Report Modal ── */}
            {sitrepModal.open && (
                <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                    <div className="pointer-events-auto w-96 bg-[#070707] border border-cyan-900 shadow-[0_0_40px_rgba(0,0,0,0.9)] font-mono text-white">
                        <div className="flex items-center justify-between px-3 py-2 bg-cyan-950/80 border-b border-cyan-900">
                            <span className="text-xs text-cyan-400 font-bold tracking-widest">◈ FILE INCIDENT REPORT</span>
                            <button onClick={() => setSitrepModal({ open: false, lat: 0, lon: 0 })}><X className="w-4 h-4 text-gray-500 hover:text-white" /></button>
                        </div>
                        <div className="p-3 space-y-2">
                            <div className="text-[9px] text-gray-600">LOC: {sitrepModal.lat.toFixed(5)}, {sitrepModal.lon.toFixed(5)}</div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[9px] text-gray-600 uppercase tracking-widest block mb-0.5">Type</label>
                                    <select className="w-full bg-black border border-[#222] text-xs p-1.5 text-gray-300 outline-none focus:border-cyan-800"
                                        value={sitrepForm.type} onChange={e => setSitrepForm(f => ({ ...f, type: e.target.value }))}>
                                        {CIVILIAN_SITREP_TYPES.map(t => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] text-gray-600 uppercase tracking-widest block mb-0.5">Priority</label>
                                    <select className="w-full bg-black border border-[#222] text-xs p-1.5 text-gray-300 outline-none focus:border-cyan-800"
                                        value={sitrepForm.severity} onChange={e => setSitrepForm(f => ({ ...f, severity: e.target.value }))}>
                                        {["ROUTINE", "SIGNIFICANT", "URGENT", "FLASH"].map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[9px] text-gray-600 uppercase tracking-widest block mb-0.5">Reported By</label>
                                    <input className="w-full bg-black border border-[#222] text-xs p-1.5 text-gray-300 outline-none focus:border-cyan-800 placeholder-gray-700"
                                        placeholder="Name / callsign" value={sitrepForm.unit}
                                        onChange={e => setSitrepForm(f => ({ ...f, unit: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="text-[9px] text-gray-600 uppercase tracking-widest block mb-0.5">Location Ref</label>
                                    <input className="w-full bg-black border border-[#222] text-xs p-1.5 text-gray-300 outline-none focus:border-cyan-800 placeholder-gray-700"
                                        placeholder="auto-filled" value={sitrepForm.grid_ref}
                                        onChange={e => setSitrepForm(f => ({ ...f, grid_ref: e.target.value }))} />
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] text-gray-600 uppercase tracking-widest block mb-0.5">Description *</label>
                                <textarea autoFocus rows={3}
                                    className="w-full bg-black border border-[#222] text-xs p-1.5 text-gray-300 outline-none focus:border-cyan-800 resize-none placeholder-gray-700"
                                    placeholder="Describe the situation…"
                                    value={sitrepForm.description}
                                    onChange={e => setSitrepForm(f => ({ ...f, description: e.target.value }))} />
                            </div>

                            <div>
                                <label className="text-[9px] text-gray-600 uppercase tracking-widest block mb-0.5">Action / Response Taken</label>
                                <input className="w-full bg-black border border-[#222] text-xs p-1.5 text-gray-300 outline-none focus:border-cyan-800 placeholder-gray-700"
                                    placeholder="What was done / is happening now…"
                                    value={sitrepForm.action_taken}
                                    onChange={e => setSitrepForm(f => ({ ...f, action_taken: e.target.value }))} />
                            </div>

                            <button onClick={submitSitrep} disabled={isSubmittingSitrep || !sitrepForm.description.trim()}
                                className="w-full bg-cyan-900/30 border border-cyan-800 text-cyan-400 py-2 text-xs tracking-widest hover:bg-cyan-900/50 disabled:opacity-40 flex justify-center items-center gap-2">
                                <Send className="w-3 h-3" />
                                {isSubmittingSitrep ? "Submitting…" : "Submit Report"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Mark Location Modal ── */}
            {poiModal.open && (
                <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                    <div className="pointer-events-auto w-80 bg-[#070707] border border-red-900 shadow-[0_0_40px_rgba(0,0,0,0.9)] font-mono text-white">
                        <div className="flex items-center justify-between px-3 py-2 bg-red-950/70 border-b border-red-900">
                            <span className="text-xs text-red-400 font-bold tracking-widest">◈ MARK LOCATION</span>
                            <button onClick={() => setPoiModal({ open: false, lat: 0, lon: 0 })}><X className="w-4 h-4 text-gray-500 hover:text-white" /></button>
                        </div>
                        <div className="p-3 space-y-2">
                            <div className="text-[9px] text-gray-600">LOC: {poiModal.lat.toFixed(5)}, {poiModal.lon.toFixed(5)}</div>
                            <input autoFocus
                                className="w-full bg-black border border-[#222] text-sm p-1.5 text-gray-300 focus:border-red-700 outline-none uppercase placeholder-gray-700"
                                placeholder="Label / Name" value={poiForm.name}
                                onChange={e => setPoiForm(f => ({ ...f, name: e.target.value }))} />

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[9px] text-gray-600 uppercase tracking-widest block mb-0.5">Category</label>
                                    <select className="w-full bg-black border border-[#222] text-xs p-1.5 text-gray-400 outline-none focus:border-red-800"
                                        value={poiForm.type} onChange={e => setPoiForm(f => ({ ...f, type: e.target.value }))}>
                                        {Object.entries(POI_DEF).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] text-gray-600 uppercase tracking-widest block mb-0.5">Urgency</label>
                                    <select className="w-full bg-black border border-[#222] text-xs p-1.5 text-gray-400 outline-none focus:border-red-800"
                                        value={poiForm.urgency} onChange={e => setPoiForm(f => ({ ...f, urgency: e.target.value }))}>
                                        {Object.keys(URGENCY_COLOR).map(u => <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>)}
                                    </select>
                                </div>
                            </div>

                            {poiForm.type === "asset" && dbAssets.length > 0 && (
                                <div>
                                    <label className="text-[9px] text-gray-600 uppercase tracking-widest block mb-0.5 flex items-center gap-1">
                                        <LinkIcon className="w-2.5 h-2.5 inline" /> Link Asset
                                    </label>
                                    <select className="w-full bg-black border border-[#222] text-xs p-1.5 text-gray-400 outline-none focus:border-yellow-700"
                                        value={poiForm.asset_id} onChange={e => setPoiForm(f => ({ ...f, asset_id: e.target.value }))}>
                                        <option value="">— none —</option>
                                        {dbAssets.map((a: any) => <option key={a._id} value={a._id}>{a.name} ({a.asset_type})</option>)}
                                    </select>
                                </div>
                            )}

                            <textarea rows={2}
                                className="w-full bg-black border border-[#222] text-xs p-1.5 text-gray-300 focus:border-red-700 outline-none resize-none placeholder-gray-700"
                                placeholder="Optional notes…" value={poiForm.desc}
                                onChange={e => setPoiForm(f => ({ ...f, desc: e.target.value }))} />

                            <button onClick={submitPoi} disabled={isSubmittingPoi || !poiForm.name.trim()}
                                className="w-full bg-red-900/30 border border-red-800 text-red-400 py-2 text-xs tracking-widest hover:bg-red-900/50 disabled:opacity-40 flex justify-center items-center gap-2">
                                <Plus className="w-3 h-3" />{isSubmittingPoi ? "Marking…" : "Mark Location"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── POI detail popup ── */}
            {selectedPoi && (
                <div className="absolute bottom-6 left-3 z-30 w-60 bg-black/95 border border-gray-700 font-mono text-white">
                    <div className="flex items-center justify-between px-3 py-2 bg-[#111] border-b border-gray-800">
                        <span className="text-xs font-bold text-white uppercase tracking-widest truncate">{selectedPoi.name}</span>
                        <button onClick={() => setSelectedPoi(null)}><X className="w-3 h-3 text-gray-600 hover:text-white" /></button>
                    </div>
                    <div className="p-3 space-y-1.5 text-[10px]">
                        <div className="flex justify-between"><span className="text-gray-600 uppercase">Category</span><span className="text-gray-300 capitalize">{POI_DEF[selectedPoi.poi_type]?.label || selectedPoi.poi_type}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600 uppercase">Urgency</span>
                            <span style={{ color: URGENCY_COLOR[selectedPoi.threat_level] || "#6b7280" }} className="uppercase">{selectedPoi.threat_level || "—"}</span>
                        </div>
                        <div className="flex justify-between"><span className="text-gray-600 uppercase">Coords</span><span className="text-gray-400">{selectedPoi.coordinates?.[1]?.toFixed(4)}, {selectedPoi.coordinates?.[0]?.toFixed(4)}</span></div>
                        {selectedPoi.description && <div className="text-gray-500 border-t border-gray-800 pt-1.5">{selectedPoi.description}</div>}
                        {selectedPoi.asset_id && <div className="flex items-center gap-1 text-yellow-600 border-t border-gray-800 pt-1.5"><Truck className="w-3 h-3" /> Asset linked</div>}
                    </div>
                </div>
            )}

            {/* ── Reports List ── */}
            {showSitrepPanel && (
                <div className="absolute top-3 right-3 z-30 w-76 max-h-[70vh] flex flex-col bg-black/95 border border-gray-800 font-mono text-white shadow-2xl" style={{ width: "18rem" }}>
                    <div className="flex items-center justify-between px-3 py-2 bg-[#0d0d0d] border-b border-gray-800 shrink-0">
                        <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">◈ Incident Reports</span>
                        <button onClick={() => setShowSitrepPanel(false)}><X className="w-3 h-3 text-gray-600 hover:text-white" /></button>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {sitreps.length === 0 && <p className="text-[10px] text-gray-700 text-center py-4 uppercase">No reports</p>}
                        {sitreps.map((s: any) => (
                            <div key={s._id} onClick={() => { setSelectedSitrep(s); setShowSitrepPanel(false) }}
                                className={`border-b border-gray-900 p-2 cursor-pointer hover:bg-[#111] transition-colors ${s.status === "RESOLVED" ? "opacity-35" : ""}`}>
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className={`text-[9px] font-bold uppercase px-1 border ${SEVERITY_COLOR[s.severity] || "text-gray-500 border-gray-800"}`}>{s.severity}</span>
                                    <span className="text-[9px] text-gray-600">{new Date(s.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                </div>
                                <div className="flex gap-2 items-baseline">
                                    <span className="text-[10px] text-gray-300 font-bold uppercase">{(s.sitrep_type || "REPORT").replace("_", " ")}</span>
                                    {s.unit && <span className="text-[9px] text-gray-600">· {s.unit}</span>}
                                </div>
                                <p className="text-[9px] text-gray-500 truncate mt-0.5">{s.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Sitrep Detail / Manage ── */}
            {selectedSitrep && (
                <div className="absolute top-3 right-3 z-40 w-72 bg-black/97 border border-yellow-900 font-mono text-white shadow-2xl">
                    <div className="flex items-center justify-between px-3 py-2 bg-yellow-950/60 border-b border-yellow-900">
                        <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">◈ {(selectedSitrep.sitrep_type || "REPORT").replace("_", " ")}</span>
                        <button onClick={() => setSelectedSitrep(null)}><X className="w-3 h-3 text-gray-600 hover:text-white" /></button>
                    </div>
                    <div className="p-3 space-y-2 text-[10px]">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Status</span>
                            <span className={`font-bold uppercase ${{ RESOLVED: "text-blue-400", ACKNOWLEDGED: "text-yellow-400", PENDING: "text-red-400" }[selectedSitrep.status as string] || "text-gray-400"}`}>{selectedSitrep.status}</span>
                        </div>
                        {selectedSitrep.unit && <div className="flex justify-between"><span className="text-gray-600">Reporter</span><span className="text-gray-300">{selectedSitrep.unit}</span></div>}
                        {selectedSitrep.grid_ref && <div className="flex justify-between"><span className="text-gray-600">Location</span><span className="text-gray-300">{selectedSitrep.grid_ref}</span></div>}
                        <div className={`px-2 py-1 border text-[9px] uppercase font-bold w-fit ${SEVERITY_COLOR[selectedSitrep.severity] || "text-gray-500 border-gray-700"}`}>{selectedSitrep.severity}</div>
                        <div className="border-t border-gray-900 pt-2 text-gray-400 leading-relaxed">{selectedSitrep.description}</div>
                        {selectedSitrep.action_taken && <div className="text-gray-600 italic border-t border-gray-900 pt-2">{selectedSitrep.action_taken}</div>}

                        <div className="border-t border-gray-900 pt-2 flex gap-2 flex-wrap">
                            {selectedSitrep.status !== "ACKNOWLEDGED" && (
                                <button onClick={() => updateSitrep(selectedSitrep._id, { status: "ACKNOWLEDGED" })}
                                    className="flex items-center gap-1 px-2 py-1 border border-yellow-900 text-yellow-400 text-[9px] uppercase hover:bg-yellow-900/20">
                                    <Eye className="w-2.5 h-2.5" /> Acknowledge
                                </button>
                            )}
                            {selectedSitrep.status !== "RESOLVED" && (
                                <button onClick={() => updateSitrep(selectedSitrep._id, { status: "RESOLVED" })}
                                    className="flex items-center gap-1 px-2 py-1 border border-blue-900 text-blue-400 text-[9px] uppercase hover:bg-blue-900/20">
                                    <CheckCheck className="w-2.5 h-2.5" /> Resolve
                                </button>
                            )}
                            <button onClick={() => { setShowSitrepPanel(true); setSelectedSitrep(null) }}
                                className="ml-auto border border-gray-800 text-gray-600 px-2 py-1 text-[9px] hover:text-gray-400">← All</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
