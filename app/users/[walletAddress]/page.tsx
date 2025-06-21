"use client";

import React, { useEffect, useState } from "react";
import { VideoCard } from "@/components/video-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "next/navigation";
import { truncateAddress } from "@/lib/utils";
import { Clipboard, Trophy } from "lucide-react"; // Import Trophy icon
import { useToast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type UserVideosStats = {
  totalVideos: number;
  totalPlays: number;
  totalLikes: number;
  rank?: number; // ランキング情報を追加
};

type UserDetailProps = {
  params: {
    walletAddress: string;
  };
};

// ランキングバッジコンポーネント
const RankBadge = ({ rank }: { rank: number | undefined }) => {
  if (!rank) return null;

  let badgeColor = "";
  let textColor = "text-white";

  if (rank === 1) {
    badgeColor = "bg-yellow-500"; // 金メダル（1位）
  } else if (rank === 2) {
    badgeColor = "bg-gray-300"; // 銀メダル（2位）
  } else if (rank === 3) {
    badgeColor = "bg-amber-600"; // 銅メダル（3位）
  } else {
    badgeColor = "bg-gray-700"; // その他の順位
    textColor = "text-gray-200";
  }

  return (
    <div
      className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${badgeColor} ${textColor}`}
    >
      <Trophy size={rank <= 3 ? 20 : 16} className="mr-1" />
      <span className="font-bold">{`#${rank}`}</span>
    </div>
  );
};

// Total Playsカードのスタイルを設定する関数
const getTotalPlaysCardStyle = (rank?: number) => {
  if (!rank || rank > 3) return "bg-primary/10";

  if (rank === 1) {
    return "bg-gradient-to-br from-yellow-500/80 to-yellow-700/80 shadow-lg shadow-yellow-500/30 border-2 border-yellow-400";
  } else if (rank === 2) {
    return "bg-gradient-to-br from-gray-300/80 to-gray-500/80 shadow-lg shadow-gray-400/30 border-2 border-gray-300";
  } else if (rank === 3) {
    return "bg-gradient-to-br from-amber-600/80 to-amber-800/80 shadow-lg shadow-amber-600/30 border-2 border-amber-500";
  }

  return "bg-primary/10";
};

// Total Playsのテキストスタイルを設定する関数
const getTotalPlaysTextStyle = (rank?: number) => {
  if (!rank || rank > 3) return "text-white";
  return "text-white font-extrabold";
};

export default function UserDetailPage({ params }: UserDetailProps) {
  const [userStats, setUserStats] = useState<UserVideosStats | null>(null);
  const [createdVideos, setCreatedVideos] = useState<any[]>([]);
  const [likedVideos, setLikedVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false); // New state for clipboard feedback
  const { toast } = useToast(); // For showing toast notifications

  // React.use() to unwrap params
  const walletAddressParam = React.use(params);
  const walletAddress = walletAddressParam.walletAddress;

  // Add clipboard copy functionality
  const handleCopyWalletAddress = () => {
    navigator.clipboard
      .writeText(walletAddress)
      .then(() => {
        // Show visual feedback
        setCopied(true);

        // Reset after 2 seconds
        setTimeout(() => setCopied(false), 2000);

        // Also show toast notification
        toast({
          title: "Address copied",
          description: "Wallet address has been copied to clipboard",
          variant: "default",
        });
      })
      .catch((error) => {
        console.error("Failed to copy address:", error);
        toast({
          title: "Copy failed",
          description: "Failed to copy the address. Please try again.",
          variant: "destructive",
        });
      });
  };

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
          <div className="flex items-center gap-3 w-full">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">User Profile</h1>
                {/* ランキングを表示（すべてのランク） */}
                {userStats.rank && <RankBadge rank={userStats.rank} />}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-lg text-muted-foreground">
                  {truncateAddress(walletAddress, 5, 5)}
                </p>
                <button
                  onClick={handleCopyWalletAddress}
                  className={`p-1 rounded-full hover:bg-black/10 transition-colors ${
                    copied ? "text-green-500" : "text-muted-foreground"
                  }`}
                  aria-label="Copy wallet address"
                >
                  <Clipboard className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* 右側のランキング表示を削除 */}
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

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`rounded-lg p-4 text-center relative cursor-help transform transition-all duration-300 ${
                    userStats.rank && userStats.rank <= 3
                      ? "hover:scale-105"
                      : "hover:bg-primary/20"
                  } ${getTotalPlaysCardStyle(userStats.rank)}`}
                >
                  <div
                    className={`text-3xl ${getTotalPlaysTextStyle(
                      userStats.rank
                    )}`}
                  >
                    {userStats.totalPlays?.toLocaleString() || 0}
                  </div>
                  <div
                    className={`text-sm ${
                      userStats.rank && userStats.rank <= 3
                        ? "text-white"
                        : "text-muted-foreground"
                    } mt-1`}
                  >
                    Total Plays
                  </div>
                  {userStats.rank && userStats.rank <= 3 && (
                    <div className="absolute -top-5 sm:-top-4 md:-top-3 -right-3 transform scale-125">
                      <RankBadge rank={userStats.rank} />
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {userStats.rank ? (
                  <p>全ユーザー中、再生数ランキング {userStats.rank}位</p>
                ) : (
                  <p>ランキング情報がありません</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

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
