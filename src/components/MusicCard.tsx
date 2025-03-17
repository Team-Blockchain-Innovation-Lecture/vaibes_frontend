/* eslint-disable @typescript-eslint/no-explicit-any */
import { Heart, Play } from "lucide-react"
import Image from "next/image"

interface MusicCardProps {
    title: string
    artist: string
    coverUrl: string
    plays: number
    likes: number
    marketCap: string
    duration?: string
    isCarousel?: boolean
    onPlayTrack?: (track: any) => void
  }
  
  export function MusicCard({
    title,
    artist,
    coverUrl,
    plays,
    likes,
    marketCap,
    duration = "02:23",
    isCarousel = false,
    onPlayTrack,
  }: MusicCardProps) {
    const handlePlay = () => {
      if (onPlayTrack) {
        onPlayTrack({
          id: Math.random(), // Just for demo
          title,
          artist,
          coverUrl,
          plays,
          likes,
          marketCap,
          duration,
        })
      }
    }
  
    return (
      <div className={`group ${isCarousel ? "w-[250px] flex-shrink-0" : "w-full"}`}>
        <div className="relative aspect-square rounded-lg overflow-hidden mb-2 cursor-pointer" onClick={handlePlay}>
          <Image src={coverUrl || "/placeholder.svg"} alt={title} fill className="object-cover" />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-6 h-6 fill-white text-white" />
            </button>
          </div>
          <button
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/30 backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation()
              // Handle like functionality
            }}
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>
        <h3 className="font-medium text-sm truncate">{title}</h3>
        <p className="text-xs text-white/70 truncate">By: {artist}</p>
  
        {!isCarousel && (
          <div className="flex items-center gap-3 mt-1 text-xs text-white/60">
            <div className="flex items-center gap-1">
              <Play className="w-3.5 h-3.5" />
              <span>{plays}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" />
              <span>{likes}</span>
            </div>
            <div>
              <span>Market Cap ${marketCap}</span>
            </div>
          </div>
        )}
      </div>
    )
  }