"use client";

import React, { useEffect, useState } from "react";
import { VideoCard } from "@/components/video-card";
import { formatMarketCap, truncateAddress } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { Trophy, Clipboard } from "lucide-react";

type TokenDetailProps = {
  params: {
    mint: string;
  };
};

type TokenDetail = {
  id: string;
  mint: string;
  name: string;
  symbol: string;
  description: string | null;
  logo: string | null;
  marketCap: number | null;
  telegramLink: string | null;
  websiteLink: string | null;
  twitterLink: string | null;
  creator: {
    username: string;
    walletAddress: string;
  } | null;
  _count: {
    videos: number;
  };
  videoStats: {
    totalPlays: number;
    totalLikes: number;
    rank?: number; // ランキング情報を追加
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

export default function TokenDetailPage({ params }: TokenDetailProps) {
  const [token, setToken] = useState<TokenDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false); // コピー状態のフラグ
  // Unwrap parameters using React.use()
  const mintParam = React.use(params);
  const mint = mintParam.mint;

  // クリップボードにコピーする機能
  const handleCopyCreatorAddress = (address: string) => {
    navigator.clipboard
      .writeText(address)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((error) => {
        console.error("Failed to copy address:", error);
      });
  };

  // Handler function for playing tracks
  const handlePlayTrack = (track: any) => {
    // Use the existing functionality
    (window as any).playTrack?.(track);
  };

  useEffect(() => {
    async function fetchTokenDetail() {
      try {
        const response = await fetch(`/api/tokens/mint/${mint}`);
        if (!response.ok) throw new Error("Failed to fetch token details");
        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error("Error fetching token details:", error);
      } finally {
        setLoading(false);
      }
    }

    if (mint) {
      fetchTokenDetail();
    }
  }, [mint]);

  if (loading) {
    return (
      <div className="h-full p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-secondary/30 rounded-lg"></div>
          <div className="h-8 bg-secondary/30 w-1/3 rounded"></div>
          <div className="h-24 bg-secondary/30 rounded"></div>
          <div className="h-12 bg-secondary/30 w-1/4 rounded"></div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="h-full p-4 md:p-8 flex items-center justify-center max-w-7xl mx-auto">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Token Not Found</h1>
          <p className="text-muted-foreground">
            The token you're looking for doesn't exist or has been removed.
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
        {/* Token Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Token Logo - Enlarged size */}
          <div className="w-40 h-40 md:w-48 md:h-48 bg-secondary/10 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
            {token.logo ? (
              <img
                src={token.logo}
                alt={token.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-logo.svg";
                }}
              />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center text-6xl font-bold">
                {token.symbol?.substring(0, 2) || "??"}
              </div>
            )}
          </div>

          {/* Token Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{token.name}</h1>
              {token.videoStats?.rank && (
                <RankBadge rank={token.videoStats.rank} />
              )}
            </div>
            <p className="text-lg text-muted-foreground">${token.symbol}</p>

            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-secondary/20 px-3 py-1 rounded-full">
                <span className="text-sm font-medium">
                  Market Cap: {formatMarketCap(token.marketCap)}
                </span>
              </div>

              <div className="bg-secondary/20 px-3 py-1 rounded-full">
                <span className="text-sm font-medium flex items-center gap-1">
                  Creator:{" "}
                  {token.creator ? (
                    <>
                      <Link
                        href={`/users/${token.creator.walletAddress}`}
                        className="text-[#d4af37] hover:underline"
                      >
                        {`${truncateAddress(token.creator.username, 5, 5)}`}
                      </Link>
                      <button
                        onClick={() =>
                          token.creator &&
                          handleCopyCreatorAddress(token.creator.walletAddress)
                        }
                        className={`p-1 rounded-full hover:bg-black/10 transition-colors ${
                          copied ? "text-green-500" : "text-muted-foreground"
                        }`}
                        aria-label="Copy wallet address"
                      >
                        <Clipboard className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    "Anonymous"
                  )}
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-3">
              {token.websiteLink && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" variant="outline" asChild>
                        <Link
                          href={token.websiteLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          </svg>
                          Website
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Visit Website</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {token.telegramLink && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" variant="outline" asChild>
                        <Link
                          href={token.telegramLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2"
                          >
                            <path d="M21.5 12a9.5 9.5 0 1 1-9.5-9.5 9.5 9.5 0 0 1 9.5 9.5Z" />
                            <path d="m7 15 2.5-2.5M7 9l10 6-5 2-5-8Z" />
                          </svg>
                          Telegram
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Join Telegram Group</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {token.twitterLink && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" variant="outline" asChild>
                        <Link
                          href={token.twitterLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2"
                          >
                            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                          </svg>
                          Twitter
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Follow on Twitter</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Pump.fun link button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 flex items-center gap-1"
                      asChild
                    >
                      <Link
                        href={`https://pump.fun/coin/${mint}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src="/icons/pump-pill.png"
                          alt="Pump.fun"
                          className="w-4 h-4 mr-1"
                        />
                        Pump.fun
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View on Pump.fun</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Video statistics - With rank info tooltip */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">
              {token._count?.videos || 0}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Total Videos
            </div>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`rounded-lg p-4 text-center relative cursor-help transform transition-all duration-300 ${
                    token.videoStats?.rank && token.videoStats.rank <= 3
                      ? "hover:scale-105"
                      : "hover:bg-primary/20"
                  } ${getTotalPlaysCardStyle(token.videoStats?.rank)}`}
                >
                  <div
                    className={`text-3xl ${getTotalPlaysTextStyle(
                      token.videoStats?.rank
                    )}`}
                  >
                    {token.videoStats?.totalPlays?.toLocaleString() || 0}
                  </div>
                  <div
                    className={`text-sm ${
                      token.videoStats?.rank && token.videoStats.rank <= 3
                        ? "text-white"
                        : "text-muted-foreground"
                    } mt-1`}
                  >
                    Total Plays
                  </div>
                  {token.videoStats?.rank && token.videoStats.rank <= 3 && (
                    <div className="absolute -top-5 sm:-top-4 md:-top-3 -right-3 transform scale-125">
                      <RankBadge rank={token.videoStats.rank} />
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {token.videoStats?.rank ? (
                  <p>
                    全トークン中、再生数ランキング {token.videoStats.rank}位
                  </p>
                ) : (
                  <p>ランキング情報がありません</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">
              {token.videoStats?.totalLikes?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Total Likes
            </div>
          </div>
        </div>

        {/* Token Description */}
        <div className="bg-[#2a1a3e] p-4 rounded-lg hover:bg-[#3a2a4e] transition-colors">
          <h2 className="text-xl font-semibold mb-2">About</h2>
          <p className="whitespace-pre-line">
            {token.description || "No description available for this token."}
          </p>
        </div>
      </section>

      {/* Token Videos */}
      <section className="space-y-4 py-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Videos</h2>
        </div>
        <CustomTokenVideos
          tokenId={token.id}
          mint={mint}
          onPlayTrack={handlePlayTrack}
        />
      </section>
    </div>
  );
}

// Alternative video display component
function CustomTokenVideos({
  tokenId,
  mint,
  onPlayTrack,
}: {
  tokenId: string;
  mint: string;
  onPlayTrack: (track: any) => void;
}) {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Use the mint passed from the parent component
  useEffect(() => {
    async function fetchTokenVideos() {
      try {
        // Fetch videos using mint address
        const response = await fetch(`/api/tokens/mint/${mint}/videos`);
        if (!response.ok) throw new Error("Failed to fetch token videos");
        const data = await response.json();
        setVideos(data.videos);
      } catch (error) {
        console.error("Error fetching token videos:", error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    }

    if (mint) {
      fetchTokenVideos();
    }
  }, [mint]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-[9/16] bg-secondary/30 animate-pulse rounded-lg h-[180px] sm:h-[200px] md:h-[220px] lg:h-[240px]"></div>
            <div className="h-4 bg-secondary/30 animate-pulse rounded w-2/3"></div>
            <div className="h-3 bg-secondary/30 animate-pulse rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12 bg-secondary/10 rounded-lg">
        <p className="text-muted-foreground">
          No videos available for this token
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {videos.map((video) => (
        <div key={video.id} className="h-auto">
          <VideoCard
            video={video}
            onPlayTrack={onPlayTrack}
            tokenContext={{ mintAddress: mint }}
          />
        </div>
      ))}
    </div>
  );
}
