import Link from "next/link"
import { Home, Music } from "lucide-react"

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-[200px] bg-[#150823] p-4 sticky top-0 h-screen">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
          vaibes.fun
        </span>
      </Link>

      <nav className="space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>
        <Link
          href="/create"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
        >
          <Music className="w-5 h-5" />
          <span>Create</span>
        </Link>
      </nav>
    </aside>
  )
}

