export default function DoctrineSection() {
  return (
    <section id="operations" className="px-6 py-24 max-w-7xl mx-auto border-b border-gray-800">
      <h2 className="text-5xl font-bold tracking-tight uppercase mb-16 text-center">OPERATIONAL DOCTRINE</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border border-white/20 p-8 hover:border-white/40 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 border-l-2 border-white flex-shrink-0 mt-1"></div>
            <div>
              <h3 className="text-xl font-bold uppercase tracking-wide mb-4">SITUATIONAL AWARENESS</h3>
              <p className="text-gray-400 text-base leading-relaxed">
                Maintain complete visibility of operational environment and resource status at all times. Continuous
                monitoring ensures tactical advantage and informed decision-making capabilities.
              </p>
            </div>
          </div>
        </div>

        <div className="border border-white/20 p-8 hover:border-white/40 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 border-l-2 border-white flex-shrink-0 mt-1"></div>
            <div>
              <h3 className="text-xl font-bold uppercase tracking-wide mb-4">MISSION ACCOUNTABILITY</h3>
              <p className="text-gray-400 text-base leading-relaxed">
                Track mission progress with precision. Every objective measured, every outcome documented. Systematic
                approach to operational excellence and strategic goal achievement.
              </p>
            </div>
          </div>
        </div>

        <div className="border border-white/20 p-8 hover:border-white/40 transition-colors md:col-span-2">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 border-l-2 border-white flex-shrink-0 mt-1"></div>
            <div>
              <h3 className="text-xl font-bold uppercase tracking-wide mb-4">ADAPTIVE EXECUTION</h3>
              <p className="text-gray-400 text-base leading-relaxed">
                Respond to changing conditions while maintaining strategic objectives. Flexible tactics with unwavering
                commitment to mission success and operational integrity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
