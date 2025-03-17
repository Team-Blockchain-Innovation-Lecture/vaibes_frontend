import { Heart, Play } from "lucide-react"

interface MobilePlayerInfoProps {
  plays: number
  likes: number
  marketCap: string
}

export function MobilePlayerInfo({ plays, likes, marketCap }: MobilePlayerInfoProps) {
  return (
    <div className="flex items-center justify-center gap-4 mt-1 sm:hidden">
      <div className="flex items-center gap-1 text-white/70">
        <Play className="w-3 h-3" />
        <span className="text-xs">{plays}</span>
      </div>
      <div className="flex items-center gap-1 text-white/70">
        <Heart className="w-3 h-3" />
        <span className="text-xs">{likes}</span>
      </div>
      <div className="text-xs text-white/70">
        <span>Market Cap ${marketCap}</span>
      </div>
    </div>
  )
}

