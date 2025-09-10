"use client"

import Navbar from "@/components/navbar"
import { Eye, Brain, Network, Activity, Database, Server } from "lucide-react"

export default function IntelligencePage() {
  return (
    <div className="bg-black text-white font-sans min-h-screen w-full overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center h-screen text-center px-6 border-b border-gray-800">
        <div className="w-16 h-16 mx-auto mb-6 border border-gray-400 flex items-center justify-center">
          <Eye className="w-8 h-8 text-gray-300" />
        </div>
        <h1 className="text-7xl md:text-9xl font-bold tracking-tighter uppercase mb-8">INTELLIGENCE</h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl uppercase font-mono tracking-widest">
          REAL-TIME OPERATIONAL AWARENESS
        </p>
      </section>

      {/* Intelligence Overview */}
      <section className="px-6 py-24 max-w-7xl mx-auto border-b border-gray-800">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <img
              src="/dark-military-command-center-with-multiple-screens.png"
              alt="Command Center Interface"
              className="w-full h-auto border border-gray-700"
            />
          </div>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Eye className="w-6 h-6 text-gray-300 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold uppercase mb-2">REAL-TIME MONITORING</h3>
                <p className="text-gray-400">
                  Continuous surveillance of all operational parameters with instant threat detection and response
                  protocols.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Brain className="w-6 h-6 text-gray-300 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold uppercase mb-2">PREDICTIVE ANALYSIS</h3>
                <p className="text-gray-400">
                  Advanced algorithms process historical data to forecast mission outcomes and resource requirements.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Network className="w-6 h-6 text-gray-300 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold uppercase mb-2">NETWORK INTEGRATION</h3>
                <p className="text-gray-400">
                  Seamless connectivity across all operational nodes with encrypted communication channels.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intelligence Capabilities */}
      <section className="px-6 py-24 bg-gray-950 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold tracking-tight uppercase mb-16 text-center">INTELLIGENCE CAPABILITIES</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-black border border-gray-700 p-8">
              <Activity className="w-10 h-10 text-gray-300 mb-6" />
              <h3 className="text-xl font-bold uppercase mb-4">THREAT ASSESSMENT</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Continuous evaluation of operational risks with automated alert systems and mitigation protocols.
              </p>
            </div>
            <div className="bg-black border border-gray-700 p-8">
              <Database className="w-10 h-10 text-gray-300 mb-6" />
              <h3 className="text-xl font-bold uppercase mb-4">DATA FUSION</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Integration of multiple intelligence sources into unified operational picture with real-time updates.
              </p>
            </div>
            <div className="bg-black border border-gray-700 p-8">
              <Server className="w-10 h-10 text-gray-300 mb-6" />
              <h3 className="text-xl font-bold uppercase mb-4">PATTERN RECOGNITION</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Machine learning algorithms identify operational patterns and anomalies for strategic advantage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Intelligence Metrics */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <h2 className="text-5xl font-bold tracking-tight uppercase mb-16 text-center">INTELLIGENCE METRICS</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-6xl font-bold mb-4">100%</div>
            <div className="text-gray-400 uppercase tracking-wide">DATA ACCURACY</div>
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold mb-4">&lt;1s</div>
            <div className="text-gray-400 uppercase tracking-wide">ALERT RESPONSE</div>
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold mb-4">24/7</div>
            <div className="text-gray-400 uppercase tracking-wide">SURVEILLANCE</div>
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold mb-4">99.9%</div>
            <div className="text-gray-400 uppercase tracking-wide">UPTIME</div>
          </div>
        </div>
      </section>
    </div>
  )
}
