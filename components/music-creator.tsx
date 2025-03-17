"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function MusicCreator() {
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
    <div className="py-6 md:py-10">
      <h1 className="text-2xl md:text-4xl font-bold mb-6 text-center">Drop your ideas, make a song</h1>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-3xl mx-auto">
        <div className="relative flex-1">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="what do you want to make a song?"
            className="w-full bg-[#2a1a3e] rounded-full py-3 px-6 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
          />
        </div>
        <Button
          type="submit"
          className="bg-[#d4af37] hover:bg-[#c4a027] text-black font-medium rounded-full px-6"
          disabled={!prompt.trim()}
        >
          Create
        </Button>
      </form>
    </div>
  )
}

