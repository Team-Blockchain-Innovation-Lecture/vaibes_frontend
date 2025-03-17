"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Heart, Play, Pause, SkipBack, SkipForward } from "lucide-react"
import Image from "next/image"

interface MusicPlayerProps {
  isVisible: boolean
  currentTrack: {
    id: number | string
    title: string
    artist: string
    coverUrl: string
    duration: string
    plays: number
    likes: number
    marketCap: string
  } | null
  onClose: () => void
}

export function MusicPlayer({ isVisible, currentTrack, onClose }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState("00:00")
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentTrack) {
      setIsPlaying(true)
      // Reset progress when track changes
      setCurrentTime("00:00")
      setProgress(0)

      // Simulate audio playing
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }

      startProgressTimer()
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [currentTrack])

  const startProgressTimer = () => {
    if (!currentTrack) return

    progressInterval.current = setInterval(() => {
      if (!isDragging) {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval.current as NodeJS.Timeout)
            setIsPlaying(false)
            return 100
          }
          // Update time display
          const totalSeconds = convertTimeToSeconds(currentTrack.duration)
          const currentSeconds = Math.floor((prev / 100) * totalSeconds)
          setCurrentTime(formatTime(currentSeconds))
          return prev + 0.5
        })
      }
    }, 500)
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)

    if (isPlaying) {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    } else {
      startProgressTimer()
    }
  }

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !currentTrack) return

    const rect = progressBarRef.current.getBoundingClientRect()
    const clickPosition = e.clientX - rect.left
    const progressBarWidth = rect.width
    const newProgress = (clickPosition / progressBarWidth) * 100

    // Ensure progress is between 0 and 100
    const clampedProgress = Math.max(0, Math.min(100, newProgress))
    setProgress(clampedProgress)

    // Update time display
    const totalSeconds = convertTimeToSeconds(currentTrack.duration)
    const currentSeconds = Math.floor((clampedProgress / 100) * totalSeconds)
    setCurrentTime(formatTime(currentSeconds))

    // If not playing, start playing
    if (!isPlaying) {
      setIsPlaying(true)
      startProgressTimer()
    }
  }

  const handleProgressBarDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    document.addEventListener("mousemove", handleProgressBarDragMove)
    document.addEventListener("mouseup", handleProgressBarDragEnd)
  }

  const handleProgressBarDragMove = (e: MouseEvent) => {
    if (!progressBarRef.current || !currentTrack) return

    const rect = progressBarRef.current.getBoundingClientRect()
    const dragPosition = e.clientX - rect.left
    const progressBarWidth = rect.width
    const newProgress = (dragPosition / progressBarWidth) * 100

    // Ensure progress is between 0 and 100
    const clampedProgress = Math.max(0, Math.min(100, newProgress))
    setProgress(clampedProgress)

    // Update time display
    const totalSeconds = convertTimeToSeconds(currentTrack.duration)
    const currentSeconds = Math.floor((clampedProgress / 100) * totalSeconds)
    setCurrentTime(formatTime(currentSeconds))
  }

  const handleProgressBarDragEnd = () => {
    setIsDragging(false)
    document.removeEventListener("mousemove", handleProgressBarDragMove)
    document.removeEventListener("mouseup", handleProgressBarDragEnd)

    // If not playing, start playing
    if (!isPlaying) {
      setIsPlaying(true)
      startProgressTimer()
    }
  }

  // Touch event handlers for mobile
  const handleProgressBarTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true)
    document.addEventListener("touchmove", handleProgressBarTouchMove, { passive: false })
    document.addEventListener("touchend", handleProgressBarTouchEnd)
  }

  const handleProgressBarTouchMove = (e: TouchEvent) => {
    e.preventDefault() // Prevent scrolling while dragging
    if (!progressBarRef.current || !currentTrack) return

    const rect = progressBarRef.current.getBoundingClientRect()
    const touchPosition = e.touches[0].clientX - rect.left
    const progressBarWidth = rect.width
    const newProgress = (touchPosition / progressBarWidth) * 100

    // Ensure progress is between 0 and 100
    const clampedProgress = Math.max(0, Math.min(100, newProgress))
    setProgress(clampedProgress)

    // Update time display
    const totalSeconds = convertTimeToSeconds(currentTrack.duration)
    const currentSeconds = Math.floor((clampedProgress / 100) * totalSeconds)
    setCurrentTime(formatTime(currentSeconds))
  }

  const handleProgressBarTouchEnd = () => {
    setIsDragging(false)
    document.removeEventListener("touchmove", handleProgressBarTouchMove)
    document.removeEventListener("touchend", handleProgressBarTouchEnd)

    // If not playing, start playing
    if (!isPlaying) {
      setIsPlaying(true)
      startProgressTimer()
    }
  }

  const convertTimeToSeconds = (timeString: string) => {
    const [minutes, seconds] = timeString.split(":").map(Number)
    return minutes * 60 + seconds
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (!isVisible || !currentTrack) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1a0a2e] border-t border-white/10 z-50 px-4 py-3 backdrop-blur-lg bg-opacity-95">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center gap-3">
        {/* Track Info - Always visible */}
        <div className="flex items-center gap-3 min-w-0 order-1">
          <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
            <Image
              src={currentTrack.coverUrl || "/placeholder.svg"}
              alt={currentTrack.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-sm truncate">{currentTrack.title}</h4>
            <p className="text-xs text-white/70 truncate">By: {currentTrack.artist}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-white/70">
              <div className="flex items-center gap-1">
                <Play className="w-3 h-3" />
                <span>{currentTrack.plays}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{currentTrack.likes}</span>
              </div>
              <div>
                <span>Market Cap ${currentTrack.marketCap}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex-1 flex flex-col items-center justify-center order-3 md:order-2">
          <div className="flex items-center gap-4 md:gap-8">
            <button className="text-white/80 hover:text-white">
              <SkipBack className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            <button
              className="bg-white rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-[#1a0a2e]"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 md:w-8 md:h-8" />
              ) : (
                <Play className="w-6 h-6 md:w-8 md:h-8 ml-1" />
              )}
            </button>
            <button className="text-white/80 hover:text-white">
              <SkipForward className="w-6 h-6 md:w-8 md:h-8" />
            </button>
          </div>

          <div className="w-full flex items-center gap-3 mt-2">
            <span className="text-xs text-white/80">{currentTime}</span>
            <div
              ref={progressBarRef}
              className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden cursor-pointer group"
              onClick={handleProgressBarClick}
              onMouseDown={handleProgressBarDragStart}
              onTouchStart={handleProgressBarTouchStart}
            >
              <div
                className={`h-full ${isDragging ? "bg-[#f4cf37]" : "bg-[#d4af37]"} relative`}
                style={{ width: `${progress}%` }}
              >
                <div
                  className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white transform scale-0 group-hover:scale-100 ${isDragging ? "scale-100" : ""} transition-transform`}
                ></div>
              </div>
            </div>
            <span className="text-xs text-white/80">{currentTrack.duration}</span>
          </div>
        </div>

        {/* Social Buttons - Always visible */}
        <div className="flex items-center justify-end gap-3 order-2 md:order-3">
          <button className="p-2 rounded-full hover:bg-white/10">
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path
                fill="currentColor"
                d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V5.25c-.25-.2-.4-.32-.4-.32A4.38 4.38 0 0 0 9.91 8.5c0 1.18.39 2.37 1.17 3.3 1.21 1.44 2.75 2.15 4.51 2.15 1.62 0 3.23-.67 4.42-1.87 1.18-1.21 1.78-2.79 1.78-4.57 0-1.19-.4-2.38-1.19-3.3-.4-.4-.79-.71-1.18-.91-.39-.2-.58-.3-.58-.3"
              />
            </svg>
          </button>
          <button className="p-2 rounded-full hover:bg-white/10">
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path
                fill="currentColor"
                d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02Z"
              />
            </svg>
          </button>
          <button className="p-2 rounded-full hover:bg-white/10">
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path
                fill="currentColor"
                d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23Z"
              />
            </svg>
          </button>
          <button className="p-2 rounded-full hover:bg-white/10">
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

