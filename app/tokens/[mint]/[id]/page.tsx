"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronUp,
  ChevronDown,
  Play,
  Pause,
  Heart,
  MessageSquare,
  Send,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

type Video = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  thumbnailUrl: string | null;
  playCount: number;
  likeCount: number;
  prompt: string | null;
  creator: string;
  token: {
    id: string;
    name: string;
    symbol: string;
    logo: string | null;
    marketCap: number | null;
  };
  isLiked?: boolean;
};

export default function TokenVideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { authenticated, login } = usePrivy();
  const { wallets } = useSolanaWallets();
  const isMobile = useIsMobile();

  const [video, setVideo] = useState<Video | null>(null);
  const [prevVideo, setPrevVideo] = useState<string | null>(null);
  const [nextVideo, setNextVideo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);

  // Comment state
  const [comments, setComments] = useState<any[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loadingComments, setLoadingComments] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isNavigatingRef = useRef<boolean>(false);

  // Mobile tabs state
  const [mobileActiveTab, setMobileActiveTab] = useState<string>("video");

  // Get mint address and video ID from params
  const videoId = params.id as string;
  const mintAddress = params.mint as string;

  // Load video data
  useEffect(() => {
    async function fetchVideo() {
      try {
        setLoading(true);

        // Get the wallet address from the first wallet if available
        const walletAddress = wallets?.[0]?.address || null;

        const response = await fetch(
          `/api/videos/${videoId}?walletAddress=${walletAddress}&tokenMint=${mintAddress}`
        );
        if (!response.ok) throw new Error("Failed to fetch video");

        const data = await response.json();
        setVideo(data.video);
        setIsLiked(data.video.isLiked || false);

        // Set previous and next videos in the token context
        setPrevVideo(data.prevVideoId);
        setNextVideo(data.nextVideoId);
      } catch (error) {
        console.error("Error fetching video:", error);
        toast({
          title: "Error",
          description: "Failed to load video. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchVideo();
  }, [videoId, mintAddress, wallets, toast]);

  // Format time helper (converts seconds to MM:SS format)
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Format creator address to show only first 3 and last 3 characters
  const formatCreatorAddress = (address: string): string => {
    if (!address) return "";
    if (address.length <= 8) return address;

    return `${address.substring(0, 3)}...${address.substring(
      address.length - 3
    )}`;
  };

  // Video event handlers
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      if (!isDragging && videoElement) {
        const currentProgress =
          (videoElement.currentTime / videoElement.duration) * 100 || 0;

        if (!isNaN(currentProgress)) {
          setProgress(currentProgress);
          setCurrentTime(formatTime(videoElement.currentTime));
        }
      }
    };

    const handleLoadedMetadata = () => {
      if (!isNaN(videoElement.duration)) {
        setDuration(formatTime(videoElement.duration));
      }

      setProgress(0);
      setCurrentTime(formatTime(0));
    };

    const handleVideoEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      if (videoElement) videoElement.currentTime = 0;
    };

    videoElement.removeEventListener("timeupdate", handleTimeUpdate);
    videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
    videoElement.removeEventListener("ended", handleVideoEnded);

    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    videoElement.addEventListener("ended", handleVideoEnded);

    if (videoElement.readyState >= 1) {
      if (!isNaN(videoElement.duration)) {
        setDuration(formatTime(videoElement.duration));
      }

      if (videoElement.currentTime > 0) {
        handleTimeUpdate();
      }
    }

    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.removeEventListener("ended", handleVideoEnded);
    };
  }, [isDragging]);

  // Add video play/pause event listeners
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleCanPlay = () => {
      console.log("Video can play now");
    };

    const handleError = (e: any) => {
      console.error("Video error event:", e);
    };

    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("pause", handlePause);
    videoElement.addEventListener("canplay", handleCanPlay);
    videoElement.addEventListener("error", handleError);

    return () => {
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("pause", handlePause);
      videoElement.removeEventListener("canplay", handleCanPlay);
      videoElement.removeEventListener("error", handleError);
    };
  }, []);

  // Try to auto-play muted video when component mounts
  useEffect(() => {
    if (video && videoRef.current) {
      const attemptPlay = async () => {
        try {
          videoRef.current.muted = true;
          await videoRef.current.play();

          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.muted = false;
            }
          }, 100);

          setIsPlaying(true);
        } catch (error) {
          console.error("Auto-play failed:", error);
          if (videoRef.current) {
            videoRef.current.muted = false;
          }
        }
      };

      const handleCanPlay = () => {
        attemptPlay();
      };

      videoRef.current.addEventListener("canplay", handleCanPlay, {
        once: true,
      });

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener("canplay", handleCanPlay);
        }
      };
    }
  }, [video]);

  // Toggle video play/pause with improved error handling
  const togglePlay = () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = videoRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch((error) => {
              console.error("Error playing video:", error);
              videoRef.current!.muted = true;
              videoRef
                .current!.play()
                .then(() => {
                  setTimeout(() => {
                    if (videoRef.current) {
                      videoRef.current.muted = false;
                      setIsPlaying(true);
                    }
                  }, 100);
                })
                .catch((mutedError) => {
                  console.error("Even muted playback failed:", mutedError);
                  setIsPlaying(false);
                });
            });
        }
      }
    } catch (error) {
      console.error("Unexpected error in togglePlay:", error);
      setIsPlaying(false);
    }
  };

  // Progress bar interaction handlers
  const handleProgressBarClick = (e: React.MouseEvent) => {
    if (!videoRef.current || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentage = (clickPosition / rect.width) * 100;
    const newTime = (percentage / 100) * videoRef.current.duration;

    videoRef.current.currentTime = newTime;
    setProgress(percentage);
    setCurrentTime(formatTime(newTime));
  };

  const handleProgressBarMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleProgressBarClick(e);
  };

  const handleProgressBarMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !videoRef.current || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = Math.max(
      0,
      Math.min(e.clientX - rect.left, rect.width)
    );
    const percentage = (clickPosition / rect.width) * 100;
    setProgress(percentage);
    setCurrentTime(formatTime((percentage / 100) * videoRef.current.duration));
  };

  const handleProgressBarMouseUp = () => {
    if (!isDragging || !videoRef.current) return;

    const newTime = (progress / 100) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
    setIsDragging(false);
  };

  // Navigation between videos - stays within token context
  const goToPreviousVideo = () => {
    if (prevVideo) {
      router.push(`/tokens/${mintAddress}/${prevVideo}`);
    }
  };

  const goToNextVideo = () => {
    if (nextVideo) {
      router.push(`/tokens/${mintAddress}/${nextVideo}`);
    }
  };

  // Handle swipe and wheel navigation in video area
  useEffect(() => {
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchEndY - touchStartY;

      if (Math.abs(deltaY) > 50) {
        if (deltaY > 0 && prevVideo) {
          goToPreviousVideo();
        } else if (deltaY < 0 && nextVideo) {
          goToNextVideo();
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (!videoContainerRef.current?.contains(e.target as Node)) return;
      if (isNavigatingRef.current) return;

      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }

      isNavigatingRef.current = true;

      if (Math.abs(e.deltaY) < 20) {
        isNavigatingRef.current = false;
        return;
      }

      wheelTimeoutRef.current = setTimeout(() => {
        if (e.deltaY > 0 && nextVideo) {
          goToNextVideo();
        } else if (e.deltaY < 0 && prevVideo) {
          goToPreviousVideo();
        }

        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 500);
      }, 150);
    };

    const videoContainer = videoContainerRef.current;

    if (videoContainer) {
      videoContainer.addEventListener("touchstart", handleTouchStart);
      videoContainer.addEventListener("touchend", handleTouchEnd);
      videoContainer.addEventListener("wheel", handleWheel, { passive: false });

      if (videoRef.current) {
        videoRef.current.addEventListener("wheel", handleWheel, {
          passive: false,
        });
      }

      if (progressBarRef.current) {
        progressBarRef.current.addEventListener(
          "wheel",
          (e) => {
            handleWheel(e);
          },
          { passive: false }
        );
      }
    }

    return () => {
      if (videoContainer) {
        videoContainer.removeEventListener("touchstart", handleTouchStart);
        videoContainer.removeEventListener("touchend", handleTouchEnd);
        videoContainer.removeEventListener("wheel", handleWheel);
      }

      if (videoRef.current) {
        videoRef.current.removeEventListener("wheel", handleWheel);
      }

      if (progressBarRef.current) {
        progressBarRef.current.removeEventListener("wheel", handleWheel);
      }

      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
    };
  }, [prevVideo, nextVideo, goToPreviousVideo, goToNextVideo]);

  // Global wheel event handler
  useEffect(() => {
    function globalWheelHandler(e: WheelEvent) {
      if (!videoContainerRef.current?.contains(e.target as Node)) return;

      e.preventDefault();
      e.stopPropagation();

      if (isNavigatingRef.current) return;

      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }

      if (Math.abs(e.deltaY) < 20) return;

      isNavigatingRef.current = true;

      if (e.deltaY > 0 && nextVideo) {
        goToNextVideo();
      } else if (e.deltaY < 0 && prevVideo) {
        goToPreviousVideo();
      }

      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 500);
    }

    if (typeof document !== "undefined") {
      document.addEventListener("wheel", globalWheelHandler, {
        passive: false,
        capture: true,
      });

      return () => {
        document.removeEventListener("wheel", globalWheelHandler, {
          capture: true,
        });
      };
    }

    return () => {};
  }, [prevVideo, nextVideo, goToNextVideo, goToPreviousVideo]);

  // Handle liking videos
  const handleLike = async () => {
    if (!authenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to like videos",
        variant: "default",
      });
      login();
      return;
    }

    if (!video) return;

    try {
      const endpoint = isLiked ? "unlike" : "like";
      const walletAddress = wallets?.[0]?.address;

      if (!walletAddress) {
        toast({
          title: "Wallet required",
          description: "Please connect a wallet to like videos",
          variant: "default",
        });
        return;
      }

      const response = await fetch(`/api/videos/${video.id}/${endpoint}`, {
        method: "POST",
        headers: {
          "wallet-address": walletAddress,
        },
      });

      if (!response.ok) throw new Error(`Failed to ${endpoint} video`);

      setIsLiked(!isLiked);
      setVideo((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          likeCount: isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
          isLiked: !isLiked,
        };
      });

      toast({
        title: isLiked ? "Video unliked" : "Video liked",
        description: isLiked
          ? "You removed your like from this video"
          : "You liked this video",
        variant: "default",
      });
    } catch (error) {
      console.error(`Error ${isLiked ? "unliking" : "liking"} video:`, error);
      toast({
        title: "Error",
        description: `Failed to ${
          isLiked ? "unlike" : "like"
        } video. Please try again.`,
        variant: "destructive",
      });
    }
  };

  // Format market cap for display
  const formatMarketCap = (marketCap: number | null | undefined): string => {
    if (marketCap === null || marketCap === undefined) return "N/A";

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

  // Fetch comments for the video
  useEffect(() => {
    async function fetchComments() {
      if (!video) return;

      try {
        setLoadingComments(true);
        const response = await fetch(`/api/videos/${video.id}/comments`);

        if (!response.ok) throw new Error("Failed to fetch comments");

        const data = await response.json();
        setComments(data.comments);
        setCommentCount(data.comments.length);
      } catch (error) {
        console.error("Error fetching comments:", error);
        toast({
          title: "Error",
          description: "Failed to load comments. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingComments(false);
      }
    }

    fetchComments();
  }, [video, toast]);

  // Handle adding a new comment
  const handleAddComment = async () => {
    if (!authenticated || !video) return;

    try {
      setLoadingComments(true);
      const walletAddress = wallets?.[0]?.address;

      if (!walletAddress) {
        toast({
          title: "Wallet required",
          description: "Please connect a wallet to comment",
          variant: "default",
        });
        return;
      }

      const response = await fetch(`/api/videos/${video.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
          userAddress: walletAddress,
        }),
      });

      if (!response.ok) throw new Error("Failed to add comment");

      const data = await response.json();

      // Refresh comments
      const commentsResponse = await fetch(`/api/videos/${video.id}/comments`);
      const commentsData = await commentsResponse.json();

      setComments(commentsData.comments);
      setCommentCount(commentsData.comments.length);
      setNewComment("");

      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingComments(false);
    }
  };

  // Handle reply button click
  const handleReplyClick = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyText("");
  };

  // Handle canceling a reply
  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText("");
  };

  // Handle adding a reply to a comment
  const handleAddReply = async () => {
    if (!authenticated || !video || !replyingTo) return;

    try {
      setLoadingComments(true);
      const walletAddress = wallets?.[0]?.address;

      if (!walletAddress) {
        toast({
          title: "Wallet required",
          description: "Please connect a wallet to reply",
          variant: "default",
        });
        return;
      }

      const response = await fetch(`/api/videos/${video.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: replyText,
          userAddress: walletAddress,
          parentId: replyingTo,
        }),
      });

      if (!response.ok) throw new Error("Failed to add reply");

      // Refresh comments
      const commentsResponse = await fetch(`/api/videos/${video.id}/comments`);
      const commentsData = await commentsResponse.json();

      setComments(commentsData.comments);
      setCommentCount(commentsData.comments.length);
      setReplyText("");
      setReplyingTo(null);

      toast({
        title: "Reply added",
        description: "Your reply has been added successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error adding reply:", error);
      toast({
        title: "Error",
        description: "Failed to add reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingComments(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a0e26]">
        <div className="animate-spin h-10 w-10 border-4 border-[#d4af37] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a0e26] p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Video not found</h2>
        <p className="mb-6 text-white/70">
          The video you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => router.push(`/tokens/${mintAddress}`)}
          className="px-4 py-2 bg-[#d4af37] text-black rounded-md hover:bg-[#c39f35]"
        >
          Return to Token Page
        </button>
      </div>
    );
  }

  // Mobile view rendering
  if (isMobile) {
    return (
      <div className="fixed inset-0 flex flex-col bg-[#1a0e26] pt-16">
        {/* Mobile Tab Navigation - pt-16でヘッダーとの被りを解消 */}
        <div className="w-full mt-2 bg-[#1a0e26] border-b border-white/10 z-20">
          <Tabs
            value={mobileActiveTab}
            onValueChange={setMobileActiveTab}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="video">Video</TabsTrigger>
              <TabsTrigger value="information">Information</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Mobile Content Area */}
        {mobileActiveTab === "video" ? (
          // Video View - 高さを調整し画面いっぱいに表示
          <div
            ref={videoContainerRef}
            className="relative flex-1 flex items-center justify-center bg-black"
            style={{ height: "calc(100vh - 120px)" }} // ヘッダー+タブ分の高さを引く
          >
            {/* Video Player */}
            <div className="relative w-full h-full max-h-full flex items-center justify-center">
              <video
                ref={videoRef}
                src={video.url}
                className="h-full max-h-full w-auto object-contain cursor-pointer"
                playsInline
                onClick={togglePlay}
                onError={(e) => console.error("Video error:", e)}
                preload="auto"
                controls={false}
                muted={false}
              />

              {/* Play Button Overlay */}
              {!isPlaying && (
                <div
                  className="absolute inset-0 flex items-center justify-center cursor-pointer"
                  onClick={togglePlay}
                >
                  <div className="p-4 bg-black/30 rounded-full">
                    <Play size={40} className="text-white" />
                  </div>
                </div>
              )}
            </div>

            {/* Progress Bar - 中央に均等に配置 */}
            <div className="absolute bottom-6 left-4 right-4 mx-auto z-10">
              <div className="flex justify-between text-xs text-white/80 mb-1">
                <span>{currentTime}</span>
                <span>{duration}</span>
              </div>
              <div
                ref={progressBarRef}
                className="h-2 bg-white/20 rounded-full cursor-pointer"
                onClick={handleProgressBarClick}
                onMouseDown={handleProgressBarMouseDown}
                onMouseMove={handleProgressBarMouseMove}
                onMouseUp={handleProgressBarMouseUp}
                onMouseLeave={handleProgressBarMouseUp}
              >
                <div
                  className="h-full bg-[#d4af37] rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Mobile Navigation Buttons */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-10">
              {prevVideo && (
                <button
                  onClick={goToPreviousVideo}
                  className="p-2 bg-black/40 hover:bg-black/60 rounded-full"
                  aria-label="Previous video"
                >
                  <ChevronUp size={24} className="text-white" />
                </button>
              )}

              {nextVideo && (
                <button
                  onClick={goToNextVideo}
                  className="p-2 bg-black/40 hover:bg-black/60 rounded-full"
                  aria-label="Next video"
                >
                  <ChevronDown size={24} className="text-white" />
                </button>
              )}
            </div>

            {/* Mobile Floating Action Buttons */}
            <div className="absolute bottom-20 right-4 flex flex-col items-center gap-4 z-20">
              <div className="flex flex-col items-center">
                <button
                  onClick={handleLike}
                  className={`p-2 rounded-full bg-black/40 hover:bg-black/60 ${
                    isLiked ? "text-pink-500" : "text-white"
                  }`}
                  aria-label={isLiked ? "Unlike video" : "Like video"}
                >
                  <Heart
                    className={`w-6 h-6 ${isLiked ? "fill-pink-500" : ""}`}
                  />
                </button>
                <span className="text-xs mt-1 text-white">
                  {video.likeCount.toLocaleString()}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="p-2 rounded-full bg-black/40">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs mt-1 text-white">
                  {video.playCount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ) : (
          // Information View
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Title and Creator */}
            <div>
              <h1 className="text-2xl font-bold mb-1">{video.title}</h1>
              <p className="text-white/70">
                by {formatCreatorAddress(video.creator)}
              </p>
            </div>

            {/* Interactive Elements */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className={`p-2 rounded-full hover:bg-black/20 ${
                    isLiked ? "text-pink-500" : "text-white"
                  }`}
                  aria-label={isLiked ? "Unlike video" : "Like video"}
                >
                  <Heart
                    className={`w-6 h-6 ${isLiked ? "fill-pink-500" : ""}`}
                  />
                </button>
                <span>{video.likeCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Play className="w-5 h-5" />
                <span>{video.playCount.toLocaleString()}</span>
              </div>
            </div>

            {/* Token Information */}
            <div className="bg-[#2a1a3e] p-4 rounded-lg hover:bg-[#3a2a4e] transition-colors">
              <div className="flex items-center gap-3 mb-3">
                {video.token.logo ? (
                  <div className="relative w-12 h-12 overflow-hidden rounded-full">
                    <Image
                      src={video.token.logo}
                      alt={video.token.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/placeholder-logo.svg";
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-secondary flex items-center justify-center text-xl font-bold rounded-full">
                    {video.token.symbol?.substring(0, 2) || "??"}
                  </div>
                )}
                <div>
                  <h3 className="font-bold">{video.token.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#d4af37]">
                      ${video.token.symbol}
                    </span>
                    <span className="text-sm font-semibold text-[#d4af37]">
                      {formatMarketCap(video.token.marketCap)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs for Information/Comments */}
            <Tabs defaultValue="information" className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-4">
                <TabsTrigger value="information">Information</TabsTrigger>
                <TabsTrigger value="comments">
                  Comments ({commentCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="information" className="space-y-4">
                {/* Video Information */}
                {video.description && (
                  <div>
                    <h3 className="text-sm font-medium uppercase text-white/60 mb-1">
                      Description
                    </h3>
                    <p className="text-white/90 whitespace-pre-wrap">
                      {video.description}
                    </p>
                  </div>
                )}

                {video.prompt && (
                  <div>
                    <h3 className="text-sm font-medium uppercase text-white/60 mb-1">
                      Prompt
                    </h3>
                    <p className="text-white/90 whitespace-pre-wrap">
                      {video.prompt}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="comments" className="space-y-4">
                {/* Add Comment Section (if logged in) */}
                {authenticated ? (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="bg-[#2a1a3e] border-[#3a2a4e] resize-none"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleAddComment}
                        size="sm"
                        className="bg-[#d4af37] text-black hover:bg-[#c39f35]"
                        disabled={!newComment.trim() || loadingComments}
                      >
                        Comment
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#2a1a3e] p-4 rounded-lg text-center">
                    <p className="text-white/70 mb-2">Sign in to comment</p>
                    <Button
                      onClick={login}
                      size="sm"
                      className="bg-[#d4af37] text-black hover:bg-[#c39f35]"
                    >
                      Sign In
                    </Button>
                  </div>
                )}

                {/* Comments List */}
                {loadingComments ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin h-6 w-6 border-2 border-[#d4af37] border-t-transparent rounded-full"></div>
                  </div>
                ) : comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="border-b border-white/10 pb-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-1 text-sm">
                            <p className="font-medium text-white/90">
                              {comment.userAddress.substring(0, 5)}...
                            </p>
                            <span className="text-white/40">•</span>
                            <p className="text-white/60">
                              {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <p className="mb-2 text-white/90 text-sm">
                          {comment.content}
                        </p>

                        {/* Reply Button */}
                        {authenticated && (
                          <button
                            onClick={() => handleReplyClick(comment.id)}
                            className="text-xs text-white/60 hover:text-white flex items-center gap-1"
                          >
                            <MessageSquare size={12} /> Reply
                          </button>
                        )}

                        {/* Reply Input (if replying to this comment) */}
                        {replyingTo === comment.id && (
                          <div className="mt-3 space-y-2 pl-4 border-l-2 border-[#3a2a4e]">
                            <Textarea
                              placeholder="Write a reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="bg-[#2a1a3e] border-[#3a2a4e] resize-none text-sm"
                            />
                            <div className="flex gap-2 justify-end">
                              <Button
                                onClick={() => handleCancelReply()}
                                size="sm"
                                variant="outline"
                                className="text-xs h-8 border-[#3a2a4e] text-white/70 hover:bg-[#3a2a4e] hover:text-white"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleAddReply}
                                size="sm"
                                className="bg-[#d4af37] text-black hover:bg-[#c39f35] text-xs h-8"
                                disabled={!replyText.trim() || loadingComments}
                              >
                                Reply
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 pl-4 border-l-2 border-[#3a2a4e] space-y-3">
                            {comment.replies.map((reply: any) => (
                              <div key={reply.id} className="pb-2">
                                <div className="flex items-center gap-1 text-xs mb-1">
                                  <p className="font-medium text-white/90">
                                    {reply.userAddress.substring(0, 5)}...
                                  </p>
                                  <span className="text-white/40">•</span>
                                  <p className="text-white/60">
                                    {new Date(reply.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                <p className="text-xs text-white/90">
                                  {reply.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#2a1a3e] p-4 rounded-lg text-center">
                    <p className="text-white/70">
                      No comments yet. Be the first to comment!
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Add some extra padding at the bottom for better scroll experience */}
            <div className="h-10"></div>
          </div>
        )}
      </div>
    );
  }

  // Desktop view
  return (
    <div className="fixed inset-0 flex flex-col md:flex-row bg-[#1a0e26] pt-14">
      {/* Video Area */}
      <div
        ref={videoContainerRef}
        className="fixed md:relative inset-0 md:inset-auto md:flex-1 flex items-center justify-center bg-black"
        style={{
          height: "calc(100% - 30px)",
          width: "100%",
          top: "30px",
          maxWidth: "calc(100% - 400px)",
        }}
      >
        {/* Video Player */}
        <div className="relative w-full h-full max-h-full flex items-center justify-center">
          <video
            ref={videoRef}
            src={video.url}
            className="h-full max-h-full w-auto object-contain cursor-pointer"
            playsInline
            onClick={togglePlay}
            onError={(e) => console.error("Video error:", e)}
            preload="auto"
            controls={false}
            muted={false}
          />

          {/* Play Button Overlay */}
          {!isPlaying && (
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              onClick={togglePlay}
            >
              <div className="p-4 bg-black/30 rounded-full">
                <Play size={40} className="text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div
          className="absolute bottom-6 left-4 right-4 mx-auto max-w-[500px] z-10"
          onWheel={(e) => {
            e.stopPropagation();
            e.preventDefault();

            if (isNavigatingRef.current) return;
            if (Math.abs(e.deltaY) < 20) return;

            isNavigatingRef.current = true;

            if (e.deltaY > 0 && nextVideo) {
              goToNextVideo();
            } else if (e.deltaY < 0 && prevVideo) {
              goToPreviousVideo();
            }

            setTimeout(() => {
              isNavigatingRef.current = false;
            }, 500);
          }}
        >
          <div className="flex justify-between text-xs text-white/80 mb-1">
            <span>{currentTime}</span>
            <span>{duration}</span>
          </div>
          <div
            ref={progressBarRef}
            className="h-2 bg-white/20 rounded-full cursor-pointer"
            onClick={handleProgressBarClick}
            onMouseDown={handleProgressBarMouseDown}
            onMouseMove={handleProgressBarMouseMove}
            onMouseUp={handleProgressBarMouseUp}
            onMouseLeave={handleProgressBarMouseUp}
          >
            <div
              className="h-full bg-[#d4af37] rounded-full"
              style={{ width: `${progress}%` }}
              onWheel={(e) => {
                e.stopPropagation();
                e.preventDefault();

                if (isNavigatingRef.current) return;
                if (Math.abs(e.deltaY) < 20) return;

                isNavigatingRef.current = true;

                if (e.deltaY > 0 && nextVideo) {
                  goToNextVideo();
                } else if (e.deltaY < 0 && prevVideo) {
                  goToPreviousVideo();
                }

                setTimeout(() => {
                  isNavigatingRef.current = false;
                }, 500);
              }}
            ></div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-10">
          {prevVideo && (
            <button
              onClick={goToPreviousVideo}
              className="p-2 bg-black/40 hover:bg-black/60 rounded-full"
              aria-label="Previous video"
            >
              <ChevronUp size={24} className="text-white" />
            </button>
          )}

          {nextVideo && (
            <button
              onClick={goToNextVideo}
              className="p-2 bg-black/40 hover:bg-black/60 rounded-full"
              aria-label="Next video"
            >
              <ChevronDown size={24} className="text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div
        className="fixed top-0 right-0 bottom-0 w-full md:w-[400px] bg-[#1a0e26] overflow-y-auto"
        style={{
          height: "calc(100vh - 86px)",
          top: "86px",
          zIndex: 10,
          borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="p-5 space-y-6">
          {/* Title and Creator */}
          <div>
            <h1 className="text-2xl font-bold mb-1">{video.title}</h1>
            <p className="text-white/70">
              by {formatCreatorAddress(video.creator)}
            </p>
          </div>

          {/* Interactive Elements */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                className={`p-2 rounded-full hover:bg-black/20 ${
                  isLiked ? "text-pink-500" : "text-white"
                }`}
                aria-label={isLiked ? "Unlike video" : "Like video"}
              >
                <Heart
                  className={`w-6 h-6 ${isLiked ? "fill-pink-500" : ""}`}
                />
              </button>
              <span>{video.likeCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Play className="w-5 h-5" />
              <span>{video.playCount.toLocaleString()}</span>
            </div>
          </div>

          {/* Token Information */}
          <div className="bg-[#2a1a3e] p-4 rounded-lg hover:bg-[#3a2a4e] transition-colors">
            <div className="flex items-center gap-3 mb-3">
              {video.token.logo ? (
                <div className="relative w-12 h-12 overflow-hidden rounded-full">
                  <Image
                    src={video.token.logo}
                    alt={video.token.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder-logo.svg";
                    }}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 bg-secondary flex items-center justify-center text-xl font-bold rounded-full">
                  {video.token.symbol?.substring(0, 2) || "??"}
                </div>
              )}
              <div>
                <h3 className="font-bold">{video.token.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#d4af37]">
                    ${video.token.symbol}
                  </span>
                  <span className="text-sm font-semibold text-[#d4af37]">
                    {formatMarketCap(video.token.marketCap)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs for Information/Comments */}
          <Tabs defaultValue="information" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="information">Information</TabsTrigger>
              <TabsTrigger value="comments">
                Comments ({commentCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="information" className="space-y-4">
              {/* Video Information */}
              {video.description && (
                <div>
                  <h3 className="text-sm font-medium uppercase text-white/60 mb-1">
                    Description
                  </h3>
                  <p className="text-white/90 whitespace-pre-wrap">
                    {video.description}
                  </p>
                </div>
              )}

              {video.prompt && (
                <div>
                  <h3 className="text-sm font-medium uppercase text-white/60 mb-1">
                    Prompt
                  </h3>
                  <p className="text-white/90 whitespace-pre-wrap">
                    {video.prompt}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              {/* Add Comment Section (if logged in) */}
              {authenticated ? (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="bg-[#2a1a3e] border-[#3a2a4e] resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddComment}
                      size="sm"
                      className="bg-[#d4af37] text-black hover:bg-[#c39f35]"
                      disabled={!newComment.trim() || loadingComments}
                    >
                      Comment
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#2a1a3e] p-4 rounded-lg text-center">
                  <p className="text-white/70 mb-2">Sign in to comment</p>
                  <Button
                    onClick={login}
                    size="sm"
                    className="bg-[#d4af37] text-black hover:bg-[#c39f35]"
                  >
                    Sign In
                  </Button>
                </div>
              )}

              {/* Comments List */}
              {loadingComments ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-[#d4af37] border-t-transparent rounded-full"></div>
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="border-b border-white/10 pb-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-1 text-sm">
                          <p className="font-medium text-white/90">
                            {comment.userAddress.substring(0, 5)}...
                          </p>
                          <span className="text-white/40">•</span>
                          <p className="text-white/60">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className="mb-2 text-white/90 text-sm">
                        {comment.content}
                      </p>

                      {/* Reply Button */}
                      {authenticated && (
                        <button
                          onClick={() => handleReplyClick(comment.id)}
                          className="text-xs text-white/60 hover:text-white flex items-center gap-1"
                        >
                          <MessageSquare size={12} /> Reply
                        </button>
                      )}

                      {/* Reply Input (if replying to this comment) */}
                      {replyingTo === comment.id && (
                        <div className="mt-3 space-y-2 pl-4 border-l-2 border-[#3a2a4e]">
                          <Textarea
                            placeholder="Write a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="bg-[#2a1a3e] border-[#3a2a4e] resize-none text-sm"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              onClick={() => handleCancelReply()}
                              size="sm"
                              variant="outline"
                              className="text-xs h-8 border-[#3a2a4e] text-white/70 hover:bg-[#3a2a4e] hover:text-white"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleAddReply}
                              size="sm"
                              className="bg-[#d4af37] text-black hover:bg-[#c39f35] text-xs h-8"
                              disabled={!replyText.trim() || loadingComments}
                            >
                              Reply
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 pl-4 border-l-2 border-[#3a2a4e] space-y-3">
                          {comment.replies.map((reply: any) => (
                            <div key={reply.id} className="pb-2">
                              <div className="flex items-center gap-1 text-xs mb-1">
                                <p className="font-medium text-white/90">
                                  {reply.userAddress.substring(0, 5)}...
                                </p>
                                <span className="text-white/40">•</span>
                                <p className="text-white/60">
                                  {new Date(reply.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <p className="text-xs text-white/90">
                                {reply.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#2a1a3e] p-4 rounded-lg text-center">
                  <p className="text-white/70">
                    No comments yet. Be the first to comment!
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Add some extra padding at the bottom for better scroll experience */}
          <div className="h-10"></div>
        </div>
      </div>
    </div>
  );
}
