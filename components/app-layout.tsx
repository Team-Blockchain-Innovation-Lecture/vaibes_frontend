"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { WalletActionsButton } from "@/components/wallet-actions-button"
import { MusicPlayer } from "@/components/music-player"

interface Track {
  id: number | string
  title: string
  artist: string
  coverUrl: string
  plays: number
  likes: number
  marketCap: string
  duration: string
}

// Add type definition for window.playTrack
declare global {
  interface Window {
    playTrack: (track: Track) => void
  }
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [playerVisible, setPlayerVisible] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  // 音楽作成画面では音楽プレイヤーを表示しない
  const shouldShowMusicPlayer = pathname !== "/create/chat"

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const handlePlayTrack = (track: Track) => {
    setCurrentTrack(track)
    setPlayerVisible(true)
  }

  // Make the playTrack function available globally
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.playTrack = handlePlayTrack
    }
  }, [])

  // Different layout for mobile and desktop
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#1a0a2e] text-white">
        <div className="sticky top-0 z-10 flex justify-end gap-2 p-4 bg-[#1a0a2e]/80 backdrop-blur-sm border-b border-white/10">
          <WalletActionsButton />
          <ConnectWalletButton />
        </div>
        {children}
        {shouldShowMusicPlayer && (
          <MusicPlayer isVisible={playerVisible} currentTrack={currentTrack} onClose={() => setPlayerVisible(false)} />
        )}
        <MobileNav />
      </div>
    )
  }

  // Desktop layout
  return (
    <div className="flex min-h-screen bg-[#1a0a2e] text-white">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="sticky top-0 z-10 flex justify-end gap-2 p-4 md:p-6 bg-[#1a0a2e]/80 backdrop-blur-sm border-b border-white/10">
          <WalletActionsButton />
          <ConnectWalletButton />
        </div>
        <div className="flex-1 overflow-hidden">{children}</div>
        {shouldShowMusicPlayer && (
          <MusicPlayer isVisible={playerVisible} currentTrack={currentTrack} onClose={() => setPlayerVisible(false)} />
        )}
        <MobileNav />
      </main>
    </div>
  )
}

