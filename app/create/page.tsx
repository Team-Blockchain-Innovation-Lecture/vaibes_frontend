"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CreatePage() {
  const [prompt, setPrompt] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      // Store the prompt in localStorage to use it in the chat page
      localStorage.setItem("musicPrompt", prompt)
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
          <button
            type="submit"
            className="bg-[#d4af37] hover:bg-[#c4a027] text-black font-medium rounded-full px-8 py-3"
            disabled={!prompt.trim()}
          >
            Create
          </button>
        </form>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl md:text-3xl font-bold">Examples</h2>
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
  "Write a romantic song about blockchain and the future of finance",
  "Create a hip-hop track about NFTs and digital art",
  "Compose a pop song about the metaverse and virtual reality",
  "Write lyrics for an EDM track about decentralized networks",
  "Create a ballad about the journey of a crypto investor",
  "Write a rock anthem about breaking free from traditional banking",
]

