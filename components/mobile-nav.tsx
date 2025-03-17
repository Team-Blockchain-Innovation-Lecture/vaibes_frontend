"use client"

import { Home, Menu, Music, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 rounded-full bg-[#2a1a3e] text-white shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 md:hidden">
          <div className="h-full w-64 bg-[#150823] p-4">
            <div className="flex justify-between items-center mb-8">
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
                vaibes.fun
              </span>
              <button onClick={() => setIsOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="space-y-2">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
                onClick={() => setIsOpen(false)}
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>
              <Link
                href="/create"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
                onClick={() => setIsOpen(false)}
              >
                <Music className="w-5 h-5" />
                <span>Create</span>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

