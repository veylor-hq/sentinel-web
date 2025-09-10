"use client"

import { ArrowRight } from "lucide-react"

interface PlatformRowProps {
  title: string
  description: string
  actionText: string
  href?: string
  onClick?: () => void
}

export default function PlatformRow({ title, description, actionText, href, onClick }: PlatformRowProps) {
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (href) {
      window.open(href, "_blank")
    }
  }

  return (
    <div className="border-t border-gray-800 pt-8 hover:bg-gray-950/30 transition-colors group">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0">
        {/* Title Section - Fixed width on desktop for alignment */}
        <div className="flex items-center space-x-4 md:w-80 md:flex-shrink-0">
          <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform flex-shrink-0" />
          <h3 className="text-lg md:text-xl font-bold uppercase tracking-wide">{title}</h3>
        </div>

        {/* Description Section - Takes remaining space */}
        <div className="flex-1 pl-9 md:pl-8">
          <p className="text-gray-400 text-sm md:text-base">{description}</p>
        </div>

        {/* Action Section - Right aligned on desktop */}
        <div
          className="text-gray-500 hover:text-white transition-colors cursor-pointer pl-9 md:pl-8 md:flex-shrink-0"
          onClick={handleClick}
        >
          <span className="text-xs md:text-sm uppercase tracking-wider">{actionText}</span>
          <ArrowRight className="w-4 h-4 inline ml-2" />
        </div>
      </div>
    </div>
  )
}
