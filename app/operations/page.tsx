"use client"

import Navbar from "@/components/navbar"
import { Users, Server, Activity, Target, CheckSquare, Zap } from "lucide-react"

export default function OperationsPage() {
  return (
    <div className="bg-black text-white font-sans min-h-screen w-full overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center h-screen text-center px-6 border-b border-gray-800">
        <div className="w-16 h-16 mx-auto mb-6 border border-gray-400 flex items-center justify-center">
          <Target className="w-8 h-8 text-gray-300" />
        </div>
        <h1 className="text-7xl md:text-9xl font-bold tracking-tighter uppercase mb-8">OPERATIONS</h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl uppercase font-mono tracking-widest">
          MISSION EXECUTION FRAMEWORK
        </p>
      </section>

      {/* Team Operations */}
      <section className="px-6 py-24 max-w-7xl mx-auto border-b border-gray-800">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-5xl font-bold tracking-tight uppercase mb-8">TEAM OPERATIONS</h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Scale operational excellence across multiple personnel with centralized command and distributed execution
              capabilities.
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Users className="w-6 h-6 text-gray-300" />
                <span className="text-lg font-semibold uppercase">Multi-Agent Coordination</span>
              </div>
              <div className="flex items-center gap-4">
                <Server className="w-6 h-6 text-gray-300" />
                <span className="text-lg font-semibold uppercase">Centralized Command Structure</span>
              </div>
              <div className="flex items-center gap-4">
                <Activity className="w-6 h-6 text-gray-300" />
                <span className="text-lg font-semibold uppercase">Real-Time Status Updates</span>
              </div>
            </div>
          </div>
          <div>
            <img
              src="/dark-tactical-operations-room-with-team-coordinati.png"
              alt="Team Operations Center"
              className="w-full h-auto border border-gray-700"
            />
          </div>
        </div>
      </section>

      {/* Operational Doctrine */}
      <section className="px-6 py-24 bg-gray-950 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold tracking-tight uppercase mb-16 text-center">OPERATIONAL DOCTRINE</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-black border border-gray-700 p-8">
              <Target className="w-10 h-10 text-gray-300 mb-6" />
              <h3 className="text-xl font-bold uppercase mb-4">SITUATIONAL AWARENESS</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Maintain complete visibility of operational environment and resource status at all times.
              </p>
            </div>
            <div className="bg-black border border-gray-700 p-8">
              <CheckSquare className="w-10 h-10 text-gray-300 mb-6" />
              <h3 className="text-xl font-bold uppercase mb-4">MISSION ACCOUNTABILITY</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Track mission progress with precision. Every objective measured, every outcome documented.
              </p>
            </div>
            <div className="bg-black border border-gray-700 p-8">
              <Zap className="w-10 h-10 text-gray-300 mb-6" />
              <h3 className="text-xl font-bold uppercase mb-4">ADAPTIVE EXECUTION</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Respond to changing conditions. Adjust tactics while maintaining strategic objectives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Types */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <h2 className="text-5xl font-bold tracking-tight uppercase mb-16 text-center">MISSION TYPES</h2>
        <div className="space-y-0">
          <div className="group border-b border-gray-800 py-8 hover:bg-gray-950/50 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-bold uppercase tracking-wide">TACTICAL OPERATIONS</h3>
                <p className="text-gray-400 text-lg mt-2">
                  Short-term objectives with immediate execution requirements
                </p>
              </div>
            </div>
          </div>
          <div className="group border-b border-gray-800 py-8 hover:bg-gray-950/50 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-bold uppercase tracking-wide">STRATEGIC MISSIONS</h3>
                <p className="text-gray-400 text-lg mt-2">Long-term campaigns with complex multi-phase execution</p>
              </div>
            </div>
          </div>
          <div className="group py-8 hover:bg-gray-950/50 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-bold uppercase tracking-wide">CONTINGENCY PROTOCOLS</h3>
                <p className="text-gray-400 text-lg mt-2">Emergency response procedures for critical situations</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
