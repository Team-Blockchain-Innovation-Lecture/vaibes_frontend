/* eslint-disable @typescript-eslint/no-explicit-any */
import { MusicCard } from "@/components/MusicCard"


interface MusicGridProps {
    onPlayTrack: (track: any) => void
  }
  
  export function MusicGrid({ onPlayTrack }: MusicGridProps) {
    // Sample data
    const musicItems = [
      {
        id: 1,
        title: "ay ay mama don't worry u",
        artist: "H7g_Fx5",
        coverUrl: "/placeholder.svg?height=250&width=250",
        plays: 839,
        likes: 839,
        marketCap: "5.7K",
        duration: "02:10",
      },
      {
        id: 2,
        title: "El despertar animado",
        artist: "H7g_Fx5",
        coverUrl: "/placeholder.svg?height=250&width=250",
        plays: 839,
        likes: 839,
        marketCap: "5.7K",
        duration: "03:25",
      },
      {
        id: 3,
        title: "First Sign Of Madness",
        artist: "H7g_Fx5",
        coverUrl: "/placeholder.svg?height=250&width=250",
        plays: 839,
        likes: 839,
        marketCap: "5.7K",
        duration: "01:58",
      },
      {
        id: 4,
        title: "ay ay mama don't worry u",
        artist: "H7g_Fx5",
        coverUrl: "/placeholder.svg?height=250&width=250",
        plays: 839,
        likes: 839,
        marketCap: "5.7K",
        duration: "02:42",
      },
    ]
  
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {musicItems.map((music) => (
          <MusicCard
            key={music.id}
            title={music.title}
            artist={music.artist}
            coverUrl={music.coverUrl}
            plays={music.plays}
            likes={music.likes}
            marketCap={music.marketCap}
            duration={music.duration}
            onPlayTrack={onPlayTrack}
          />
        ))}
      </div>
    )
  }
  
  