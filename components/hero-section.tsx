"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

export default function HeroSection() {
  return (
    <section
      id="overview"
      className="relative flex flex-col items-center justify-center h-screen text-center px-6 border-b border-gray-800"
    >
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-4"
      >
        <div className="w-16 h-16 mx-auto mb-6 border border-gray-400 flex items-center justify-center">
          <Shield className="w-8 h-8 text-gray-300" />
        </div>
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-7xl md:text-9xl font-bold tracking-tighter uppercase"
      >
        SENTINEL
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="mt-8 text-xl md:text-2xl text-gray-300 max-w-3xl uppercase font-mono tracking-widest"
      >
        PERSONAL OPERATIONS PLATFORM
      </motion.p>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-12">
        <Button className="bg-white hover:bg-gray-200 text-black px-12 py-4 text-lg font-semibold uppercase tracking-wide border border-gray-400">
          DEPLOY SENTINEL
        </Button>
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-black" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent)]" />
    </section>
  )
}
