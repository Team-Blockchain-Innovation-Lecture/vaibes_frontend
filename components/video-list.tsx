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
  isLiked?: boolean;
};

export function VideoList({ limit = 20, onPlayTrack }: VideoListProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const { authenticated } = usePrivy();
  const { wallets } = useSolanaWallets();

  useEffect(() => {
    async function fetchVideos() {
      try {
        // walletAddressを直接取得
        const walletAddress =
          wallets && wallets.length > 0 ? wallets[0]?.address : null;

        // 認証されており、かつwalletAddressが存在する場合は送信する
        const url =
          authenticated && walletAddress
            ? `/api/videos?limit=${limit}&walletAddress=${walletAddress}`
            : `/api/videos?limit=${limit}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch videos");
        const data = await response.json();
        setVideos(data.videos);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} onPlayTrack={onPlayTrack} />
      ))}
    </div>
  );
}
