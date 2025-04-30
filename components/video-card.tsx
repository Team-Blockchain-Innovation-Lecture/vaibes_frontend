"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { useRouter, useParams } from "next/navigation";

type VideoCardProps = {
  video: {
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
      marketCap?: number | null;
      mint?: string;
    };
    creator?: string;
    isLiked?: boolean;
    commentCount?: number;
  };
  onPlayTrack: (track: any) => void;
  tokenContext?: {
    mintAddress: string;
  };
};

export function VideoCard({
  video,
  onPlayTrack,
  tokenContext,
}: VideoCardProps) {
  const [isLiked, setIsLiked] = useState(video.isLiked || false);
  const [likeCount, setLikeCount] = useState(video.likeCount);
  const [isHovering, setIsHovering] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const { toast } = useToast();
  const { authenticated, login } = usePrivy();
  const { wallets } = useSolanaWallets();
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const params = useParams();

  // Handle video hover playback
  useEffect(() => {
    if (isHovering && videoRef.current) {
      videoRef.current
        .play()
        .catch((e) => console.error("Could not play video:", e));
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isHovering]);

  const handlePlay = async (e: React.MouseEvent) => {
    // Determine the navigation path based on context
    if (tokenContext) {
      // Navigate to the token-specific video detail page
      router.push(`/tokens/${tokenContext.mintAddress}/${video.id}`);
    } else if (params?.mint) {
      // If we're already in a token context from URL params
      router.push(`/tokens/${params.mint}/${video.id}`);
    } else {
      // Regular video navigation
      router.push(`/videos/${video.id}`);
    }
  };

  // Format the market cap nicely
  const formatMarketCap = (marketCap: number | null | undefined): string => {
    if (marketCap === null || marketCap === undefined) return "N/A";

    // Format the market cap with appropriate suffix (K, M, B)
    if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(1)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(1)}M`;
    } else if (marketCap >= 1e3) {
      return `$${(marketCap / 1e3).toFixed(1)}K`;
    } else {
      return `$${marketCap.toFixed(0)}`;
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      {/* Video Card */}
      <Card
        className="overflow-hidden relative aspect-[9/16] h-full w-full cursor-pointer"
        onClick={handlePlay}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Video */}
        <div className="absolute inset-0 bg-black">
          <video
            ref={videoRef}
            src={video.url}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
          />
        </div>

        {/* Play count and Token info overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-white bg-black/50 px-2 py-1 rounded-md">
            <Play className="h-3 w-3" />
            <span className="text-xs">{video.playCount.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1.5 text-white bg-black/50 px-2 py-1 rounded-md">
            <span className="text-xs font-semibold text-primary-500">
              ${video.token.symbol}
            </span>
            <span className="text-xs font-semibold text-primary-500">
              {formatMarketCap(video.token.marketCap)}
            </span>
          </div>
        </div>
      </Card>

      {/* Video Title - Outside the card */}
      <h3 className="font-medium text-sm line-clamp-1">{video.title}</h3>
    </div>
  );
}
