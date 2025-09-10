"use client"

import { motion } from "framer-motion"

export default function VersionHistorySection() {
  const versions = [
    { version: "v2.4.1", date: "Jan 15, 2024", status: "Current" },
    { version: "v2.4.0", date: "Jan 08, 2024", status: "Stable" },
    { version: "v2.3.2", date: "Jan 02, 2024", status: "Legacy" },
    { version: "v2.3.1", date: "Dec 18, 2023", status: "Legacy" },
    { version: "v2.3.0", date: "Dec 10, 2023", status: "Legacy" },
    { version: "v2.2.4", date: "Nov 28, 2023", status: "Deprecated" },
  ]

  return (
    <section id="versions" className="px-6 py-24 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <h2 className="text-4xl md:text-5xl font-bold mb-16 uppercase tracking-tight">VERSION HISTORY</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {versions.map((version, index) => (
            <motion.div
              key={version.version}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="border border-gray-800 p-6 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold uppercase tracking-wide">{version.version}</h3>
                <span
                  className={`px-2 py-1 text-xs font-semibold uppercase tracking-wide ${
                    version.status === "Current"
                      ? "bg-green-900 text-green-200"
                      : version.status === "Stable"
                        ? "bg-blue-900 text-blue-200"
                        : version.status === "Legacy"
                          ? "bg-gray-800 text-gray-300"
                          : "bg-red-900 text-red-200"
                  }`}
                >
                  {version.status}
                </span>
              </div>
              <p className="text-gray-400 text-sm">{version.date}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
