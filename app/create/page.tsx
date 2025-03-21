"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// ジャンルの選択肢
const genres = [
  { value: "electronic", label: "electronic" },
  { value: "pop", label: "pop" },
  { value: "rock", label: "rock" },
  { value: "hiphop", label: "hiphop" },
  { value: "rnb", label: "rnb" },
  { value: "jazz", label: "jazz" },
  { value: "classical", label: "classical" },
  { value: "country", label: "country" },
]

export default function CreatePage() {
  const [prompt, setPrompt] = useState("")
  const [genre, setGenre] = useState("electronic")
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleGenerate = async () => {
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, genre }),
      });
      
      if (response.ok) {
        localStorage.setItem("musicPrompt", prompt);
        router.push("/create/chat");
      }
    } catch (error) {
      console.error("Error generating music:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      localStorage.setItem("musicPrompt", prompt)
      localStorage.setItem("musicGenre", genre)
      router.push("/create/chat")
    }
  }

  return (
    // 作成ページにもパディングを追加
    <div className="h-full overflow-auto px-4 md:px-6 space-y-8 md:space-y-12 max-w-7xl mx-auto pb-20">
      <div className="py-6 md:py-10">
        <h1 className="text-2xl md:text-4xl font-bold mb-6 text-center">Drop your ideas, make a song</h1>
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 max-w-3xl mx-auto">
          <div className="relative flex-1 w-full">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="what do you want to make a song?"
              className="w-full bg-[#2a1a3e] rounded-xl py-3 px-6 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 min-h-[120px] resize-none"
              rows={4}
            />
          </div>
          
          <div className="w-full max-w-xs">
            <label className="block text-white/90 mb-2 font-medium">ジャンルを選択</label>
            <div className="relative">
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-[#2a1a3e] rounded-xl py-3 px-6 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 cursor-pointer"
              >
                {genres.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            className="bg-[#d4af37] hover:bg-[#c4a027] text-black font-medium rounded-full px-8 py-3 mt-4"
            disabled={!prompt.trim()}
          >
            Create
          </button>
        </form>
      </div>

      {isMounted && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl md:text-3xl font-bold">Examples</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {examples.map((example, index) => (
              <div
                key={index}
                className="bg-[#2a1a3e] rounded-xl p-4 cursor-pointer hover:bg-[#3a2a4e] transition-colors"
                onClick={() => {
                  setPrompt(example)
                }}
              >
                <p className="text-white/90">{example}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

const examples = [
  "Write a romantic song about blockchain and the future of finance",
  "Create a hip-hop track about NFTs and digital art",
  "Compose a pop song about the metaverse and virtual reality",
  "Write lyrics for an EDM track about decentralized networks",
  "Create a ballad about the journey of a crypto investor",
  "Write a rock anthem about breaking free from traditional banking",
]

