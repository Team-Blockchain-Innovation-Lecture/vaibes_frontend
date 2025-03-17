"use client"

import { useState } from "react"
import { Sidebar } from "@/components/Sidebar"
import { MusicCreator } from "@/components/MusicCreator"
import { MusicCarousel } from "@/components/MusicCarousel"
import { MusicGrid } from "@/components/MusicGrid"
import { ConnectWalletButton } from "@/components/ConnectWalletButton"
import { MusicPlayer } from "@/components/MusicPlayer"
import { MobileNav } from "@/components/MobileNav"

interface Track {
  id: number
  title: string
  artist: string
  coverUrl: string
  plays: number
  likes: number
  marketCap: string
  duration: string
}

export default function HomePage() {
  const [playerVisible, setPlayerVisible] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)

  const handlePlayTrack = (track: Track) => {
    setCurrentTrack(track)
    setPlayerVisible(true)
  }

  return (
    <div className="flex min-h-screen bg-[#1a0a2e] text-white">
      <Sidebar />
      <main className="flex-1 overflow-auto pb-32">
        <div className="sticky top-0 z-10 flex justify-end p-4 md:p-6 bg-[#1a0a2e]/80 backdrop-blur-sm">
          <ConnectWalletButton />
        </div>
        <div className="px-4 md:px-6 space-y-8 md:space-y-12 max-w-7xl mx-auto">
          <MusicCreator />

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl md:text-3xl font-bold">Trending</h2>
              <div className="flex gap-2">
                <button className="p-2 rounded-full bg-[#2a1a3e] hover:bg-[#3a2a4e]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <path d="m15 18-6-6 6-6"></path>
                  </svg>
                </button>
                <button className="p-2 rounded-full bg-[#2a1a3e] hover:bg-[#3a2a4e]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <path d="m9 18 6-6-6-6"></path>
                  </svg>
                </button>
              </div>
            </div>
            <MusicCarousel onPlayTrack={handlePlayTrack} />
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl md:text-3xl font-bold">Top Market Cap</h2>
              <button className="text-sm font-medium text-[#d4af37]">More</button>
            </div>
            <MusicGrid onPlayTrack={handlePlayTrack} />
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl md:text-3xl font-bold">Hip-Hop</h2>
              <button className="text-sm font-medium text-[#d4af37]">More</button>
            </div>
            <MusicGrid onPlayTrack={handlePlayTrack} />
          </section>
        </div>

        <MusicPlayer isVisible={playerVisible} currentTrack={currentTrack} onClose={() => setPlayerVisible(false)} />
        <MobileNav />
      </main>
    </div>
  )
}
