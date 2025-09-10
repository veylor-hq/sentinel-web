"use client"

import Navbar from "@/components/navbar"
import { Activity, BarChart3, TrendingUp, Gauge } from "lucide-react"

export default function MetricsPage() {
  return (
    <div className="bg-black text-white font-sans min-h-screen w-full overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center h-screen text-center px-6 border-b border-gray-800">
        <div className="w-16 h-16 mx-auto mb-6 border border-gray-400 flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-gray-300" />
        </div>
        <h1 className="text-7xl md:text-9xl font-bold tracking-tighter uppercase mb-8">METRICS</h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl uppercase font-mono tracking-widest">
          PERFORMANCE ANALYTICS
        </p>
      </section>

      {/* Performance Metrics */}
      <section className="px-6 py-24 max-w-7xl mx-auto border-b border-gray-800">
        <h2 className="text-5xl font-bold tracking-tight uppercase mb-16 text-center">PERFORMANCE METRICS</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-6xl font-bold mb-4">99.9%</div>
            <div className="text-gray-400 uppercase tracking-wide">UPTIME RELIABILITY</div>
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold mb-4">&lt;50ms</div>
            <div className="text-gray-400 uppercase tracking-wide">RESPONSE TIME</div>
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold mb-4">256-BIT</div>
            <div className="text-gray-400 uppercase tracking-wide">ENCRYPTION STANDARD</div>
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold mb-4">24/7</div>
            <div className="text-gray-400 uppercase tracking-wide">MONITORING</div>
          </div>
        </div>
      </section>

      {/* Operational Analytics */}
      <section className="px-6 py-24 bg-gray-950 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold tracking-tight uppercase mb-16 text-center">OPERATIONAL ANALYTICS</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-black border border-gray-700 p-8">
              <Activity className="w-10 h-10 text-gray-300 mb-6" />
              <h3 className="text-xl font-bold uppercase mb-4">MISSION SUCCESS RATE</h3>
              <div className="text-4xl font-bold mb-2">97.3%</div>
              <p className="text-gray-400 text-sm">Completed objectives within parameters</p>
            </div>
            <div className="bg-black border border-gray-700 p-8">
              <TrendingUp className="w-10 h-10 text-gray-300 mb-6" />
              <h3 className="text-xl font-bold uppercase mb-4">EFFICIENCY IMPROVEMENT</h3>
              <div className="text-4xl font-bold mb-2">+34%</div>
              <p className="text-gray-400 text-sm">Resource optimization over baseline</p>
            </div>
            <div className="bg-black border border-gray-700 p-8">
              <Gauge className="w-10 h-10 text-gray-300 mb-6" />
              <h3 className="text-xl font-bold uppercase mb-4">RESPONSE TIME</h3>
              <div className="text-4xl font-bold mb-2">1.2s</div>
              <p className="text-gray-400 text-sm">Average system response latency</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <h2 className="text-5xl font-bold tracking-tight uppercase mb-16 text-center">TECHNICAL ARCHITECTURE</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="bg-gray-950 border border-gray-700 p-8">
            <h3 className="text-lg font-bold uppercase mb-2">BACKEND</h3>
            <p className="text-gray-500 text-sm">FastAPI + MongoDB</p>
          </div>
          <div className="bg-gray-950 border border-gray-700 p-8">
            <h3 className="text-lg font-bold uppercase mb-2">INTEGRATION</h3>
            <p className="text-gray-500 text-sm">GPS Tracking + Calendar Sync</p>
          </div>
          <div className="bg-gray-950 border border-gray-700 p-8">
            <h3 className="text-lg font-bold uppercase mb-2">SECURITY</h3>
            <p className="text-gray-500 text-sm">VPN + Encrypted Channels</p>
          </div>
          <div className="bg-gray-950 border border-gray-700 p-8">
            <h3 className="text-lg font-bold uppercase mb-2">DEPLOYMENT</h3>
            <p className="text-gray-500 text-sm">Cloud Infrastructure</p>
          </div>
        </div>
      </section>
    </div>
  )
}
