"use client";
import { MusicCreator } from "@/components/music-creator";
import { ReleaseButton } from "@/components/release-button";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoList } from "@/components/video-list";
import { TokenList } from "@/components/token-list";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("videos");

  // Handler function for playing tracks
  const handlePlayTrack = (track: any) => {
    // Use the existing functionality or implement new behavior
    (window as any).playTrack?.(track);
  };

  return (
    <div className="h-full overflow-auto px-4 md:px-6 space-y-8 md:space-y-12 max-w-7xl mx-auto pb-20">
      <MusicCreator />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold">Discover</h2>
          <ReleaseButton />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
          </TabsList>
          
          <TabsContent value="videos" className="space-y-8">
            <VideoList onPlayTrack={handlePlayTrack} />
          </TabsContent>
          
          <TabsContent value="tokens" className="space-y-8">
            <TokenList />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
