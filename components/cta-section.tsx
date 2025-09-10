import { Button } from "@/components/ui/button"

export default function CTASection() {
  return (
    <section id="metrics" className="px-6 py-32 text-center">
      <h2 className="text-6xl font-bold tracking-tight uppercase mb-4">AWARENESS.</h2>
      <h2 className="text-6xl font-bold tracking-tight uppercase mb-4">ACCOUNTABILITY.</h2>
      <h2 className="text-6xl font-bold tracking-tight uppercase mb-12">ADAPTABILITY.</h2>
      <Button className="bg-white hover:bg-gray-200 text-black px-16 py-6 text-xl font-bold uppercase tracking-wide border border-gray-400">
        DEPLOY SENTINEL
      </Button>
    </section>
  )
}
