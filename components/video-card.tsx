"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Heart, MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";

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
    };
    creator?: string; // 動画作成者
    isLiked?: boolean;
    commentCount?: number; // コメント数（現在のAPIには存在しないがUIとして表示）
  };
  onPlayTrack: (track: any) => void;
};

export function VideoCard({ video, onPlayTrack }: VideoCardProps) {
  const [isLiked, setIsLiked] = useState(video.isLiked || false);
  const [likeCount, setLikeCount] = useState(video.likeCount);
  const [isLiking, setIsLiking] = useState(false);
  const { toast } = useToast();
  const { authenticated, login } = usePrivy();
  const { wallets } = useSolanaWallets();

  // クリエイターアドレスを省略表示する関数
  const formatCreatorAddress = (address: string | undefined) => {
    if (!address) return "Unknown";
    if (address.length <= 12) return address;
    return `${address.substring(0, 3)}...${address.substring(
      address.length - 3
    )}`;
  };

  const handlePlay = async () => {
    onPlayTrack(video);

    // Update play count in the database
    try {
      await fetch(`/api/videos/${video.id}/play`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Error updating play count:", error);
    }
  };

  const handleLike = async () => {
    if (!authenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like videos",
        duration: 3000,
      });
      login();
      return;
    }

    // Check if we have a Solana wallet
    if (!wallets || wallets.length === 0) {
      toast({
        title: "Wallet Required",
        description: "Please connect your Solana wallet to like videos",
        duration: 3000,
      });
      return;
    }

    const walletAddress = wallets[0]?.address;
    if (!walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your Solana wallet to like videos",
        duration: 3000,
      });
      return;
    }

    try {
      setIsLiking(true);
      const action = isLiked ? "unlike" : "like";

      const response = await fetch(`/api/videos/${video.id}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "wallet-address": walletAddress,
        },
      });

      if (!response.ok) throw new Error("Failed to update like status");

      // Toggle local state
      setIsLiked(!isLiked);
      setLikeCount((prevCount) => (isLiked ? prevCount - 1 : prevCount + 1));
    } catch (error) {
      console.error("Error updating like status:", error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="flex flex-row h-full">
        {/* 左側のサムネイルエリア - カード幅の約40%を占める */}
        <div
          className="w-2/5 bg-secondary/10 flex items-center justify-center cursor-pointer relative"
          onClick={handlePlay}
        >
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play size={48} className="text-muted-foreground/50" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40">
            <Play size={48} className="text-white" />
          </div>
        </div>

        {/* 右側のコンテンツエリア - カード幅の約60%を占める */}
        <div className="w-3/5 flex flex-col relative">
          {/* いいねボタン - 絶対位置で右上に固定 */}
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 absolute top-2 right-2 rounded-full ${
              isLiked ? "text-red-500" : ""
            }`}
            onClick={handleLike}
            disabled={isLiking}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            <span className="sr-only">Like</span>
          </Button>

          <CardHeader className="pb-1 pt-3 px-4">
            <div className="pr-10">
              {" "}
              {/* いいねボタンのスペースを確保 */}
              <CardTitle className="text-lg line-clamp-1">
                {video.title}
              </CardTitle>
              <CardDescription className="text-xs">
                Creator :{" "}
                {formatCreatorAddress(video.creator || video.token.symbol)}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-4 pt-0">
            <div className="text-sm text-muted-foreground mb-auto min-h-[4.5rem]">
              <p className="line-clamp-3 whitespace-pre-line">
                {video.description || "No description available"}
              </p>
            </div>
          </CardContent>
        </div>
      </div>

      {/* カード下部の統計情報 - Playボタンを削除し、3つの情報を均等に表示 */}
      <CardFooter className="p-2 grid grid-cols-3 gap-2 text-sm border-t">
        <div>
          <p className="text-muted-foreground text-xs">Views</p>
          <p className="font-medium">{video.playCount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Likes</p>
          <p className="font-medium">{likeCount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Comments</p>
          <p className="font-medium">
            {(video.commentCount || 0).toLocaleString()}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
