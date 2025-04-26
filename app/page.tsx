"use client";
import { MusicCreator } from "@/components/music-creator";
import { MusicCarousel } from "@/components/music-carousel";
import { MusicGrid } from "@/components/music-grid";
import { ReleaseButton } from "@/components/release-button";

export default function HomePage() {
  return (
    <div className="h-full overflow-auto px-4 md:px-6 space-y-8 md:space-y-12 max-w-7xl mx-auto pb-20">
      <MusicCreator />

      <section>
        <ReleaseButton />
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl md:text-3xl font-bold">Trending</h2>
        </div>
        <MusicCarousel
          onPlayTrack={(track) => (window as any).playTrack(track)}
        />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl md:text-3xl font-bold">Top Market Cap</h2>
          <button className="text-sm font-medium text-[#d4af37]">More</button>
        </div>
        <MusicGrid onPlayTrack={(track) => (window as any).playTrack(track)} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl md:text-3xl font-bold">Hip-Hop</h2>
          <button className="text-sm font-medium text-[#d4af37]">More</button>
        </div>
        <MusicGrid onPlayTrack={(track) => (window as any).playTrack(track)} />
      </section>
    </div>
  );
}
