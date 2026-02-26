"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { getApiUrl } from "@/lib/api-config"
import {
  Shield, ChevronLeft, Target, Route as RouteIcon, Users, CheckSquare,
  Clock, Download, Play, Square, AlertTriangle, Plus, Trash2, Edit2, Save, X,
  ChevronRight, Truck, Package, ListTodo
} from "lucide-react"

const STATUS_COLORS: Record<string, string> = {
  active: "text-green-400 border-green-900/50 bg-green-900/10",
  planned: "text-yellow-500 border-yellow-900/50 bg-yellow-900/10",
  warm_up: "text-orange-400 border-orange-900/50 bg-orange-900/10",
  completed: "text-blue-400 border-blue-900/50 bg-blue-900/10",
  aborted: "text-red-500 border-red-900/50 bg-red-900/10",
}

const STEP_NEXT: Record<string, string[]> = {
  planned: ["active", "skipped"],
  active: ["done", "skipped"],
  done: [],
  skipped: [],
  altered: ["done"],
}

const STEP_PILL: Record<string, string> = {
  active: "text-green-400 border-green-800 bg-green-900/10",
  planned: "text-gray-500 border-[#333]",
  done: "text-blue-400 border-blue-800 bg-blue-900/10",
  skipped: "text-gray-700 border-[#222]",
  altered: "text-yellow-500 border-yellow-800",
}

export default function MissionBriefing() {
  const params = useParams()
  const router = useRouter()
  const missionId = params.id as string

  const [brief, setBrief] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Summary editing
  const [editingSummary, setEditingSummary] = useState(false)
  const [summaryDraft, setSummaryDraft] = useState("")
  const [savingSummary, setSavingSummary] = useState(false)

  // Add step
  const [showAddStep, setShowAddStep] = useState(false)
  const [newStepName, setNewStepName] = useState("")
  const [newStepType, setNewStepType] = useState("custom")
  const [addingStep, setAddingStep] = useState(false)

  // TODO
  const [newTodo, setNewTodo] = useState("")
  const [addingTodo, setAddingTodo] = useState(false)

  // Mission status
  const [transitioning, setTransitioning] = useState(false)

  const tok = () => localStorage.getItem("auth_token") || ""

  const fetchBrief = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl(`/api/private/mission/${missionId}/brief`), {
        headers: { Authorization: tok() }
      })
      if (res.ok) {
        const data = await res.json()
        setBrief(data)
        setSummaryDraft(data.mission?.summary || "")
      } else if (res.status === 401) {
        router.push("/")
      } else {
        setError(`${res.status} ${res.statusText}`)
      }
    } catch (e: any) {
      setError(e.message || "Network error")
    } finally {
      setLoading(false)
    }
  }, [missionId, router])

  useEffect(() => { fetchBrief() }, [fetchBrief])

  const transitionMission = async (state: string) => {
    setTransitioning(true)
    await fetch(getApiUrl(`/api/private/mission/${missionId}?new_state=${state}`), {
      method: "PATCH", headers: { Authorization: tok() }
    })
    await fetchBrief()
    setTransitioning(false)
  }

  const progressStep = async (stepId: string, nextStatus: string) => {
    await fetch(getApiUrl(`/api/private/mission/${missionId}/steps/${stepId}`), {
      method: "PATCH",
      headers: { Authorization: tok(), "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    })
    await fetchBrief()
  }

  const setStepAsset = async (stepId: string, assetId: string | null, label: string) => {
    await fetch(getApiUrl(`/api/private/mission/${missionId}/steps/${stepId}`), {
      method: "PATCH",
      headers: { Authorization: tok(), "Content-Type": "application/json" },
      body: JSON.stringify(assetId ? { asset_id: assetId } : { clear_asset: true, asset_label: label || null })
    })
    await fetchBrief()
  }

  const attachAsset = async (assetId: string) => {
    await fetch(getApiUrl(`/api/private/mission/${missionId}/assets/${assetId}`), {
      method: "POST", headers: { Authorization: tok() }
    })
    await fetchBrief()
  }

  const detachAsset = async (assetId: string) => {
    await fetch(getApiUrl(`/api/private/mission/${missionId}/assets/${assetId}`), {
      method: "DELETE", headers: { Authorization: tok() }
    })
    await fetchBrief()
  }

  const addTodo = async () => {
    if (!newTodo.trim()) return
    setAddingTodo(true)
    await fetch(getApiUrl(`/api/private/mission/${missionId}/todos/`), {
      method: "POST",
      headers: { Authorization: tok(), "Content-Type": "application/json" },
      body: JSON.stringify({ description: newTodo.trim() })
    })
    setNewTodo("")
    setAddingTodo(false)
    await fetchBrief()
  }

  const toggleTodo = async (todoId: string) => {
    await fetch(getApiUrl(`/api/private/mission/${missionId}/todos/${todoId}`), {
      method: "PATCH", headers: { Authorization: tok() }
    })
    await fetchBrief()
  }

  const deleteTodo = async (todoId: string) => {
    await fetch(getApiUrl(`/api/private/mission/${missionId}/todos/${todoId}`), {
      method: "DELETE", headers: { Authorization: tok() }
    })
    await fetchBrief()
  }

  const saveSummary = async () => {
    setSavingSummary(true)
    await fetch(getApiUrl(`/api/private/mission/${missionId}/summary`), {
      method: "PUT",
      headers: { Authorization: tok(), "Content-Type": "application/json" },
      body: JSON.stringify({ summary: summaryDraft })
    })
    setEditingSummary(false)
    setSavingSummary(false)
    await fetchBrief()
  }

  const addStep = async () => {
    if (!newStepName.trim()) return
    setAddingStep(true)
    await fetch(getApiUrl(`/api/private/mission/${missionId}/steps/`), {
      method: "POST",
      headers: { Authorization: tok(), "Content-Type": "application/json" },
      body: JSON.stringify({ name: newStepName.trim(), step_type: newStepType })
    })
    setNewStepName(""); setNewStepType("custom"); setShowAddStep(false)
    setAddingStep(false)
    await fetchBrief()
  }

  // ── Loading / Error ──
  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center font-mono text-cyan-500">
      <div className="flex flex-col items-center gap-4">
        <Target className="w-8 h-8 animate-spin" />
        <span className="text-xs animate-pulse tracking-widest">DECRYPTING DOSSIER...</span>
      </div>
    </div>
  )
  if (error) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center font-mono">
      <div className="border border-red-900 bg-red-900/10 p-8 max-w-md text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
        <p className="text-red-400 text-sm tracking-widest">{error}</p>
        <button onClick={() => router.push("/")} className="border border-gray-700 text-gray-400 px-4 py-2 text-xs tracking-widest uppercase">Return to Sentinel</button>
      </div>
    </div>
  )
  if (!brief?.mission) return null

  const { mission, steps = [], routes = [], rois = [], assets = [], all_assets = [], operator_name } = brief
  const attachedIds = new Set(assets.map((a: any) => a._id?.toString()))
  const availableAssets = all_assets.filter((a: any) => !attachedIds.has(a._id?.toString()))
  const todo_items = mission.todo_items || []

  const nextMissionStates: Record<string, string[]> = {
    planned: ["warm_up", "aborted"],
    warm_up: ["active", "planned", "aborted"],
    active: ["completed", "aborted"],
    completed: [],
    aborted: [],
    debrief: ["completed"],
  }
  const missionNextStates = nextMissionStates[mission.status] || []
  const missionIsRunning = ["active", "warm_up"].includes(mission.status)

  return (
    <div className="min-h-screen bg-[#000] text-gray-300 font-mono selection:bg-cyan-900 selection:text-cyan-100">

      {/* Header */}
      <header className="h-14 border-b border-[#1a1a1a] bg-[#050505] flex items-center px-4 sticky top-0 z-50 gap-3">
        <button onClick={() => router.push("/")}
          className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors text-xs tracking-widest uppercase shrink-0">
          <ChevronLeft className="w-4 h-4" /> VEYLOR
        </button>
        <span className="text-gray-700">/</span>
        <span className="text-xs text-gray-400 tracking-widest truncate flex-1">{mission.name}</span>

        <div className="flex gap-2 shrink-0">
          {missionNextStates.map(s => (
            <button key={s} disabled={transitioning}
              onClick={() => transitionMission(s)}
              className={`flex items-center gap-1 px-3 py-1.5 border text-[10px] tracking-widest uppercase font-bold transition-all disabled:opacity-40 ${s === "aborted" ? "border-red-900 text-red-500 hover:bg-red-900/20"
                : s === "completed" ? "border-blue-800 text-blue-400 hover:bg-blue-900/20"
                  : "border-green-900 text-green-400 hover:bg-green-900/20"
                }`}>
              {s === "active" ? <Play className="w-3 h-3" />
                : s === "completed" ? <Square className="w-3 h-3" />
                  : s === "aborted" ? <X className="w-3 h-3" />
                    : <Clock className="w-3 h-3" />}
              {transitioning ? "…" : s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Dossier + Timeline ─── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Dossier Banner */}
          <div className="border border-cyan-900/30 bg-[#0a0a0a] p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none"><Target className="w-48 h-48" /></div>
            <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
              <div>
                <p className="text-[9px] text-cyan-700 tracking-[0.3em] uppercase mb-1 font-bold">Operation Codename</p>
                <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider">{mission.name}</h1>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-[10px] px-2 py-1 border tracking-widest font-bold uppercase ${STATUS_COLORS[mission.status] || "text-gray-400 border-gray-700"}`}>
                  {mission.status?.replace(/_/g, " ")}
                </span>
                {mission.status === "completed" && (
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(getApiUrl(`/api/private/aar/${mission._id}/export`), {
                          headers: { Authorization: tok() }
                        })
                        if (res.ok) {
                          const blob = await res.blob()
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement("a")
                          a.href = url
                          a.download = `op_${mission.name.replace(/\s+/g, "_")}_aar.veylor-aar`
                          document.body.appendChild(a)
                          a.click()
                          URL.revokeObjectURL(url)
                          a.remove()
                        } else {
                          alert("AAR export failed — check server logs")
                        }
                      } catch (err) {
                        console.error("AAR export error:", err)
                      }
                    }}
                    className="flex items-center gap-1 bg-cyan-900/20 border border-cyan-800 text-cyan-400 px-3 py-1 text-[10px] tracking-widest uppercase hover:bg-cyan-900/40 transition-colors">
                    <Download className="w-3 h-3" /> Export AAR
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-[#1a1a1a] pt-4 text-[11px]">
              <div>
                <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-0.5">Operator</p>
                <p className="text-gray-300 font-bold">{operator_name || "—"}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-0.5">Start (Z)</p>
                <p className="text-gray-400">{mission.start_time ? new Date(mission.start_time).toUTCString().replace(" GMT", "Z") : "TBD"}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-0.5">Objective</p>
                <div className="flex items-start gap-1">
                  {editingSummary ? (
                    <>
                      <textarea autoFocus rows={2}
                        className="flex-1 bg-black border border-cyan-800 text-xs p-1.5 text-gray-300 outline-none resize-none"
                        value={summaryDraft} onChange={e => setSummaryDraft(e.target.value)} />
                      <div className="flex flex-col gap-1">
                        <button onClick={saveSummary} disabled={savingSummary} className="text-cyan-500 hover:text-cyan-300"><Save className="w-3 h-3" /></button>
                        <button onClick={() => setEditingSummary(false)} className="text-gray-600 hover:text-gray-400"><X className="w-3 h-3" /></button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-500 italic flex-1 text-[10px]">{mission.summary || "—"}</p>
                      <button onClick={() => setEditingSummary(true)} className="text-gray-700 hover:text-cyan-600 shrink-0"><Edit2 className="w-3 h-3" /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-2 mb-3">
              <h2 className="text-xs text-cyan-500 tracking-widest font-bold uppercase flex items-center gap-2">
                <Clock className="w-4 h-4" /> Operational Timeline
              </h2>
              <button onClick={() => setShowAddStep(s => !s)}
                className="text-[10px] text-gray-600 hover:text-cyan-500 uppercase tracking-widest flex items-center gap-1 transition-colors">
                <Plus className="w-3 h-3" /> Add Phase
              </button>
            </div>

            {showAddStep && (
              <div className="border border-cyan-900/30 bg-[#080808] p-3 flex gap-2 mb-3">
                <input autoFocus
                  className="flex-1 bg-black border border-[#333] text-sm px-2 py-1.5 text-gray-300 focus:border-cyan-700 outline-none uppercase placeholder-gray-700"
                  placeholder="PHASE NAME" value={newStepName}
                  onChange={e => setNewStepName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addStep() }} />
                <select className="bg-black border border-[#333] text-xs px-2 py-1 text-gray-500 outline-none"
                  value={newStepType} onChange={e => setNewStepType(e.target.value)}>
                  {["custom", "movement", "activity", "waiting", "social"].map(t =>
                    <option key={t} value={t}>{t.toUpperCase()}</option>)}
                </select>
                <button onClick={addStep} disabled={addingStep || !newStepName.trim()}
                  className="bg-cyan-900/20 border border-cyan-800 text-cyan-400 px-3 text-[10px] tracking-widest uppercase hover:bg-cyan-900/40 disabled:opacity-50">
                  {addingStep ? "…" : "Add"}
                </button>
                <button onClick={() => setShowAddStep(false)} className="text-gray-600 hover:text-gray-400"><X className="w-4 h-4" /></button>
              </div>
            )}

            <div className="space-y-2">
              {steps.length === 0 ? (
                <div className="border border-dashed border-[#222] p-6 text-center text-[10px] text-gray-700 uppercase tracking-widest">
                  No phases — click Add Phase above
                </div>
              ) : steps.map((step: any) => (
                <StepCard key={step._id} step={step} missionId={missionId} allAssets={all_assets}
                  missionIsRunning={missionIsRunning}
                  onProgress={progressStep} onSetAsset={setStepAsset} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Right sidebar ─── */}
        <div className="space-y-5">

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Phases", value: steps.length, c: "text-cyan-400" },
              { label: "Done", value: steps.filter((s: any) => s.status === "done").length, c: "text-blue-400" },
              { label: "Assets", value: assets.length, c: "text-green-400" },
              { label: "To-dos", value: todo_items.filter((t: any) => !t.is_completed).length, c: "text-yellow-400" },
            ].map((s, i) => (
              <div key={i} className="border border-[#1a1a1a] bg-[#050505] p-3">
                <p className="text-[9px] text-gray-600 uppercase tracking-widest">{s.label}</p>
                <p className={`text-xl font-light ${s.c}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* TODO List */}
          <div className="border border-[#1a1a1a] bg-[#050505]">
            <div className="p-2 border-b border-[#1a1a1a] flex items-center gap-2 bg-[#0a0a0a]">
              <ListTodo className="w-3 h-3 text-yellow-600" />
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">TODO / Notes</span>
            </div>
            <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
              {todo_items.length === 0 && (
                <p className="text-[10px] text-gray-700 text-center py-2 uppercase tracking-widest">Empty</p>
              )}
              {todo_items.map((t: any) => (
                <div key={t.id} className="flex items-start gap-2 group hover:bg-[#0d0d0d] p-1 -mx-1 transition-colors">
                  <button onClick={() => toggleTodo(t.id)}
                    className={`mt-0.5 w-3 h-3 border shrink-0 transition-colors ${t.is_completed ? "bg-green-500/20 border-green-600" : "border-[#444]"}`} />
                  <span className={`flex-1 text-[10px] ${t.is_completed ? "text-gray-600 line-through" : "text-gray-300"}`}>{t.description}</span>
                  <button onClick={() => deleteTodo(t.id)} className="opacity-0 group-hover:opacity-100 text-gray-700 hover:text-red-500 transition-all"><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-[#1a1a1a] flex gap-2">
              <input className="flex-1 bg-black border border-[#333] text-[10px] px-2 py-1 text-gray-300 focus:border-yellow-800 outline-none placeholder-gray-700 uppercase"
                placeholder="ADD TO-DO…" value={newTodo}
                onChange={e => setNewTodo(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addTodo() }} />
              <button onClick={addTodo} disabled={addingTodo || !newTodo.trim()}
                className="px-2 py-1 border border-[#333] text-gray-500 hover:text-yellow-500 hover:border-yellow-800 text-[10px] transition-colors disabled:opacity-40">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Assets */}
          <div className="border border-[#1a1a1a] bg-[#050505]">
            <div className="p-2 border-b border-[#1a1a1a] flex items-center gap-2 bg-[#0a0a0a]">
              <Package className="w-3 h-3 text-green-600" />
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">Attached Assets</span>
            </div>
            <div className="p-2 space-y-1">
              {assets.length === 0 ? (
                <p className="text-[10px] text-gray-700 text-center py-2 uppercase tracking-widest">None attached</p>
              ) : assets.map((a: any) => (
                <div key={a._id} className="flex items-center gap-2 p-1.5 border border-[#1a1a1a] group">
                  <Truck className="w-3 h-3 text-gray-600" />
                  <span className="flex-1 text-xs text-gray-300 uppercase font-bold">{a.name}</span>
                  <span className="text-[9px] text-gray-600 uppercase">{a.asset_type}</span>
                  <button onClick={() => detachAsset(a._id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-700 hover:text-red-500 transition-all"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
            {availableAssets.length > 0 && (
              <div className="p-2 border-t border-[#1a1a1a]">
                <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Attach:</p>
                <div className="flex flex-wrap gap-1">
                  {availableAssets.map((a: any) => (
                    <button key={a._id} onClick={() => attachAsset(a._id)}
                      className="text-[9px] px-2 py-0.5 border border-[#333] text-gray-500 hover:border-green-800 hover:text-green-500 uppercase tracking-widest transition-colors flex items-center gap-1">
                      <Plus className="w-2.5 h-2.5" /> {a.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Intel */}
          <div className="border border-[#1a1a1a] bg-[#050505]">
            <div className="p-2 border-b border-[#1a1a1a] flex items-center gap-2 bg-[#0a0a0a]">
              <RouteIcon className="w-3 h-3 text-cyan-700" />
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">Intel</span>
            </div>
            <div className="p-2 space-y-1 text-[10px]">
              <div className="flex justify-between p-2 border border-[#111]"><span className="text-gray-600 uppercase">Routes</span><span className="text-cyan-400">{routes.length}</span></div>
              <div className="flex justify-between p-2 border border-[#111]"><span className="text-gray-600 uppercase">ROIs</span><span className="text-cyan-400">{rois.length}</span></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// ── Step Card with progression + asset picker ──────────────────────────────

function StepCard({ step, missionId, allAssets, missionIsRunning, onProgress, onSetAsset }: {
  step: any
  missionId: string
  allAssets: any[]
  missionIsRunning: boolean
  onProgress: (id: string, status: string) => void
  onSetAsset: (id: string, assetId: string | null, label: string) => void
}) {
  const [showAsset, setShowAsset] = useState(false)
  const [assetLabel, setAssetLabel] = useState(step.asset_label || "")
  const [selectedAsset, setSelectedAsset] = useState(step.asset_id || "")
  const nexts = STEP_NEXT[step.status] || []

  const linkedAsset = allAssets.find((a: any) => a._id === step.asset_id || a._id?.toString() === step.asset_id)

  const saveAsset = () => {
    onSetAsset(step._id, selectedAsset || null, assetLabel)
    setShowAsset(false)
  }

  return (
    <div className={`border transition-all bg-[#080808] ${step.status === "active" ? "border-green-900/60 shadow-[0_0_15px_rgba(0,255,0,0.04)]" : step.status === "done" ? "border-blue-900/30 opacity-70" : step.status === "skipped" ? "border-[#111] opacity-40" : "border-[#1a1a1a] hover:border-[#2a2a2a]"}`}>
      <div className="flex items-start gap-3 p-3">
        {/* Step indicator */}
        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${step.status === "active" ? "bg-green-400 animate-pulse shadow-[0_0_6px_rgba(74,222,128,0.8)]" : step.status === "done" ? "bg-blue-500" : step.status === "skipped" ? "bg-gray-700" : "bg-[#333]"}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-bold uppercase tracking-wider ${step.status === "done" || step.status === "skipped" ? "text-gray-600" : "text-gray-200"}`}>
              {step.name}
            </span>
            <span className={`text-[9px] px-1.5 py-0.5 border uppercase ${STEP_PILL[step.status] || "text-gray-500 border-[#333]"}`}>
              {step.status}
            </span>
            <span className="text-[9px] text-gray-700 uppercase border border-[#222] px-1.5 py-0.5">{step.step_type}</span>
          </div>

          <div className="flex gap-3 mt-0.5 text-[9px] text-gray-700">
            {step.actual_start && <span>Started {new Date(step.actual_start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}
            {step.actual_end && <span>Ended {new Date(step.actual_end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}
          </div>

          {/* Movement asset summary */}
          {step.step_type === "movement" && (
            <div className="mt-1.5 flex gap-2 items-center text-[9px]">
              <Truck className="w-3 h-3 text-gray-700" />
              {linkedAsset ? (
                <span className="text-cyan-700">{linkedAsset.name}</span>
              ) : step.asset_label ? (
                <span className="text-gray-600">{step.asset_label}</span>
              ) : (
                <span className="text-gray-800">No vehicle assigned</span>
              )}
              <button onClick={() => setShowAsset(s => !s)} className="text-gray-700 hover:text-cyan-600 transition-colors ml-1">
                <Edit2 className="w-2.5 h-2.5" />
              </button>
            </div>
          )}

          {/* Asset picker for movement */}
          {showAsset && step.step_type === "movement" && (
            <div className="mt-2 border border-cyan-900/30 bg-[#050505] p-2 space-y-2">
              <p className="text-[9px] text-gray-600 uppercase tracking-widest">Link Vehicle</p>
              {allAssets.length > 0 && (
                <select className="w-full bg-black border border-[#333] text-xs px-2 py-1 text-gray-400 outline-none"
                  value={selectedAsset} onChange={e => setSelectedAsset(e.target.value)}>
                  <option value="">— pick asset —</option>
                  {allAssets.map((a: any) => <option key={a._id} value={a._id}>{a.name} ({a.asset_type})</option>)}
                </select>
              )}
              <input className="w-full bg-black border border-[#333] text-[10px] px-2 py-1 text-gray-400 outline-none placeholder-gray-700"
                placeholder="or type vehicle / callsign…"
                value={assetLabel} onChange={e => setAssetLabel(e.target.value)} />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowAsset(false)} className="text-[9px] text-gray-600 hover:text-gray-400 px-2 py-1 border border-[#333]">Cancel</button>
                <button onClick={saveAsset} className="text-[9px] text-cyan-400 hover:text-cyan-300 px-2 py-1 border border-cyan-900 bg-cyan-900/20">Save</button>
              </div>
            </div>
          )}
        </div>

        {/* Progress buttons */}
        {nexts.length > 0 && (step.status === "planned" || missionIsRunning) && (
          <div className="flex gap-1 shrink-0">
            {nexts.map(next => (
              <button key={next} onClick={() => onProgress(step._id, next)}
                className={`flex items-center gap-1 px-2 py-1.5 border text-[9px] uppercase tracking-widest font-bold transition-all ${next === "done" ? "border-blue-900 text-blue-400 hover:bg-blue-900/20"
                  : next === "active" ? "border-green-900 text-green-400 hover:bg-green-900/20"
                    : "border-[#333] text-gray-600 hover:border-gray-600 hover:text-gray-400"
                  }`}>
                {next === "active" ? <Play className="w-2.5 h-2.5" /> : next === "done" ? <Square className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
                {next}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
