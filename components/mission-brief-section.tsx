export default function MissionBriefSection() {
  return (
    <section id="intelligence" className="px-6 py-24 max-w-7xl mx-auto border-b border-gray-800">
      <div className="grid md:grid-cols-3 gap-16">
        <div className="md:col-span-1">
          <h2 className="text-4xl font-bold tracking-tight uppercase mb-6">MISSION BRIEF</h2>
          <div className="w-12 h-px bg-gray-400 mb-6"></div>
        </div>
        <div className="md:col-span-2">
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            Traditional planning systems fail under operational pressure. SENTINEL applies proven military doctrine —
            mission-based planning, adaptive execution, and comprehensive after-action review — to civilian operations.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed">
            This is not scheduling software. This is an operational command system for your personal domain.
          </p>
        </div>
      </div>
    </section>
  )
}
