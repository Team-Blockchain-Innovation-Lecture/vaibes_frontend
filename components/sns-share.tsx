"use client";

import React, { useState } from "react";
import { Twitter, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface SNSShareProps {
  video: {
    id: string;
    title: string;
    description?: string | null;
    url: string;
    thumbnailUrl?: string | null;
  };
  className?: string;
  variant?: "mobile" | "desktop";
}

export function SNSShare({ video, className = "", variant = "desktop" }: SNSShareProps) {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  // Generate video URL
  const videoUrl = `${window.location.origin}/videos/${video.id}`;
  
  // Generate share text (more attractive text)
  const shareText = `${video.title}${video.description ? ` - ${video.description}` : ""} 🎬✨ Check out this amazing video on vaibesdotfun! #vaibesdotfun #video`;
  
  // Hashtags
  const hashtags = "vaibes,blockchain,video,web3";

  // Share on X (Twitter)
  const shareOnTwitter = async () => {
    try {
      setIsSharing(true);
      
      // Twitter Web Intent URL (supports video embedding)
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(videoUrl)}&hashtags=${hashtags}`;
      
      // Open in a new window
      const popup = window.open(twitterUrl, '_blank', 'width=600,height=500,scrollbars=yes,resizable=yes');
      
      if (popup) {
        // Handle case where popup is blocked
        popup.focus();
      } else {
        // If popup is blocked, open in a new tab
        window.open(twitterUrl, '_blank');
      }
      
      toast({
        title: "Share on X (Twitter)",
        description: "Shared to X (Twitter)! The video will be embedded.",
        variant: "default",
      });
    } catch (error) {
      console.error("Twitter share error:", error);
      toast({
        title: "Error",
        description: "Failed to share to X (Twitter).",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  // copy link
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl);
      toast({
        title: "Link Copied",
        description: "Video link copied to clipboard.",
        variant: "default",
      });
    } catch (error) {
      console.error("Copy link error:", error);
      toast({
        title: "Error",
        description: "Failed to copy link.",
        variant: "destructive",
      });
    }
  };

  // Compact layout for mobile
  if (variant === "mobile") {
    return (
      <div className={`flex flex-col items-center gap-4 ${className}`}>
        <div className="flex flex-col items-center">
          <button
            onClick={shareOnTwitter}
            disabled={isSharing}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white"
            aria-label="Share on X (Twitter)"
          >
            <Twitter className="w-6 h-6" />
          </button>
          <span className="text-xs mt-1 text-white">X</span>
        </div>

        <div className="flex flex-col items-center">
          <button
            onClick={copyLink}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white"
            aria-label="Copy link"
          >
            <LinkIcon className="w-6 h-6" />
          </button>
          <span className="text-xs mt-1 text-white">Copy</span>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        onClick={shareOnTwitter}
        disabled={isSharing}
        size="sm"
        variant="outline"
        className="bg-[#2a1a3e] border-[#3a2a4e] text-white hover:bg-[#3a2a4e] hover:text-white flex items-center gap-2"
      >
        <Twitter className="w-4 h-4" />
        X (Twitter)
      </Button>

      <Button
        onClick={copyLink}
        size="sm"
        variant="outline"
        className="bg-[#2a1a3e] border-[#3a2a4e] text-white hover:bg-[#3a2a4e] hover:text-white flex items-center gap-2"
      >
        <LinkIcon className="w-4 h-4" />
        Copy Link
      </Button>
    </div>
  );
} 