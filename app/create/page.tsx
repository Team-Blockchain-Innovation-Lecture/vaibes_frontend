"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

// ジャンルの選択肢
const genres = [
  { value: "EDM", label: "EDM" },
  { value: "pop", label: "Pop" },
  { value: "rock", label: "Rock" },
  { value: "hiphop", label: "Hip Hop" },
  { value: "rnb", label: "R&B" },
  { value: "jazz", label: "Jazz" },
  { value: "classical", label: "Classical" },
]

export default function CreatePage() {
  const [prompt, setPrompt] = useState("")
  const [genre, setGenre] = useState("EDM")
  const [instrumental, setInstrumental] = useState(false)
  const searchParams = useSearchParams()

  // 一時的なtask_idを生成する関数
  const generateTempTaskId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  useEffect(() => {
    // URLからプロンプトとジャンルを取得
    const urlPrompt = searchParams.get("prompt")
    const urlGenre = searchParams.get("genre")
    
    if (urlPrompt) setPrompt(urlPrompt)
    if (urlGenre) setGenre(urlGenre)
  }, [searchParams])

  return (
    <div className="h-full overflow-auto px-4 md:px-6 space-y-8 md:space-y-12 max-w-7xl mx-auto pb-20">
      <div className="py-6 md:py-10">
        <h1 className="text-2xl md:text-4xl font-bold mb-6 text-center">Drop your ideas, make a song</h1>
        <form 
          action="/create/chat"
          method="get"
          className="flex flex-col items-center gap-4 max-w-3xl mx-auto"
        >
          <input type="hidden" name="task_id" value={generateTempTaskId()} />
          
          <div className="relative flex-1 w-full">
            <textarea
              name="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What do you want to make a song about?"
              className="w-full bg-[#2a1a3e] rounded-xl py-3 px-6 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 min-h-[120px] resize-none"
              rows={4}
              required
            />
          </div>
          
          <div className="w-full flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-white/90 mb-2 font-medium">ジャンル</label>
              <div className="relative">
                <select
                  name="genre"
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
            
            <div className="flex-1">
              <label className="block text-white/90 mb-2 font-medium">ボーカル</label>
              <div className="relative">
                <select
                  name="instrumental"
                  value={instrumental ? "true" : "false"}
                  onChange={(e) => setInstrumental(e.target.value === "true")}
                  className="w-full bg-[#2a1a3e] rounded-xl py-3 px-6 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 cursor-pointer"
                >
                  <option value="false">ボーカルあり</option>
                  <option value="true">インストゥルメンタル</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            className="bg-[#d4af37] hover:bg-[#c4a027] text-black font-medium rounded-full px-8 py-3 mt-4 w-full max-w-xs"
            disabled={!prompt.trim()}
          >
            Create
          </button>
        </form>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl md:text-3xl font-bold">プロンプト例</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {examples.map((example, index) => (
            <div
              key={index}
              className="bg-[#2a1a3e] rounded-xl p-4 cursor-pointer hover:bg-[#3a2a4e] transition-colors"
              onClick={() => setPrompt(example)}
            >
              <p className="text-white/90">{example}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

const examples = [
  "Silk-lined shadows weave across the boulevard, Reflections dancing on a midnight silver car. City lights whisper in a fever-dream glow, Every step a rhythm only restless hearts can know.",
  "Write a romantic song about blockchain and the future of finance",
  "Create a hip-hop track about NFTs and digital art",
  "Compose a pop song about the metaverse and virtual reality",
  "Write lyrics for an EDM track about decentralized networks",
  "Create a ballad about the journey of a crypto investor",
]

