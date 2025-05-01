"use client";

import React, { useEffect, useState } from "react";
import { VideoCard } from "@/components/video-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "next/navigation";
import { truncateAddress } from "@/lib/utils";

type UserVideosStats = {
  totalVideos: number;
  totalPlays: number;
  totalLikes: number;
};

type UserDetailProps = {
  params: {
    walletAddress: string;
  };
};

export default function UserDetailPage({ params }: UserDetailProps) {
  const [userStats, setUserStats] = useState<UserVideosStats | null>(null);
  const [createdVideos, setCreatedVideos] = useState<any[]>([]);
  const [likedVideos, setLikedVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // React.use() to unwrap params
  const walletAddressParam = React.use(params);
  const walletAddress = walletAddressParam.walletAddress;

  // Handler function for playing tracks
  const handlePlayTrack = (track: any) => {
    // Use the existing functionality
    (window as any).playTrack?.(track);
  };

  useEffect(() => {
    async function fetchUserData() {
      try {
        // Fetch user stats
        const statsResponse = await fetch(`/api/users/${walletAddress}/stats`);
        if (!statsResponse.ok) throw new Error("Failed to fetch user stats");
        const statsData = await statsResponse.json();
        setUserStats(statsData.stats);

        // Fetch created videos
        const createdVideosResponse = await fetch(
          `/api/users/${walletAddress}/videos`
        );
        if (!createdVideosResponse.ok)
          throw new Error("Failed to fetch created videos");
        const createdVideosData = await createdVideosResponse.json();
        setCreatedVideos(createdVideosData.videos);

        // Fetch liked videos
        const likedVideosResponse = await fetch(
          `/api/users/${walletAddress}/likes`
        );
        if (!likedVideosResponse.ok)
          throw new Error("Failed to fetch liked videos");
        const likedVideosData = await likedVideosResponse.json();
        setLikedVideos(likedVideosData.videos);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (walletAddress) {
      fetchUserData();
    }
  }, [walletAddress]);

  if (loading) {
    return (
      <div className="h-full p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-secondary/30 rounded-lg"></div>
          <div className="h-8 bg-secondary/30 w-1/3 rounded"></div>
          <div className="h-24 bg-secondary/30 rounded"></div>
        </div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="h-full p-4 md:p-8 flex items-center justify-center max-w-7xl mx-auto">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">User Not Found</h1>
          <p className="text-muted-foreground">
            The user you're looking for doesn't exist or has no activity.
          </p>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto px-4 md:px-8 space-y-8 max-w-7xl mx-auto pb-20">
      <section className="space-y-6 pt-6">
        {/* User Header */}
        <div className="flex flex-col gap-6 items-start">
          <div>
            <h1 className="text-3xl font-bold">User Profile</h1>
            <p className="text-lg text-muted-foreground">{walletAddress}</p>
          </div>
        </div>

        {/* Video Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">
              {userStats.totalVideos || 0}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Created Videos
            </div>
          </div>

          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">
              {userStats.totalPlays?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Total Plays
            </div>
          </div>

          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">
              {userStats.totalLikes?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Total Likes
            </div>
          </div>
        </div>
      </section>

      {/* Videos Tabs */}
      <section className="space-y-4">
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="likes">Likes</TabsTrigger>
          </TabsList>

          {/* Videos Tab Content */}
          <TabsContent value="videos" className="space-y-4">
            <h2 className="text-2xl font-bold">Created Videos</h2>
            {createdVideos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {createdVideos.map((video) => (
                  <div key={video.id} className="h-auto">
                    <VideoCard video={video} onPlayTrack={handlePlayTrack} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-secondary/10 rounded-lg">
                <p className="text-muted-foreground">
                  No videos created by this user
                </p>
              </div>
            )}
          </TabsContent>

          {/* Likes Tab Content */}
          <TabsContent value="likes" className="space-y-4">
            <h2 className="text-2xl font-bold">Liked Videos</h2>
            {likedVideos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {likedVideos.map((video) => (
                  <div key={video.id} className="h-auto">
                    <VideoCard video={video} onPlayTrack={handlePlayTrack} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-secondary/10 rounded-lg">
                <p className="text-muted-foreground">
                  No videos liked by this user
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
