/* eslint-disable @typescript-eslint/no-explicit-any */
import { MusicCard } from "@/components/MusicCard"

interface MusicCarouselProps {
    onPlayTrack: (track: any) => void
  }
  
  export function MusicCarousel({ onPlayTrack }: MusicCarouselProps) {
    // Sample data
    const trendingMusic = [
      {
        id: 1,
        title: "Mary, Mary",
        artist: "H7g_Fx5",
        coverUrl: "/placeholder.svg?height=250&width=250",
        plays: 839,
        likes: 839,
        marketCap: "5.7K",
        duration: "02:45",
      },
      {
        id: 2,
        title: "A Good Heart",
        artist: "H7g_Fx5",
        coverUrl: "/placeholder.svg?height=250&width=250",
        plays: 839,
        likes: 839,
        marketCap: "5.7K",
        duration: "02:23",
      },
      {
        id: 3,
        title: "Azucena",
        artist: "H7g_Fx5",
        coverUrl: "/placeholder.svg?height=250&width=250",
        plays: 839,
        likes: 839,
        marketCap: "5.7K",
        duration: "03:12",
      },
      {
        id: 4,
        title: "Shadow in the Shadows",
        artist: "H7g_Fx5",
        coverUrl: "/placeholder.svg?height=250&width=250",
        plays: 839,
        likes: 839,
        marketCap: "5.7K",
        duration: "01:59",
      },
      {
        id: 5,
        title: "Black Skull Mask",
        artist: "H7g_Fx5",
        coverUrl: "/placeholder.svg?height=250&width=250",
        plays: 839,
        likes: 839,
        marketCap: "5.7K",
        duration: "02:37",
      },
      {
        id: 6,
        title: "The Floor Is Lava",
        artist: "H7g_Fx5",
        coverUrl: "/placeholder.svg?height=250&width=250",
        plays: 839,
        likes: 839,
        marketCap: "5.7K",
        duration: "03:05",
      },
      {
        id: 7,
        title: "Hate You Like I Love You",
        artist: "H7g_Fx5",
        coverUrl: "/placeholder.svg?height=250&width=250",
        plays: 839,
        likes: 839,
        marketCap: "5.7K",
        duration: "02:18",
      },
      {
        id: 8,
        title: "mistake",
        artist: "H7g_Fx5",
        coverUrl: "/placeholder.svg?height=250&width=250",
        plays: 839,
        likes: 839,
        marketCap: "5.7K",
        duration: "01:45",
      },
    ]
  
    return (
      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex gap-4">
          {trendingMusic.map((music) => (
            <MusicCard
              key={music.id}
              title={music.title}
              artist={music.artist}
              coverUrl={music.coverUrl}
              plays={music.plays}
              likes={music.likes}
              marketCap={music.marketCap}
              duration={music.duration}
              isCarousel={true}
              onPlayTrack={onPlayTrack}
            />
          ))}
        </div>
      </div>
    )
  }
  