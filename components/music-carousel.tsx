"use client"

import { useState, useRef } from "react"
import { MusicCard } from "@/components/music-card"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MusicCarouselProps {
  onPlayTrack: (track: any) => void
}

export function MusicCarousel({ onPlayTrack }: MusicCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  // Sample data
  const trendingMusic = [
    {
      id: 1,
      title: "Mary, Mary",
      artist: "H7g_Fx5",
      coverUrl: "/placeholder.svg?height=250&width=250",
      plays: 839,
      likes: 839,
      marketCap: "5.7K",
      duration: "02:45",
    },
    {
      id: 2,
      title: "A Good Heart",
      artist: "H7g_Fx5",
      coverUrl: "/placeholder.svg?height=250&width=250",
      plays: 839,
      likes: 839,
      marketCap: "5.7K",
      duration: "02:23",
    },
    {
      id: 3,
      title: "Azucena",
      artist: "H7g_Fx5",
      coverUrl: "/placeholder.svg?height=250&width=250",
      plays: 839,
      likes: 839,
      marketCap: "5.7K",
      duration: "03:12",
    },
    {
      id: 4,
      title: "Shadow in the Shadows",
      artist: "H7g_Fx5",
      coverUrl: "/placeholder.svg?height=250&width=250",
      plays: 839,
      likes: 839,
      marketCap: "5.7K",
      duration: "01:59",
    },
    {
      id: 5,
      title: "Black Skull Mask",
      artist: "H7g_Fx5",
      coverUrl: "/placeholder.svg?height=250&width=250",
      plays: 839,
      likes: 839,
      marketCap: "5.7K",
      duration: "02:37",
    },
    {
      id: 6,
      title: "The Floor Is Lava",
      artist: "H7g_Fx5",
      coverUrl: "/placeholder.svg?height=250&width=250",
      plays: 839,
      likes: 839,
      marketCap: "5.7K",
      duration: "03:05",
    },
    {
      id: 7,
      title: "Hate You Like I Love You",
      artist: "H7g_Fx5",
      coverUrl: "/placeholder.svg?height=250&width=250",
      plays: 839,
      likes: 839,
      marketCap: "5.7K",
      duration: "02:18",
    },
    {
      id: 8,
      title: "mistake",
      artist: "H7g_Fx5",
      coverUrl: "/placeholder.svg?height=250&width=250",
      plays: 839,
      likes: 839,
      marketCap: "5.7K",
      duration: "01:45",
    },
  ]

  // スクロール処理
  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const scrollAmount = direction === "left" ? -600 : 600

    container.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    })
  }

  // スクロール位置の監視
  const handleScrollEvent = () => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const isAtStart = container.scrollLeft <= 10
    const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10

    setShowLeftArrow(!isAtStart)
    setShowRightArrow(!isAtEnd)
  }

  return (
    <div className="relative">
      {/* 左スクロールボタン */}
      {showLeftArrow && (
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-[#2a1a3e] hover:bg-[#3a2a4e] shadow-lg"
          onClick={() => handleScroll("left")}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* カルーセル */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide"
        onScroll={handleScrollEvent}
      >
        <div className="flex gap-4">
          {trendingMusic.map((music) => (
            <MusicCard
              key={music.id}
              id={music.id}
              title={music.title}
              artist={music.artist}
              coverUrl={music.coverUrl}
              plays={music.plays}
              likes={music.likes}
              marketCap={music.marketCap}
              duration={music.duration}
              isCarousel={true}
              onPlayTrack={onPlayTrack}
            />
          ))}
        </div>
      </div>

      {/* 右スクロールボタン */}
      {showRightArrow && (
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-[#2a1a3e] hover:bg-[#3a2a4e] shadow-lg"
          onClick={() => handleScroll("right")}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}

