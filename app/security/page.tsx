"use client"

import Navbar from "@/components/navbar"
import { Shield, Lock, Activity, Database } from "lucide-react"

export default function SecurityPage() {
  return (
    <div className="bg-black text-white font-sans min-h-screen w-full overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center h-screen text-center px-6 border-b border-gray-800">
        <div className="w-16 h-16 mx-auto mb-6 border border-gray-400 flex items-center justify-center">
          <Shield className="w-8 h-8 text-gray-300" />
        </div>
        <h1 className="text-7xl md:text-9xl font-bold tracking-tighter uppercase mb-8">SECURITY</h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl uppercase font-mono tracking-widest">
          MILITARY-GRADE PROTECTION
        </p>
      </section>

      {/* Security Infrastructure */}
      <section className="px-6 py-24 bg-gray-950 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-5xl font-bold tracking-tight uppercase">SECURITY INFRASTRUCTURE</h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Military-grade security protocols protect all operational data with multi-layered encryption and
                zero-trust architecture.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-black border border-gray-700 p-6">
                  <Lock className="w-8 h-8 text-gray-300 mb-4" />
                  <h3 className="text-lg font-bold uppercase mb-2">ENCRYPTION</h3>
                  <p className="text-gray-500 text-sm">AES-256 End-to-End</p>
                </div>
                <div className="bg-black border border-gray-700 p-6">
                  <Shield className="w-8 h-8 text-gray-300 mb-4" />
                  <h3 className="text-lg font-bold uppercase mb-2">AUTHENTICATION</h3>
                  <p className="text-gray-500 text-sm">Multi-Factor Biometric</p>
                </div>
                <div className="bg-black border border-gray-700 p-6">
                  <Activity className="w-8 h-8 text-gray-300 mb-4" />
                  <h3 className="text-lg font-bold uppercase mb-2">MONITORING</h3>
                  <p className="text-gray-500 text-sm">24/7 Threat Detection</p>
                </div>
                <div className="bg-black border border-gray-700 p-6">
                  <Database className="w-8 h-8 text-gray-300 mb-4" />
                  <h3 className="text-lg font-bold uppercase mb-2">BACKUP</h3>
                  <p className="text-gray-500 text-sm">Distributed Redundancy</p>
                </div>
              </div>
            </div>
            <div>
              <img
                src="/dark-cybersecurity-network-visualization-with-encr.png"
                alt="Security Network Visualization"
                className="w-full h-auto border border-gray-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Security Protocols */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <h2 className="text-5xl font-bold tracking-tight uppercase mb-16 text-center">SECURITY PROTOCOLS</h2>
        <div className="space-y-0">
          <div className="group border-b border-gray-800 py-8 hover:bg-gray-950/50 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-bold uppercase tracking-wide">ZERO-TRUST ARCHITECTURE</h3>
                <p className="text-gray-400 text-lg mt-2">
                  Never trust, always verify - comprehensive identity validation
                </p>
              </div>
            </div>
          </div>
          <div className="group border-b border-gray-800 py-8 hover:bg-gray-950/50 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-bold uppercase tracking-wide">THREAT INTELLIGENCE</h3>
                <p className="text-gray-400 text-lg mt-2">Real-time threat detection and automated response systems</p>
              </div>
            </div>
          </div>
          <div className="group py-8 hover:bg-gray-950/50 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-bold uppercase tracking-wide">INCIDENT RESPONSE</h3>
                <p className="text-gray-400 text-lg mt-2">
                  Rapid containment and recovery protocols for security breaches
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
