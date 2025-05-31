"use client";
import { MusicCreator } from "@/components/music-creator";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoList } from "@/components/video-list";
import { TokenList } from "@/components/token-list";
import { LeaderboardDisplay } from "@/components/leaderboard-display";
import { Trophy } from "lucide-react"; // Import Trophy icon for the leaderboard

export default function HomePage() {
  const [activeMainTab, setActiveMainTab] = useState("discover");
  const [activeDiscoverTab, setActiveDiscoverTab] = useState("videos");
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState("videos");

  // Handler function for playing tracks
  const handlePlayTrack = (track: any) => {
    // Use the existing functionality or implement new behavior
    (window as any).playTrack?.(track);
  };

  return (
    <div className="h-full overflow-auto px-4 md:px-6 space-y-8 md:space-y-12 max-w-7xl mx-auto pb-20">
      <MusicCreator />

      <section className="space-y-4">
        {/* Main Tab Navigation between Discover and Leaderboard */}
        <Tabs
          value={activeMainTab}
          onValueChange={setActiveMainTab}
          className="w-full"
        >
          <div className="flex items-center justify-between">
            <TabsList className="mb-4 bg-transparent p-0">
              <TabsTrigger
                value="discover"
                className="text-2xl md:text-3xl font-bold data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 mr-8"
              >
                Discover
              </TabsTrigger>
              <TabsTrigger
                value="leaderboard"
                className="text-2xl md:text-3xl font-bold data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 flex items-center gap-2"
              >
                <Trophy className="w-6 h-6" /> Leaderboard
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Discover Content */}
          <TabsContent value="discover" className="space-y-8">
            <Tabs
              value={activeDiscoverTab}
              onValueChange={setActiveDiscoverTab}
              className="w-full"
            >
              <TabsList className="mb-8">
                <TabsTrigger value="videos">Videos</TabsTrigger>
                <TabsTrigger value="tokens">Tokens</TabsTrigger>
              </TabsList>

              <TabsContent value="videos" className="space-y-8">
                <VideoList limit={20} onPlayTrack={handlePlayTrack} />
              </TabsContent>

              <TabsContent value="tokens" className="space-y-8">
                <TokenList limit={21} />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Leaderboard Content */}
          <TabsContent value="leaderboard" className="space-y-8">
            <Tabs
              value={activeLeaderboardTab}
              onValueChange={setActiveLeaderboardTab}
              className="w-full"
            >
              <TabsList className="mb-8">
                <TabsTrigger value="videos">Top Videos</TabsTrigger>
                <TabsTrigger value="creators">Top Creators</TabsTrigger>
                <TabsTrigger value="tokens">Top Tokens</TabsTrigger>
              </TabsList>

              <TabsContent value="videos" className="space-y-8">
                <LeaderboardDisplay type="videos" />
              </TabsContent>

              <TabsContent value="creators" className="space-y-8">
                <LeaderboardDisplay type="creators" />
              </TabsContent>

              <TabsContent value="tokens" className="space-y-8">
                <LeaderboardDisplay type="tokens" />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
