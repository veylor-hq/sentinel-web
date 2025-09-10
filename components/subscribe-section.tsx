"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Mail } from "lucide-react"

export default function SubscribeSection() {
  return (
    <section id="subscribe" className="px-6 py-24 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <Bell className="w-16 h-16 mx-auto mb-8 text-white" />
        <h2 className="text-4xl md:text-5xl font-bold mb-8 uppercase tracking-tight">STAY INFORMED</h2>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Receive immediate notifications for critical updates, security patches, and major releases. Maintain
          operational readiness through automated intelligence briefings.
        </p>

        <div className="max-w-md mx-auto">
          <div className="flex gap-4">
            <Input
              type="email"
              placeholder="ENTER EMAIL ADDRESS"
              className="bg-black border-gray-800 text-white placeholder:text-gray-500 uppercase tracking-wide text-sm"
            />
            <Button className="bg-white text-black hover:bg-gray-200 font-semibold uppercase tracking-wide px-8">
              <Mail className="w-4 h-4 mr-2" />
              SUBSCRIBE
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-4 uppercase tracking-wide">
            CLASSIFIED COMMUNICATIONS • SECURE DELIVERY
          </p>
        </div>
      </motion.div>
    </section>
  )
}
