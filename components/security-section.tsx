import PlatformRow from "./platform-row"

export default function SecuritySection() {
  return (
    <section id="security" className="px-6 py-24 max-w-7xl mx-auto border-b border-gray-800">
      <h2 className="text-5xl font-bold tracking-tight uppercase mb-16 text-center">SECURITY INFRASTRUCTURE</h2>

      <div className="space-y-0">
        <PlatformRow
          title="ZERO TRUST ARCHITECTURE"
          description="Multi-factor authentication with biometric verification and continuous validation"
          actionText="Explore Security"
        />

        <PlatformRow
          title="QUANTUM ENCRYPTION"
          description="End-to-end encryption for all communications and data storage systems"
          actionText="Explore Encryption"
        />
      </div>
    </section>
  )
}
