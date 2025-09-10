"use client"

import { motion } from "framer-motion"
import PlatformRow from "./platform-row"

export default function DocumentationSection() {
  const docItems = [
    {
      title: "API DOCUMENTATION",
      description: "Complete reference for system integration and endpoint specifications",
      action: "ACCESS DOCS",
    },
    {
      title: "MIGRATION GUIDES",
      description: "Step-by-step procedures for version upgrades and system transitions",
      action: "VIEW GUIDES",
    },
    {
      title: "TECHNICAL SPECIFICATIONS",
      description: "Detailed system requirements and architectural documentation",
      action: "VIEW SPECS",
    },
  ]

  return (
    <section id="documentation" className="px-6 py-24 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <h2 className="text-4xl md:text-5xl font-bold mb-16 uppercase tracking-tight">DOCUMENTATION</h2>

        <div className="space-y-0">
          {docItems.map((item, index) => (
            <PlatformRow key={index} title={item.title} description={item.description} action={item.action} />
          ))}
        </div>
      </motion.div>
    </section>
  )
}
