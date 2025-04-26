"use client";

import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Heart } from "lucide-react";
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
    isLiked?: boolean;
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
    <Card className="overflow-hidden flex flex-col">
      <div
        className="relative aspect-video cursor-pointer bg-secondary/20"
        onClick={handlePlay}
      >
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="object-cover w-full h-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Play size={48} className="text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40">
          <Play size={48} className="text-white" />
        </div>
      </div>
      <CardContent className="p-4 flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full overflow-hidden bg-secondary flex-shrink-0">
            {video.token.logo ? (
              <img
                src={video.token.logo}
                alt={video.token.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-logo.svg";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs">
                {video.token.symbol.substring(0, 2)}
              </div>
            )}
          </div>
          <h3 className="font-medium text-sm line-clamp-1">{video.title}</h3>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {video.description}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <div className="text-xs text-muted-foreground flex gap-3">
          <span>{video.token.symbol}</span>
          <span>{video.playCount.toLocaleString()} plays</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 rounded-full ${isLiked ? "text-red-500" : ""}`}
          onClick={handleLike}
          disabled={isLiking}
        >
          <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          <span className="sr-only">Like</span>
          {likeCount > 0 && <span className="ml-1 text-xs">{likeCount}</span>}
        </Button>
      </CardFooter>
    </Card>
  );
}
