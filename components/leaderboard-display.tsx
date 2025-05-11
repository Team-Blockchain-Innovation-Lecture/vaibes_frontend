"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Medal,
  Play,
  Heart,
  Film,
  TrendingUp,
  Crown,
  Trophy,
} from "lucide-react";
import { Button } from "./ui/button";
import { VideoCard } from "./video-card";

type LeaderboardDisplayProps = {
  type: "videos" | "creators" | "tokens";
  limit?: number;
};

const getRankIcon = (rank: number) => {
  if (rank === 1) {
    return (
      <div className="flex items-center justify-center w-8 h-8 bg-amber-400 rounded-full">
        <Medal className="w-5 h-5 text-white" />
      </div>
    );
  } else if (rank === 2) {
    return (
      <div className="flex items-center justify-center w-8 h-8 bg-gray-300 rounded-full">
        <Medal className="w-5 h-5 text-white" />
      </div>
    );
  } else if (rank === 3) {
    return (
      <div className="flex items-center justify-center w-8 h-8 bg-amber-700 rounded-full">
        <Medal className="w-5 h-5 text-white" />
      </div>
    );
  } else {
    return (
      <div className="flex items-center justify-center w-8 h-8 bg-gray-900 rounded-full">
        <span className="text-sm font-bold">{rank}</span>
      </div>
    );
  }
};

// Format wallet address to show only first 4 and last 4 characters
const formatAddress = (address: string) => {
  if (!address || address.length < 10) return address;
  return `${address.substring(0, 4)}...${address.substring(
    address.length - 4
  )}`;
};

export function LeaderboardDisplay({
  type,
  limit = 20,
}: LeaderboardDisplayProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveringVideos, setHoveringVideos] = useState<{
    [key: string]: boolean;
  }>({});
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  useEffect(() => {
    async function fetchLeaderboardData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/leaderboard/${type}?limit=${limit}`);

        if (!response.ok)
          throw new Error(`Failed to fetch ${type} leaderboard`);

        const responseData = await response.json();

        // Extract the appropriate data array based on the type
        const items = responseData[type] || [];
        setData(items);
      } catch (error) {
        console.error(`Error fetching ${type} leaderboard:`, error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboardData();
  }, [type, limit]);

  // Handler function for playing tracks (placeholder)
  const handlePlayTrack = (track: any) => {
    // Use the existing functionality or implement new behavior
    (window as any).playTrack?.(track);
  };

  // Handle video hover for top 3 videos
  const handleVideoMouseEnter = (videoId: string) => {
    setHoveringVideos((prev) => ({ ...prev, [videoId]: true }));

    const videoElement = videoRefs.current[videoId];
    if (videoElement) {
      videoElement
        .play()
        .catch((e) => console.error("Could not play video:", e));
    }
  };

  const handleVideoMouseLeave = (videoId: string) => {
    setHoveringVideos((prev) => ({ ...prev, [videoId]: false }));

    const videoElement = videoRefs.current[videoId];
    if (videoElement) {
      videoElement.pause();
      videoElement.currentTime = 0;
    }
  };

  // Render Top 3 Videos in a highlighted grid
  const renderTopVideos = () => {
    if (data.length === 0 || type !== "videos") return null;

    const topThree = data.slice(0, 3);

    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Crown className="h-6 w-6 text-amber-400" /> Top 3 Videos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topThree.map((video, index) => (
            <div
              key={video.id}
              className="relative group overflow-hidden rounded-xl border border-amber-400/30 bg-background/50 transition-all hover:shadow-lg hover:shadow-amber-500/10"
              onMouseEnter={() => handleVideoMouseEnter(video.id)}
              onMouseLeave={() => handleVideoMouseLeave(video.id)}
            >
              {/* Rank Badge */}
              <div
                className={`absolute top-2 left-2 z-10 flex items-center justify-center w-10 h-10 rounded-full ${
                  index === 0
                    ? "bg-amber-400"
                    : index === 1
                    ? "bg-gray-300"
                    : "bg-amber-700"
                }`}
              >
                <span className="font-bold text-black text-lg">
                  {index + 1}
                </span>
              </div>

              {/* Play Count Badge */}
              <div className="absolute top-2 right-2 z-10 bg-black/70 rounded-full px-2 py-1 flex items-center gap-1">
                <Play className="w-3 h-3" />
                <span className="text-xs font-semibold">
                  {video.playCount.toLocaleString()}
                </span>
              </div>

              {/* Video Element - Always show video without conditional */}
              <div className="aspect-[9/16] w-full relative overflow-hidden bg-secondary/30">
                <video
                  ref={(el) => {
                    videoRefs.current[video.id] = el;
                  }}
                  src={video.url}
                  className="h-full w-full object-cover"
                  playsInline
                  muted
                  loop
                  preload="auto"
                >
                  {/* Fallback content if video can't be loaded */}
                  <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
                    <Play className="w-12 h-12 opacity-30" />
                  </div>
                </video>

                {/* Hover Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                  <Link
                    href={`/videos/${video.id}`}
                    className="bg-primary text-primary-foreground rounded-full p-3 transform hover:scale-110 transition-transform"
                  >
                    <Play className="w-8 h-8" />
                  </Link>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-3">
                <Link href={`/videos/${video.id}`} className="hover:underline">
                  <h3 className="font-bold text-lg line-clamp-1">
                    {video.title}
                  </h3>
                </Link>

                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm text-muted-foreground">
                    <Link
                      href={`/tokens/${video.token?.mint}`}
                      className="hover:underline"
                    >
                      {video.token?.name || "Unknown Token"}
                    </Link>
                  </div>

                  <div className="flex items-center gap-1 text-rose-500">
                    <Heart className="w-4 h-4" />
                    <span className="text-xs">
                      {video.likeCount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {video.creator && (
                  <div className="text-xs text-muted-foreground mt-1">
                    By{" "}
                    <Link
                      href={`/users/${video.creator}`}
                      className="hover:underline"
                    >
                      {formatAddress(video.creator)}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderVideoItem = (item: any, index: number) => (
    <div
      key={item.id}
      className="flex items-center gap-4 p-4 rounded-xl bg-background hover:bg-secondary/20 transition-colors"
    >
      <div className="flex-shrink-0">{getRankIcon(item.rank)}</div>

      <div className="flex-shrink-0 relative h-16 w-9 overflow-hidden rounded-md bg-secondary/30">
        {item.thumbnailUrl ? (
          <Image
            src={item.thumbnailUrl}
            alt={item.title}
            fill
            className="object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.jpg";
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex-grow">
        <Link href={`/videos/${item.id}`} className="hover:underline">
          <h3 className="font-semibold truncate">{item.title}</h3>
        </Link>
        <div className="text-sm text-muted-foreground">
          <Link
            href={`/tokens/${item.token?.mint}`}
            className="hover:underline"
          >
            {item.token?.name || "Unknown Token"}
          </Link>
          {item.creator && (
            <>
              {" "}
              • By{" "}
              <Link href={`/users/${item.creator}`} className="hover:underline">
                {formatAddress(item.creator)}
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1 text-sm">
          <Play className="w-4 h-4" />
          <span>{item.playCount.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Heart className="w-4 h-4" />
          <span>{item.likeCount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );

  const renderCreatorItem = (item: any, index: number) => (
    <div
      key={item.walletAddress}
      className="flex items-center gap-4 p-4 rounded-xl bg-background hover:bg-secondary/20 transition-colors"
    >
      <div className="flex-shrink-0">{getRankIcon(item.rank)}</div>

      <div className="flex-shrink-0 w-10 h-10 bg-secondary/30 rounded-full flex items-center justify-center">
        <TrendingUp className="w-5 h-5" />
      </div>

      <div className="flex-grow">
        <Link href={`/users/${item.walletAddress}`} className="hover:underline">
          <h3 className="font-semibold">{formatAddress(item.walletAddress)}</h3>
        </Link>
        <div className="text-sm text-muted-foreground">
          {item.videoCount} {item.videoCount === 1 ? "video" : "videos"}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1 text-sm">
          <Play className="w-4 h-4" />
          <span>{item.totalPlays.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );

  const renderTokenItem = (item: any, index: number) => (
    <div
      key={item.id}
      className="flex items-center gap-4 p-4 rounded-xl bg-background hover:bg-secondary/20 transition-colors"
    >
      <div className="flex-shrink-0">{getRankIcon(item.rank)}</div>

      <div className="flex-shrink-0 relative w-10 h-10 bg-secondary/30 rounded-full overflow-hidden">
        {item.logo ? (
          <Image
            src={item.logo}
            alt={item.name}
            fill
            className="object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-logo.svg";
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold">
              {item.symbol?.substring(0, 2) || "??"}
            </span>
          </div>
        )}
      </div>

      <div className="flex-grow">
        <Link href={`/tokens/${item.mint}`} className="hover:underline">
          <h3 className="font-semibold">{item.name || "Unknown Token"}</h3>
        </Link>
        <div className="text-sm text-muted-foreground">
          {item.symbol} • {item.videoCount}{" "}
          {item.videoCount === 1 ? "video" : "videos"}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1 text-sm">
          <Play className="w-4 h-4" />
          <span>{item.totalPlays.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Heart className="w-4 h-4" />
          <span>{item.totalLikes.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );

  const renderVideosGrid = () => {
    // Only show this grid for videos after the top 3
    if (type !== "videos" || data.length <= 3) return null;

    // Get videos after the top 3
    const remainingVideos = data.slice(3);

    return (
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="h-6 w-6" /> More Top Videos
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {remainingVideos.map((video) => (
            <div key={video.id} className="relative group h-auto">
              {/* Rank Badge */}
              <div className="absolute top-2 left-2 z-10 flex items-center justify-center w-6 h-6 bg-black/80 rounded-full">
                <span className="text-xs font-bold">{video.rank}</span>
              </div>
              <VideoCard video={video} onPlayTrack={handlePlayTrack} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLeaderboard = () => {
    // If loading, show skeleton
    if (loading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 p-4 animate-pulse">
          <div className="w-8 h-8 bg-secondary/30 rounded-full"></div>
          <div className="w-10 h-16 bg-secondary/30 rounded-md"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-secondary/30 rounded w-3/4"></div>
            <div className="h-3 bg-secondary/30 rounded w-1/2"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-secondary/30 rounded w-16"></div>
            <div className="h-3 bg-secondary/30 rounded w-16"></div>
          </div>
        </div>
      ));
    }

    // If no data, show message
    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Film className="w-12 h-12 mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No data available</h3>
          <p className="text-muted-foreground">
            {type === "videos" && "No videos found in the leaderboard."}
            {type === "creators" && "No creators found in the leaderboard."}
            {type === "tokens" && "No tokens found in the leaderboard."}
          </p>
        </div>
      );
    }

    // For videos, we use a custom display with TOP 3 highlighted
    if (type === "videos") {
      return (
        <>
          {renderTopVideos()}
          {renderVideosGrid()}
        </>
      );
    }

    // Return the appropriate item renderer based on type for creators and tokens
    return (
      <div className="space-y-2 border rounded-xl border-border divide-y divide-border overflow-hidden">
        {data.map((item, index) => {
          if (type === "creators") return renderCreatorItem(item, index);
          if (type === "tokens") return renderTokenItem(item, index);
          return null;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderLeaderboard()}

      {data.length > 0 && data.length >= limit && type !== "videos" && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => {}}>
            View More
          </Button>
        </div>
      )}
    </div>
  );
}
