"use client"

import { motion } from "framer-motion"
import { Calendar, ArrowRight } from "lucide-react"

export default function LatestReleasesSection() {
  const releases = [
    {
      version: "v2.4.1",
      date: "2024-01-15",
      title: "CRITICAL SECURITY PATCH",
      description: "Enhanced encryption protocols and vulnerability mitigation for operational security.",
      type: "Security Update",
      priority: "Critical",
    },
    {
      version: "v2.4.0",
      date: "2024-01-08",
      title: "ADVANCED ANALYTICS MODULE",
      description: "New predictive modeling capabilities and real-time threat assessment integration.",
      type: "Feature Release",
      priority: "Major",
    },
    {
      version: "v2.3.2",
      date: "2024-01-02",
      title: "PERFORMANCE OPTIMIZATION",
      description: "System-wide performance improvements and resource allocation enhancements.",
      type: "Performance",
      priority: "Minor",
    },
  ]

  return (
    <section id="releases" className="px-6 py-24 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <h2 className="text-4xl md:text-5xl font-bold mb-16 uppercase tracking-tight">LATEST RELEASES</h2>

        <div className="space-y-8">
          {releases.map((release, index) => (
            <motion.div
              key={release.version}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="border border-gray-800 p-8 hover:border-gray-600 transition-colors group cursor-pointer"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-2xl font-bold text-white">{release.version}</span>
                    <span
                      className={`px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                        release.priority === "Critical"
                          ? "bg-red-900 text-red-200"
                          : release.priority === "Major"
                            ? "bg-yellow-900 text-yellow-200"
                            : "bg-gray-800 text-gray-300"
                      }`}
                    >
                      {release.priority}
                    </span>
                    <span className="px-3 py-1 bg-gray-800 text-gray-300 text-xs font-semibold uppercase tracking-wide">
                      {release.type}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold mb-2 uppercase tracking-wide">{release.title}</h3>

                  <p className="text-gray-400 mb-4">{release.description}</p>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{release.date}</span>
                  </div>
                </div>

                <div className="flex items-center text-gray-400 group-hover:text-white transition-colors">
                  <span className="text-sm font-semibold uppercase tracking-wide mr-2">VIEW DETAILS</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
