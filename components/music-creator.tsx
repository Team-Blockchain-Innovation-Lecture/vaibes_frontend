"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

// ジャンルの選択肢
const genres = [
  { value: "EDM", label: "EDM" },
  { value: "pop", label: "Pop" },
  { value: "rock", label: "Rock" },
  { value: "hiphop", label: "Hip Hop" },
  { value: "jazz", label: "Jazz" },
  { value: "classical", label: "Classical" },
]

// ビデオスタイルの選択肢
const videoStyles = [
  { value: "anime", label: "anime" },
  { value: "3d_animation", label: "3d_animation" },
  { value: "clay", label: "clay" },
  { value: "comic", label: "comic" },
  { value: "cyberpunk", label: "cyberpunk" },
]

export function MusicCreator() {
  const [prompt, setPrompt] = useState("")
  const [genre, setGenre] = useState("pop")
  const [videoStyle, setVideoStyle] = useState("anime")
  const router = useRouter()

  // 一時的なtask_idを生成する関数
  const generateTempTaskId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const taskId = generateTempTaskId()
    router.push(`/create/chat?prompt=${encodeURIComponent(prompt)}&genre=${genre}&video_style=${videoStyle}&task_id=${taskId}`)
  }

  return (
    <div className="py-6 md:py-10">
      <h1 className="text-2xl md:text-4xl font-bold mb-6 text-center">Drop your ideas, make a video</h1>
      <form 
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-3 max-w-3xl mx-auto"
      >
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter the lyrics of the music you want to add to the video."
            className="w-full bg-[#2a1a3e] rounded-full py-3 px-6 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
            required
          />
        </div>
        <div className="text-white text-md font-bold text-center">Music Genre</div>
        <div className="w-full max-w-xs">
          <select
            name="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full bg-[#2a1a3e] rounded-full py-3 px-6 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 cursor-pointer"
          >
            {genres.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
        <div className="text-white text-md font-bold text-center">Video Style</div>
        <div className="w-full max-w-xs">
          <select
            name="videoStyle"
            value={videoStyle}
            onChange={(e) => setVideoStyle(e.target.value)}
            className="w-full bg-[#2a1a3e] rounded-full py-3 px-6 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 cursor-pointer"
          >
            {videoStyles.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        
        <Button
          type="submit"
          className="bg-[#d4af37] hover:bg-[#c4a027] text-black font-medium rounded-full px-8 py-3 mt-2"
          disabled={!prompt.trim()}
        >
          Create
        </Button>
      </form>
    </div>
  )
}

