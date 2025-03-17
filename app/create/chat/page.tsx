"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Send, Play, Pause, SkipBack, SkipForward, Heart } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface GeneratedSong {
  title: string
  lyrics: string
  coverUrl: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSong, setGeneratedSong] = useState<GeneratedSong | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState("00:00")
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

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

  // Simulate loading the initial prompt from localStorage
  useEffect(() => {
    const savedPrompt = localStorage.getItem("musicPrompt")
    if (savedPrompt) {
      const initialMessages: Message[] = [{ role: "user", content: savedPrompt }]
      setMessages(initialMessages)
      simulateResponse(savedPrompt)
    } else {
      router.push("/create")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [])

  const simulateResponse = (userMessage: string) => {
    setIsGenerating(true)

    // Simulate AI thinking time
    setTimeout(() => {
      // Generate a response based on the theme in the user message
      const theme = userMessage.toLowerCase().includes("solana")
        ? "Solana"
        : userMessage.toLowerCase().includes("blockchain")
          ? "Blockchain"
          : "Crypto"

      const lyrics = generateLyrics(theme)
      const title = generateTitle(theme)

      // Add AI response to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Here's a ${theme.toLowerCase()} themed song I created for you. You can play it using the player on the right.`,
        },
      ])

      // Set the generated song
      setGeneratedSong({
        title,
        lyrics,
        coverUrl: "/placeholder.svg?height=400&width=400",
      })

      setIsGenerating(false)
    }, 2000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isGenerating) {
      const newMessage: Message = { role: "user", content: input }
      setMessages((prev) => [...prev, newMessage])
      setInput("")
      simulateResponse(input)
    }
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

  const startProgressTimer = () => {
    progressInterval.current = setInterval(() => {
      if (!isDragging) {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval.current as NodeJS.Timeout)
            setIsPlaying(false)
            return 100
          }

          // Update time display (assuming a 3-minute song)
          const totalSeconds = 180
          const currentSeconds = Math.floor((prev / 100) * totalSeconds)
          setCurrentTime(formatTime(currentSeconds))

          return prev + 0.5
        })
      }
    }, 500)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // プログレスバーのクリック処理
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return

    const rect = progressBarRef.current.getBoundingClientRect()
    const clickPosition = e.clientX - rect.left
    const progressBarWidth = rect.width
    const newProgress = (clickPosition / progressBarWidth) * 100

    // 0-100の範囲に収める
    const clampedProgress = Math.max(0, Math.min(100, newProgress))
    setProgress(clampedProgress)

    // 時間表示を更新
    const totalSeconds = 180 // 3分の曲と仮定
    const currentSeconds = Math.floor((clampedProgress / 100) * totalSeconds)
    setCurrentTime(formatTime(currentSeconds))

    // 再生中でなければ再生を開始
    if (!isPlaying) {
      setIsPlaying(true)
      startProgressTimer()
    }
  }

  // ドラッグ開始
  const handleProgressBarDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    document.addEventListener("mousemove", handleProgressBarDragMove)
    document.addEventListener("mouseup", handleProgressBarDragEnd)
  }

  // ドラッグ中
  const handleProgressBarDragMove = (e: MouseEvent) => {
    if (!progressBarRef.current) return

    const rect = progressBarRef.current.getBoundingClientRect()
    const dragPosition = e.clientX - rect.left
    const progressBarWidth = rect.width
    const newProgress = (dragPosition / progressBarWidth) * 100

    // 0-100の範囲に収める
    const clampedProgress = Math.max(0, Math.min(100, newProgress))
    setProgress(clampedProgress)

    // 時間表示を更新
    const totalSeconds = 180 // 3分の曲と仮定
    const currentSeconds = Math.floor((clampedProgress / 100) * totalSeconds)
    setCurrentTime(formatTime(currentSeconds))
  }

  // ドラッグ終了
  const handleProgressBarDragEnd = () => {
    setIsDragging(false)
    document.removeEventListener("mousemove", handleProgressBarDragMove)
    document.removeEventListener("mouseup", handleProgressBarDragEnd)

    // 再生中でなければ再生を開始
    if (!isPlaying) {
      setIsPlaying(true)
      startProgressTimer()
    }
  }

  // タッチイベント（モバイル用）
  const handleProgressBarTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true)
    document.addEventListener("touchmove", handleProgressBarTouchMove, { passive: false })
    document.addEventListener("touchend", handleProgressBarTouchEnd)
  }

  const handleProgressBarTouchMove = (e: TouchEvent) => {
    e.preventDefault() // スクロールを防止
    if (!progressBarRef.current) return

    const rect = progressBarRef.current.getBoundingClientRect()
    const touchPosition = e.touches[0].clientX - rect.left
    const progressBarWidth = rect.width
    const newProgress = (touchPosition / progressBarWidth) * 100

    // 0-100の範囲に収める
    const clampedProgress = Math.max(0, Math.min(100, newProgress))
    setProgress(clampedProgress)

    // 時間表示を更新
    const totalSeconds = 180 // 3分の曲と仮定
    const currentSeconds = Math.floor((clampedProgress / 100) * totalSeconds)
    setCurrentTime(formatTime(currentSeconds))
  }

  const handleProgressBarTouchEnd = () => {
    setIsDragging(false)
    document.removeEventListener("touchmove", handleProgressBarTouchMove)
    document.removeEventListener("touchend", handleProgressBarTouchEnd)

    // 再生中でなければ再生を開始
    if (!isPlaying) {
      setIsPlaying(true)
      startProgressTimer()
    }
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div className="pb-20">
        {/* Chat Section */}
        <div className="border-b border-white/10 pb-4">
          <div className="p-4 space-y-4 max-h-[50vh] overflow-auto">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-xl p-3 ${
                    message.role === "user" ? "bg-[#d4af37] text-black" : "bg-[#2a1a3e] text-white"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-xl p-3 bg-[#2a1a3e] text-white">
                  <div className="flex space-x-2">
                    <div
                      className="w-2 h-2 rounded-full bg-white/60 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-white/60 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-white/60 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-white/10">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for changes or a new song..."
                className="flex-1 bg-[#2a1a3e] rounded-full py-2 px-4 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                disabled={isGenerating}
              />
              <button
                type="submit"
                className="bg-[#d4af37] p-2 rounded-full text-black disabled:opacity-50"
                disabled={!input.trim() || isGenerating}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Result Section */}
        <div>
          <div className="sticky top-0 z-10 flex justify-end p-4 bg-[#1a0a2e]/80 backdrop-blur-sm border-b border-white/10">
            <button className="bg-[#d4af37] text-black px-4 py-1 rounded-full text-sm font-medium">
              Release music & create coin
            </button>
          </div>

          {generatedSong ? (
            <div className="p-4 flex flex-col items-center">
              <div className="w-full max-w-md flex flex-col items-center">
                <div className="relative w-64 h-64 mb-6">
                  <Image
                    src={generatedSong.coverUrl || "/placeholder.svg"}
                    alt={generatedSong.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>

                <h2 className="text-2xl font-bold mb-2">{generatedSong.title}</h2>

                <div className="w-full bg-[#2a1a3e] rounded-lg p-4 mt-4 mb-8 max-h-[300px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans text-white/90">{generatedSong.lyrics}</pre>
                </div>

                {/* Music Player - スクリーンショットに合わせたデザイン */}
                <div className="w-full bg-[#2a1a3e] rounded-lg p-6 mt-auto mb-4">
                  <div className="flex justify-center items-center gap-10 mb-6">
                    <button className="text-white/80 hover:text-white">
                      <SkipBack className="w-7 h-7" />
                    </button>
                    <button
                      className="bg-white rounded-full w-16 h-16 flex items-center justify-center text-[#1a0a2e]"
                      onClick={togglePlay}
                    >
                      {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                    </button>
                    <button className="text-white/80 hover:text-white">
                      <SkipForward className="w-7 h-7" />
                    </button>
                  </div>

                  <div className="w-full flex items-center gap-3 mb-6">
                    <span className="text-sm text-white/90 font-medium">{currentTime}</span>
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
                          className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white transform scale-0 group-hover:scale-100 ${isDragging ? "scale-100" : ""} transition-transform`}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm text-white/90 font-medium">03:00</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-6">
                      <button className="p-2 rounded-full hover:bg-white/10">
                        <svg viewBox="0 0 24 24" className="w-6 h-6">
                          <path
                            fill="currentColor"
                            d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V5.25c-.25-.2-.4-.32-.4-.32A4.38 4.38 0 0 0 9.91 8.5c0 1.18.39 2.37 1.17 3.3 1.21 1.44 2.75 2.15 4.51 2.15 1.62 0 3.23-.67 4.42-1.87 1.18-1.21 1.78-2.79 1.78-4.57 0-1.19-.4-2.38-1.19-3.3-.4-.4-.79-.71-1.18-.91-.39-.2-.58-.3-.58-.3"
                          />
                        </svg>
                      </button>
                      <button className="p-2 rounded-full hover:bg-white/10">
                        <svg viewBox="0 0 24 24" className="w-6 h-6">
                          <path
                            fill="currentColor"
                            d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23Z"
                          />
                        </svg>
                      </button>
                    </div>
                    <button className="p-2 rounded-full hover:bg-white/10">
                      <Heart className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-20 flex items-center justify-center">
              <p className="text-white/60">Generating your song...</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Desktop layout
  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Chat Section */}
      <div className="w-full md:w-1/2 h-full flex flex-col">
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-xl p-3 ${
                  message.role === "user" ? "bg-[#d4af37] text-black" : "bg-[#2a1a3e] text-white"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-xl p-3 bg-[#2a1a3e] text-white">
                <div className="flex space-x-2">
                  <div
                    className="w-2 h-2 rounded-full bg-white/60 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-white/60 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-white/60 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-white/10">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for changes or a new song..."
              className="flex-1 bg-[#2a1a3e] rounded-full py-2 px-4 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
              disabled={isGenerating}
            />
            <button
              type="submit"
              className="bg-[#d4af37] p-2 rounded-full text-black disabled:opacity-50"
              disabled={!input.trim() || isGenerating}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Result Section */}
      <div className="w-full md:w-1/2 h-full border-l border-white/10 flex flex-col">
        <div className="sticky top-0 z-10 flex justify-end p-4 bg-[#1a0a2e]/80 backdrop-blur-sm border-b border-white/10">
          <button className="bg-[#d4af37] text-black px-4 py-1 rounded-full text-sm font-medium">
            Release music & create coin
          </button>
        </div>

        {generatedSong ? (
          <div className="flex-1 overflow-auto p-4 flex flex-col items-center">
            <div className="w-full max-w-md flex flex-col items-center">
              <div className="relative w-64 h-64 mb-6">
                <Image
                  src={generatedSong.coverUrl || "/placeholder.svg"}
                  alt={generatedSong.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>

              <h2 className="text-2xl font-bold mb-2">{generatedSong.title}</h2>

              <div className="w-full bg-[#2a1a3e] rounded-lg p-4 mt-4 mb-8 max-h-[300px] overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-white/90">{generatedSong.lyrics}</pre>
              </div>

              {/* Music Player - スクリーンショットに合わせたデザイン */}
              <div className="w-full bg-[#2a1a3e] rounded-lg p-6 mt-auto">
                <div className="flex justify-center items-center gap-10 mb-6">
                  <button className="text-white/80 hover:text-white">
                    <SkipBack className="w-7 h-7" />
                  </button>
                  <button
                    className="bg-white rounded-full w-16 h-16 flex items-center justify-center text-[#1a0a2e]"
                    onClick={togglePlay}
                  >
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                  </button>
                  <button className="text-white/80 hover:text-white">
                    <SkipForward className="w-7 h-7" />
                  </button>
                </div>

                <div className="w-full flex items-center gap-3 mb-6">
                  <span className="text-sm text-white/90 font-medium">{currentTime}</span>
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
                        className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white transform scale-0 group-hover:scale-100 ${isDragging ? "scale-100" : ""} transition-transform`}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-white/90 font-medium">03:00</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <button className="p-2 rounded-full hover:bg-white/10">
                      <svg viewBox="0 0 24 24" className="w-6 h-6">
                        <path
                          fill="currentColor"
                          d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V5.25c-.25-.2-.4-.32-.4-.32A4.38 4.38 0 0 0 9.91 8.5c0 1.18.39 2.37 1.17 3.3 1.21 1.44 2.75 2.15 4.51 2.15 1.62 0 3.23-.67 4.42-1.87 1.18-1.21 1.78-2.79 1.78-4.57 0-1.19-.4-2.38-1.19-3.3-.4-.4-.79-.71-1.18-.91-.39-.2-.58-.3-.58-.3"
                        />
                      </svg>
                    </button>
                    <button className="p-2 rounded-full hover:bg-white/10">
                      <svg viewBox="0 0 24 24" className="w-6 h-6">
                        <path
                          fill="currentColor"
                          d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23Z"
                        />
                      </svg>
                    </button>
                  </div>
                  <button className="p-2 rounded-full hover:bg-white/10">
                    <Heart className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/60">Generating your song...</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper functions to generate sample content
function generateTitle(theme: string): string {
  const titles = [
    `${theme} Dreams`,
    `Digital ${theme}`,
    `${theme} Nights`,
    `Romantic ${theme}`,
    `${theme} Future`,
    `${theme} Moonlight`,
  ]
  return titles[Math.floor(Math.random() * titles.length)]
}

function generateLyrics(theme: string): string {
  if (theme.toLowerCase() === "solana") {
    return `(Verse 1) Underneath the neon skies,
Your eyes shimmer in blockchain dreams.
Holding hands beneath starlight,
Together building brand-new schemes.

A thousand stars could never match,
The glow we find in digital streams.
Whispers shared in crypto nights,
You're my moonbeam in Solana's lights.

(Chorus) We love Solana, Dancing close,
Hearts align. Every token shared,
Your heart closer to mine.

(Verse 2) We love Solana, In your eyes,
Futures bright. Trading dreams,
Making love, Till the morning light.

(Bridge) In this decentralized romance,
We find our truth, we take our chance.
No validators needed for this love,
Just you and me, and stars above.

(Chorus) We love Solana, Dancing close,
Hearts align. Every token shared,
Your heart closer to mine.`
  } else {
    return `(Verse 1) Digital pathways leading to you,
${theme} dreams coming into view.
Every transaction sealed with trust,
In this network, our love's a must.

(Chorus) ${theme} nights, holding you tight,
Our love secured by cryptographic light.
No central power can break our bond,
Of this connection, I am fond.

(Verse 2) Decentralized hearts beating as one,
Our journey together has just begun.
Mining moments of pure delight,
Staking our future, it feels so right.

(Bridge) No need for third parties in between,
Our love is private, yet to be seen.
Peer to peer, heart to heart,
A perfect match right from the start.

(Chorus) ${theme} nights, holding you tight,
Our love secured by cryptographic light.
No central power can break our bond,
Of this connection, I am fond.`
  }
}

