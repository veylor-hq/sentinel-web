export default function IntelligenceSection() {
  return (
    <section id="intelligence" className="px-6 py-24 max-w-7xl mx-auto border-b border-gray-800">
      <h2 className="text-5xl font-bold tracking-tight uppercase mb-16 text-center">INTELLIGENCE OVERVIEW</h2>

      <div className="space-y-8">
        <div className="flex items-start space-x-6">
          <div className="text-2xl font-bold text-white bg-gray-800 w-12 h-12 rounded-none flex items-center justify-center">
            01
          </div>
          <div>
            <h3 className="text-xl font-bold uppercase tracking-wide mb-3">THREAT ASSESSMENT</h3>
            <p className="text-gray-400 text-base leading-relaxed">
              Continuous monitoring and analysis of potential security threats across all operational domains. Real-time
              intelligence gathering and risk evaluation protocols.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-6">
          <div className="text-2xl font-bold text-white bg-gray-800 w-12 h-12 rounded-none flex items-center justify-center">
            02
          </div>
          <div>
            <h3 className="text-xl font-bold uppercase tracking-wide mb-3">DATA FUSION</h3>
            <p className="text-gray-400 text-base leading-relaxed">
              Integration of multiple intelligence sources into comprehensive operational picture. Advanced analytics
              and pattern recognition for strategic decision support.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-6">
          <div className="text-2xl font-bold text-white bg-gray-800 w-12 h-12 rounded-none flex items-center justify-center">
            03
          </div>
          <div>
            <h3 className="text-xl font-bold uppercase tracking-wide mb-3">PREDICTIVE ANALYSIS</h3>
            <p className="text-gray-400 text-base leading-relaxed">
              Machine learning algorithms for forecasting operational outcomes and threat emergence. Proactive
              intelligence capabilities for mission planning and resource allocation.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
