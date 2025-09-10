"use client"

import { motion } from "framer-motion"
import { FileText, Calendar, GitBranch } from "lucide-react"

export default function BlogHeroSection() {
  return (
    <section id="overview" className="px-6 py-24 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight uppercase">
          RELEASE
          <br />
          ARCHIVE
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
          Comprehensive documentation of system updates, feature deployments, and operational enhancements. Track every
          modification to maintain situational awareness.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <FileText className="w-12 h-12 mx-auto mb-4 text-white" />
            <h3 className="text-lg font-semibold mb-2 uppercase tracking-wide">RELEASE NOTES</h3>
            <p className="text-gray-400 text-sm">Detailed documentation of all system modifications</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center"
          >
            <Calendar className="w-12 h-12 mx-auto mb-4 text-white" />
            <h3 className="text-lg font-semibold mb-2 uppercase tracking-wide">DEPLOYMENT TIMELINE</h3>
            <p className="text-gray-400 text-sm">Chronological record of all operational updates</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center"
          >
            <GitBranch className="w-12 h-12 mx-auto mb-4 text-white" />
            <h3 className="text-lg font-semibold mb-2 uppercase tracking-wide">VERSION CONTROL</h3>
            <p className="text-gray-400 text-sm">Complete audit trail of system evolution</p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
