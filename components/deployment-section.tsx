import { ArrowRight } from "lucide-react"

export default function DeploymentSection() {
  return (
    <section id="deployment" className="px-6 py-24 max-w-7xl mx-auto border-b border-gray-800">
      <h2 className="text-5xl font-bold tracking-tight uppercase mb-16 text-center">DEPLOYMENT SCENARIOS</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div className="relative">
          <img
            src="/dark-tactical-operations-room-with-team-coordinati.png"
            alt="Tactical Operations Room"
            className="w-full h-96 object-cover border border-gray-800"
          />
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute bottom-6 left-6 right-6">
            <h3 className="text-2xl font-bold uppercase tracking-wide mb-2">GLOBAL OPERATIONS CENTER</h3>
            <p className="text-gray-300">
              Coordinated deployment across multiple theaters with real-time intelligence integration.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="border border-gray-800 p-8 bg-gray-950/50">
            <h3 className="text-xl font-bold uppercase tracking-wide mb-4">MISSION PARAMETERS</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Active Deployments</span>
                <span className="text-white font-bold">247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Global Coverage</span>
                <span className="text-white font-bold">156 Countries</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Response Teams</span>
                <span className="text-white font-bold">24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="border-t border-gray-800 pt-8 hover:bg-gray-950/30 transition-colors group">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
              <h3 className="text-2xl font-bold uppercase tracking-wide">TACTICAL DEPLOYMENT</h3>
            </div>
            <div className="flex-1 px-8">
              <p className="text-gray-400 text-lg">
                Rapid response operations with precision timing and resource allocation
              </p>
            </div>
            <div className="text-gray-500 hover:text-white transition-colors cursor-pointer">
              <span className="text-sm uppercase tracking-wider">View Operations</span>
              <ArrowRight className="w-4 h-4 inline ml-2" />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 hover:bg-gray-950/30 transition-colors group">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
              <h3 className="text-2xl font-bold uppercase tracking-wide">STRATEGIC COORDINATION</h3>
            </div>
            <div className="flex-1 px-8">
              <p className="text-gray-400 text-lg">
                Multi-theater operations with integrated command and control systems
              </p>
            </div>
            <div className="text-gray-500 hover:text-white transition-colors cursor-pointer">
              <span className="text-sm uppercase tracking-wider">Access Command</span>
              <ArrowRight className="w-4 h-4 inline ml-2" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
