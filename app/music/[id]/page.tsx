"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Heart, Play, Send, MessageCircle } from "lucide-react"

interface Comment {
  id: number
  username: string
  content: string
  timestamp: string
  likes: number
  isLiked?: boolean
}

interface MusicTrack {
  id: number | string
  title: string
  artist: string
  coverUrl: string
  plays: number
  likes: number
  marketCap: string
  duration: string
}

export default function MusicDetailPage() {
  const params = useParams()
  const [music, setMusic] = useState<MusicTrack | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

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

  // Fetch music data
  useEffect(() => {
    // In a real app, you would fetch the music data from an API
    // For now, we'll use mock data
    const mockMusic = {
      id: params.id,
      title: "Romantic Solana",
      artist: "H7g_Fx5",
      coverUrl: "/placeholder.svg?height=300&width=300",
      plays: 839,
      likes: 839,
      marketCap: "5.7K",
      duration: "02:42",
      lyrics: `(Verse 1) Underneath the neon skies, Your eyes shimmer
in blockchain dreams. Holding hands beneath starlight,
Together building brand-new schemes.
A thousand stars could never match, The glow we find in
digital streams. Whispers shared in crypto nights, You're
my moonbeam in Solana's lights.
(Chorus) We love Solana, Dancing close, hearts align.
Every token shared, Your heart closer to mine.
We love Solana, In your eyes, futures bright. Trading
dreams, making love, Till the morning light.
(Verse 2) On-chain whispers, secrets kept, Promises
minted, never swept. Through bear or bull, our love stays
true, My portfolio's rising, all thanks to you.
Transactions fast, our love secure, Proof of passion,
blockchain pure. DeFi dreams, just me and you, Forever
bonded, Solana blue.`,
    }

    setMusic(mockMusic)

    // Mock comments
    const mockComments = [
      {
        id: 1,
        username: "crypto_lover",
        content: "This song really captures the essence of blockchain romance!",
        timestamp: "2023/05/13 13:05",
        likes: 24,
        isLiked: false,
      },
      {
        id: 2,
        username: "solana_fan",
        content: "The lyrics are so creative. Love the blockchain references.",
        timestamp: "2023/05/13 17:21",
        likes: 18,
        isLiked: false,
      },
      {
        id: 3,
        username: "music_nft",
        content: "This is going to be huge on the marketplace!",
        timestamp: "2023/05/14 09:04",
        likes: 12,
        isLiked: false,
      },
      {
        id: 4,
        username: "defi_dreamer",
        content: "I can't stop listening to this. The melody is so catchy!",
        timestamp: "2023/05/15 14:30",
        likes: 9,
        isLiked: false,
      },
    ]

    setComments(mockComments)
  }, [params.id])

  // コメントいいね機能
  const handleCommentLike = (commentId: number) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          const newIsLiked = !comment.isLiked
          return {
            ...comment,
            likes: newIsLiked ? comment.likes + 1 : comment.likes - 1,
            isLiked: newIsLiked,
          }
        }
        return comment
      }),
    )
  }

  // 新しいコメント追加
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      const now = new Date()
      const timestamp = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

      const newCommentObj: Comment = {
        id: comments.length + 1,
        username: "you",
        content: newComment,
        timestamp,
        likes: 0,
        isLiked: false,
      }

      setComments([...comments, newCommentObj])
      setNewComment("")
    }
  }

  const toggleLike = () => {
    setIsLiked(!isLiked)
    if (music) {
      setMusic({
        ...music,
        likes: isLiked ? music.likes - 1 : music.likes + 1,
      })
    }
  }

  const handlePlay = () => {
    if (music && typeof window !== "undefined" && window.playTrack) {
      window.playTrack(music)
    }
  }

  const handleReply = (commentId: number) => {
    // 実際の実装ではここにリプライ機能を追加
    console.log(`Reply to comment ${commentId}`)
  }

  if (!music) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white/60">Loading...</p>
      </div>
    )
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div className="pb-20">
        {/* Music Info Section */}
        <div className="p-4 border-b border-white/10">
          <div className="flex gap-4">
            <div className="relative w-24 h-24 rounded-md overflow-hidden">
              <Image src={music.coverUrl || "/placeholder.svg"} alt={music.title} fill className="object-cover" />
            </div>

            <div className="flex-1">
              <h1 className="text-xl font-bold">{music.title}</h1>
              <p className="text-sm text-white/70">By: {music.artist}</p>

              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-white/70">
                  <Play className="w-3.5 h-3.5" />
                  <span className="text-xs">{music.plays}</span>
                </div>
                <div className="flex items-center gap-1 text-white/70">
                  <Heart className="w-3.5 h-3.5" />
                  <span className="text-xs">{music.likes}</span>
                </div>
                <div className="text-xs text-white/70">
                  <span>Market Cap ${music.marketCap}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              className="bg-white rounded-full w-10 h-10 flex items-center justify-center text-[#1a0a2e]"
              onClick={handlePlay}
            >
              <Play className="w-5 h-5 ml-0.5" />
            </button>

            <button
              className={`p-2 rounded-full ${isLiked ? "bg-pink-500/20 text-pink-500" : "bg-white/10"}`}
              onClick={toggleLike}
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-pink-500" : ""}`} />
            </button>

            <button className="bg-[#d4af37] text-black px-4 py-1.5 rounded-full text-sm font-medium ml-auto">
              PUMP FUN
            </button>
          </div>
        </div>

        {/* Lyrics Section */}
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold mb-2">Lyrics</h2>
          <div className="bg-[#2a1a3e] rounded-lg p-4 whitespace-pre-wrap text-sm text-white/90">{music.lyrics}</div>
        </div>

        {/* Comments Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Comments</h2>
            <span className="text-sm text-white/70">{comments.length} comments</span>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-[#2a1a3e] rounded-full py-2 px-4 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
              />
              <button
                type="submit"
                className="bg-[#d4af37] p-2 rounded-full text-black disabled:opacity-50"
                disabled={!newComment.trim()}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Comments List - Mobile */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-[#2a1a3e] rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm">{comment.username}</span>
                  <span className="text-xs text-white/60">{comment.timestamp}</span>
                </div>
                <p className="text-sm mb-2">{comment.content}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCommentLike(comment.id)}
                      className={`p-1 rounded-full ${comment.isLiked ? "text-pink-500" : "text-white/70 hover:text-white"}`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${comment.isLiked ? "fill-pink-500" : ""}`} />
                    </button>
                    <span className="text-xs text-white/70">{comment.likes}</span>
                  </div>

                  <button
                    onClick={() => handleReply(comment.id)}
                    className="flex items-center gap-1 text-xs text-[#d4af37]"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>reply</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Desktop layout
  return (
    <div className="h-full flex">
      {/* Left Column - Music Info & Lyrics */}
      <div className="w-1/2 h-full overflow-auto p-6 border-r border-white/10">
        <div className="max-w-xl mx-auto">
          <div className="flex gap-6 mb-6">
            <div className="relative w-40 h-40 rounded-md overflow-hidden">
              <Image src={music.coverUrl || "/placeholder.svg"} alt={music.title} fill className="object-cover" />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">{music.title}</h1>
              <p className="text-white/70 mb-4">By: {music.artist}</p>

              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-1">
                  <Play className="w-4 h-4" />
                  <span>{music.plays}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{music.likes}</span>
                </div>
                <div>
                  <span>Market Cap ${music.marketCap}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  className="bg-white rounded-full w-12 h-12 flex items-center justify-center text-[#1a0a2e]"
                  onClick={handlePlay}
                >
                  <Play className="w-6 h-6 ml-0.5" />
                </button>

                <button
                  className={`p-2.5 rounded-full ${isLiked ? "bg-pink-500/20 text-pink-500" : "bg-white/10"}`}
                  onClick={toggleLike}
                >
                  <Heart className={`w-6 h-6 ${isLiked ? "fill-pink-500" : ""}`} />
                </button>

                <button className="bg-[#d4af37] text-black px-6 py-2 rounded-full font-medium">PUMP FUN</button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Lyrics</h2>
            <div className="bg-[#2a1a3e] rounded-lg p-6 whitespace-pre-wrap text-white/90">{music.lyrics}</div>
          </div>
        </div>
      </div>

      {/* Right Column - Comments */}
      <div className="w-1/2 h-full overflow-auto p-6">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Comments</h2>
            <span className="text-white/70">{comments.length} comments</span>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="mb-8">
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-[#2a1a3e] rounded-full py-2.5 px-4 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
              />
              <button
                type="submit"
                className="bg-[#d4af37] p-2.5 rounded-full text-black disabled:opacity-50"
                disabled={!newComment.trim()}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Comments List - Desktop */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-[#2a1a3e] rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">{comment.username}</span>
                  <span className="text-sm text-white/60">{comment.timestamp}</span>
                </div>
                <p className="mb-3">{comment.content}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCommentLike(comment.id)}
                      className={`p-1 rounded-full ${comment.isLiked ? "text-pink-500" : "text-white/70 hover:text-white"}`}
                    >
                      <Heart className={`w-4 h-4 ${comment.isLiked ? "fill-pink-500" : ""}`} />
                    </button>
                    <span className="text-sm text-white/70">{comment.likes}</span>
                  </div>

                  <button
                    onClick={() => handleReply(comment.id)}
                    className="flex items-center gap-1.5 text-sm text-[#d4af37]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>reply</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

