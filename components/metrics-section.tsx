import { ArrowRight } from "lucide-react"

export default function MetricsSection() {
  return (
    <section id="metrics" className="px-6 py-24 max-w-7xl mx-auto border-b border-gray-800">
      <h2 className="text-5xl font-bold tracking-tight uppercase mb-16 text-center">OPERATIONAL METRICS</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div className="space-y-8">
          <div className="border border-gray-800 p-8 bg-gray-950/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold uppercase tracking-wide">MISSION SUCCESS RATE</h3>
              <span className="text-4xl font-bold text-white">99.7%</span>
            </div>
            <p className="text-gray-400">
              Operational success across all deployment scenarios with minimal deviation from projected outcomes.
            </p>
          </div>

          <div className="border border-gray-800 p-8 bg-gray-950/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold uppercase tracking-wide">RESPONSE TIME</h3>
              <span className="text-4xl font-bold text-white">2.3s</span>
            </div>
            <p className="text-gray-400">
              Average time from threat detection to operational response deployment across global networks.
            </p>
          </div>
        </div>

        <div className="relative">
          <img
            src="/dark-military-command-center-with-multiple-screens.png"
            alt="Command Center Operations"
            className="w-full h-full object-cover border border-gray-800"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="border-t border-gray-800 pt-8 hover:bg-gray-950/30 transition-colors group">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
              <h3 className="text-2xl font-bold uppercase tracking-wide">PERFORMANCE ANALYTICS</h3>
            </div>
            <div className="flex-1 px-8">
              <p className="text-gray-400 text-lg">Real-time operational metrics and predictive performance modeling</p>
            </div>
            <div className="text-gray-500 hover:text-white transition-colors cursor-pointer">
              <span className="text-sm uppercase tracking-wider">View Dashboard</span>
              <ArrowRight className="w-4 h-4 inline ml-2" />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 hover:bg-gray-950/30 transition-colors group">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
              <h3 className="text-2xl font-bold uppercase tracking-wide">MISSION REPORTS</h3>
            </div>
            <div className="flex-1 px-8">
              <p className="text-gray-400 text-lg">
                Comprehensive after-action reports and strategic intelligence briefings
              </p>
            </div>
            <div className="text-gray-500 hover:text-white transition-colors cursor-pointer">
              <span className="text-sm uppercase tracking-wider">Access Reports</span>
              <ArrowRight className="w-4 h-4 inline ml-2" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
