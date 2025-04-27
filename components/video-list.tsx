"use client";

import React, { useEffect, useState } from "react";
import { VideoCard } from "./video-card";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";

type VideoListProps = {
  limit?: number;
  onPlayTrack: (track: any) => void;
};

type Video = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  thumbnailUrl: string | null;
  playCount: number;
  likeCount: number;
  token: {
    name: string;
    symbol: string;
    logo: string | null;
  };
  creator?: string;
  isLiked?: boolean;
  commentCount?: number;
};

export function VideoList({ limit = 20, onPlayTrack }: VideoListProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const { authenticated } = usePrivy();
  const { wallets } = useSolanaWallets();

  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await fetch("/api/videos");

        if (!response.ok) throw new Error("Failed to fetch videos");
        const data = await response.json();

        // 仮のコメント数を追加（実際のAPIにはコメント数がないため）
        const videosWithComments = data.videos.map((video: any) => ({
          ...video,
          commentCount: Math.floor(Math.random() * 20), // 仮のコメント数（0〜19）
        }));

        setVideos(videosWithComments);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, [limit, authenticated, wallets]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-64 bg-secondary/30 animate-pulse rounded-lg"
          ></div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No videos found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} onPlayTrack={onPlayTrack} />
      ))}
    </div>
  );
}
