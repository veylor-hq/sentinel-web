"use client"

import { useState } from "react"
import { Shield, Lock, Copy, Zap, Terminal } from "lucide-react"
import { getApiUrl } from "@/lib/api-config"

export function FederationManager() {
    const [peerId, setPeerId] = useState("")
    const [generatedToken, setGeneratedToken] = useState("")
    const [loading, setLoading] = useState(false)

    const handleGenerateHandshake = async () => {
        if (!peerId) return;
        setLoading(true)
        try {
            const res = await fetch(getApiUrl("/api/public/federation/handshake"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ peer_id: peerId })
            });
            if (res.ok) {
                const data = await res.json()
                setGeneratedToken(data.token)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full relative space-y-8">
            <div>
                <h2 className="text-sm text-cyan-500 font-bold uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5" /> Federation & Sovereign Infrastructure
                </h2>
                <p className="text-[10px] text-gray-400 tracking-widest uppercase mb-6">Establish Peer-to-Peer Tactical Links across physical boundaries.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Generate Token */}
                    <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-6 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-900/40" />
                        <h3 className="text-xs text-gray-200 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-cyan-500" />
                            Generate Peer Token
                        </h3>
                        <p className="text-[10px] text-gray-500 tracking-widest mb-4">Create a short-lived (300s) Handshake Token to grant an allied unit connection to your tactical net.</p>

                        <input
                            type="text"
                            placeholder="TARGET PEER ID (E.G. ALPHA-ACTUAL)"
                            value={peerId}
                            onChange={(e) => setPeerId(e.target.value)}
                            className="w-full bg-[#050505] border border-[#222] text-xs text-cyan-100 p-3 mb-4 focus:outline-none focus:border-cyan-800 tracking-widest uppercase"
                        />

                        <button
                            onClick={handleGenerateHandshake}
                            disabled={loading || !peerId}
                            className="w-full flex items-center justify-center gap-2 bg-cyan-900/20 hover:bg-cyan-900/40 border border-cyan-800 text-cyan-400 px-4 py-3 text-[10px] tracking-widest uppercase font-bold disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'GENERATING...' : 'INITIATE HANDSHAKE'}
                        </button>

                        {generatedToken && (
                            <div className="mt-4 p-4 border border-green-900/50 bg-green-900/10">
                                <span className="text-[9px] text-green-500 tracking-widest block mb-2 uppercase">TEMPORARY TOKEN GRANTED:</span>
                                <div className="flex items-center gap-2">
                                    <code className="text-xs text-gray-300 break-all bg-black p-2 border border-[#222] flex-1">
                                        {generatedToken.substring(0, 32)}...
                                    </code>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(generatedToken)}
                                        className="p-2 border border-[#333] hover:border-gray-500 text-gray-400 hover:text-white transition-colors title='Copy Full Token'"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Connect to Peer */}
                    <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-6 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-purple-900/40" />
                        <h3 className="text-xs text-gray-200 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-purple-500" />
                            Ingest Peer Token
                        </h3>
                        <p className="text-[10px] text-gray-500 tracking-widest mb-4">Paste a Handshake Token provided by an allied commander to merge their tactical radar into your COP.</p>

                        <textarea
                            rows={3}
                            placeholder="PASTE PEER TOKEN HERE..."
                            className="w-full bg-[#050505] border border-[#222] text-xs text-purple-100 p-3 mb-4 focus:outline-none focus:border-purple-800 tracking-widest font-mono"
                        />

                        <button
                            className="w-full flex items-center justify-center gap-2 bg-purple-900/20 hover:bg-purple-900/40 border border-purple-800 text-purple-400 px-4 py-3 text-[10px] tracking-widest uppercase font-bold transition-colors"
                        >
                            <Lock className="w-3 h-3" />
                            ESTABLISH UPLINK
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}
