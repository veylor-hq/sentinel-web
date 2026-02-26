"use client"

import { useState, useEffect } from "react"
import { Database, Plus, Trash2, Cpu, Truck, UserCircle } from "lucide-react"
import { getApiUrl } from "@/lib/api-config"

export interface Asset {
    _id: string;
    name: string;
    asset_type: "vehicle" | "person" | "equipment";
    owner_id: string;
}

export function AssetManager() {
    const [assets, setAssets] = useState<Asset[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)

    // Form State
    const [newName, setNewName] = useState("")
    const [newType, setNewType] = useState<"vehicle" | "person" | "equipment">("vehicle")

    useEffect(() => {
        fetchAssets()
    }, [])

    const fetchAssets = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("auth_token")
            const res = await fetch(getApiUrl("/api/private/asset/"), {
                headers: { Authorization: `${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setAssets(data)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleAddAsset = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName.trim()) return

        try {
            const token = localStorage.getItem("auth_token")
            const res = await fetch(getApiUrl("/api/private/asset/"), {
                method: "POST",
                headers: {
                    "Authorization": `${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: newName,
                    asset_type: newType
                })
            })

            if (res.ok) {
                setNewName("")
                setIsAdding(false)
                fetchAssets()
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this asset?")) return
        try {
            const token = localStorage.getItem("auth_token")
            const res = await fetch(getApiUrl(`/api/private/asset/${id}`), {
                method: "DELETE",
                headers: { "Authorization": `${token}` }
            })
            if (res.ok) {
                fetchAssets()
            }
        } catch (err) {
            console.error(err)
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'vehicle': return <Truck className="w-4 h-4" />
            case 'person': return <UserCircle className="w-4 h-4" />
            case 'equipment': return <Cpu className="w-4 h-4" />
            default: return <Database className="w-4 h-4" />
        }
    }

    return (
        <div className="flex flex-col h-full relative">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-cyan-500 font-bold tracking-[0.2em] flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        ASSET FLEET & LOADOUT
                    </h2>
                    <p className="text-gray-500 text-[10px] mt-1 track-widest uppercase">Manage physical and digital tactical assets</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-3 py-1.5 border border-cyan-800 bg-cyan-950/30 text-cyan-400 text-xs tracking-widest hover:bg-cyan-900/50 transition-colors"
                >
                    {isAdding ? "CANCEL" : <><Plus className="w-3 h-3" /> REGISTER ASSET</>}
                </button>
            </div>

            {isAdding && (
                <div className="mb-6 border border-[#222] bg-[#0d0d0d] p-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <h3 className="text-[10px] text-gray-400 tracking-widest uppercase mb-3 border-b border-[#222] pb-2">New Registration Protocol</h3>
                    <form onSubmit={handleAddAsset} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-[9px] text-cyan-600 tracking-widest uppercase mb-1">Designation</label>
                            <input
                                autoFocus
                                type="text"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                className="w-full bg-black border border-[#222] p-2 text-sm text-gray-300 focus:border-cyan-700 outline-none"
                                placeholder="e.g. BRAVO-TEAM-LEAD"
                            />
                        </div>
                        <div className="w-48">
                            <label className="block text-[9px] text-cyan-600 tracking-widest uppercase mb-1">Class</label>
                            <select
                                value={newType}
                                onChange={e => setNewType(e.target.value as any)}
                                className="w-full bg-black border border-[#222] p-2 text-sm text-gray-300 focus:border-cyan-700 outline-none"
                            >
                                <option value="vehicle">VEHICLE / DRONE</option>
                                <option value="person">PERSONNEL</option>
                                <option value="equipment">SYSTEM / SENSOR</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={!newName.trim()}
                            className="bg-cyan-900/40 text-cyan-400 border border-cyan-800 p-2 text-xs tracking-widest hover:bg-cyan-900/60 transition-colors disabled:opacity-50 h-[38px] px-6"
                        >
                            INITIALIZE
                        </button>
                    </form>
                </div>
            )}

            <div className="flex-1 border border-[#1a1a1a] bg-[#050505] overflow-y-auto relative">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-[#0a0a0a] z-10 border-b border-[#1a1a1a] text-[10px] text-gray-500 uppercase tracking-widest">
                        <tr>
                            <th className="p-3 font-normal">CLASS</th>
                            <th className="p-3 font-normal">DESIGNATION</th>
                            <th className="p-3 font-normal">HARDWARE ID</th>
                            <th className="p-3 font-normal text-right">ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-600 text-xs tracking-widest">SYNCING...</td></tr>
                        ) : assets.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-600 text-xs tracking-widest">NO ASSETS REGISTERED</td></tr>
                        ) : (
                            assets.map((asset) => (
                                <tr key={asset._id} className="border-b border-[#111] hover:bg-[#0a0a0a] transition-colors group">
                                    <td className="p-3 text-gray-400">
                                        <span className="flex items-center gap-2">
                                            {getIcon(asset.asset_type)}
                                            <span className="text-[10px] uppercase">{asset.asset_type}</span>
                                        </span>
                                    </td>
                                    <td className="p-3 text-cyan-100 font-bold">{asset.name}</td>
                                    <td className="p-3 text-[10px] tracking-wider text-gray-500 uppercase font-mono">{asset._id}</td>
                                    <td className="p-3 text-right">
                                        <button
                                            onClick={() => handleDelete(asset._id)}
                                            className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
