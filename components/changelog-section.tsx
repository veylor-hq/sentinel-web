"use client"

import { motion } from "framer-motion"
import PlatformRow from "./platform-row"

export default function ChangelogSection() {
  const changelogItems = [
    {
      title: "SYSTEM ARCHITECTURE",
      description: "Complete rebuild of core infrastructure with enhanced scalability and fault tolerance",
      action: "VIEW CHANGES",
    },
    {
      title: "USER INTERFACE",
      description: "Streamlined command interface with improved tactical display and response times",
      action: "VIEW UPDATES",
    },
    {
      title: "SECURITY PROTOCOLS",
      description: "Implementation of zero-trust architecture and quantum-resistant encryption standards",
      action: "VIEW SECURITY",
    },
  ]

  return (
    <section id="changelog" className="px-6 py-24 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <h2 className="text-4xl md:text-5xl font-bold mb-16 uppercase tracking-tight">CHANGELOG</h2>

        <div className="space-y-0">
          {changelogItems.map((item, index) => (
            <PlatformRow key={index} title={item.title} description={item.description} action={item.action} />
          ))}
        </div>
      </motion.div>
    </section>
  )
}
