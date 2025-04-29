"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronUp, ChevronDown, Play, Pause, Heart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";

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

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { authenticated, login } = usePrivy();
  const { wallets } = useSolanaWallets();

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

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isNavigatingRef = useRef<boolean>(false);

  // Load video data
  useEffect(() => {
    async function fetchVideo() {
      try {
        setLoading(true);
        const videoId = params.id as string;

        // Get the wallet address from the first wallet if available
        const walletAddress = wallets?.[0]?.address || null;

        const response = await fetch(
          `/api/videos/${videoId}?walletAddress=${walletAddress}`
        );
        if (!response.ok) throw new Error("Failed to fetch video");

        const data = await response.json();
        setVideo(data.video);
        setIsLiked(data.video.isLiked || false);
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
  }, [params.id, wallets, toast]);

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
      // プログレスバー更新の改善: isDragging中でなければ常に更新する
      if (!isDragging && videoElement) {
        const currentProgress =
          (videoElement.currentTime / videoElement.duration) * 100 || 0;

        // 無効な値でないことを確認
        if (!isNaN(currentProgress)) {
          setProgress(currentProgress);
          setCurrentTime(formatTime(videoElement.currentTime));
          console.log(
            "Time update:",
            videoElement.currentTime,
            "Progress:",
            currentProgress
          );
        }
      }
    };

    const handleLoadedMetadata = () => {
      console.log("Video metadata loaded, duration:", videoElement.duration);
      // 動画の長さを設定
      setDuration(formatTime(videoElement.duration));

      // 初期値を設定
      setProgress(0);
      setCurrentTime(formatTime(0));
    };

    const handleVideoEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      if (videoElement) videoElement.currentTime = 0;
    };

    // イベントリスナーをクリーンアップして再登録（バグ修正のため）
    videoElement.removeEventListener("timeupdate", handleTimeUpdate);
    videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
    videoElement.removeEventListener("ended", handleVideoEnded);

    // イベントリスナーを追加
    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    videoElement.addEventListener("ended", handleVideoEnded);

    // 既にメタデータが読み込まれている場合は手動で処理を実行
    if (videoElement.readyState >= 1) {
      handleLoadedMetadata();

      // 現在位置を反映
      if (videoElement.currentTime > 0) {
        handleTimeUpdate();
      }
    }

    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.removeEventListener("ended", handleVideoEnded);
    };
  }, [isDragging, formatTime]);

  // Add video play/pause event listeners
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handlePlay = () => {
      console.log("Video playback started");
      setIsPlaying(true);
    };

    const handlePause = () => {
      console.log("Video playback paused");
      setIsPlaying(false);
    };

    const handleCanPlay = () => {
      console.log("Video can play now");
    };

    const handleError = (e: any) => {
      console.error("Video error event:", e);
    };

    // イベントリスナー追加
    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("pause", handlePause);
    videoElement.addEventListener("canplay", handleCanPlay);
    videoElement.addEventListener("error", handleError);

    return () => {
      // クリーンアップ
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("pause", handlePause);
      videoElement.removeEventListener("canplay", handleCanPlay);
      videoElement.removeEventListener("error", handleError);
    };
  }, []);

  // Try to auto-play muted video when component mounts
  useEffect(() => {
    // ビデオソースがロードされたら実行
    if (video && videoRef.current) {
      console.log("Video source loaded", video.url);

      // ブラウザの自動再生ポリシーに対応するための対策
      const attemptPlay = async () => {
        try {
          // 一時的にミュートして再生（ブラウザのポリシー対応）
          videoRef.current.muted = true;
          await videoRef.current.play();

          // 再生が始まったらミュートを解除
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.muted = false;

              // プログレスバーの初期化を強制的に行う
              if (!isNaN(videoRef.current.duration)) {
                setDuration(formatTime(videoRef.current.duration));

                const currentProgress =
                  (videoRef.current.currentTime / videoRef.current.duration) *
                    100 || 0;
                setProgress(currentProgress);
                setCurrentTime(formatTime(videoRef.current.currentTime));
                console.log("Initial progress set to:", currentProgress);
              }
            }
          }, 100);

          setIsPlaying(true);
        } catch (error) {
          console.error("Auto-play failed:", error);
          // 自動再生に失敗した場合はそのままミュート解除
          if (videoRef.current) {
            videoRef.current.muted = false;
          }
        }
      };

      // ビデオがcanplayイベントを発生させたときに再生
      const handleCanPlay = () => {
        console.log("Video can play event fired");
        attemptPlay();

        // メタデータが既に利用可能であれば、すぐに設定
        if (videoRef.current && !isNaN(videoRef.current.duration)) {
          setDuration(formatTime(videoRef.current.duration));
        }
      };

      // loadedmetadata イベントも利用してタイミングを改善
      const handleLoadedMetadata = () => {
        console.log("Video metadata loaded event fired");
        if (videoRef.current && !isNaN(videoRef.current.duration)) {
          setDuration(formatTime(videoRef.current.duration));
        }
      };

      videoRef.current.addEventListener("canplay", handleCanPlay, {
        once: true,
      });

      videoRef.current.addEventListener(
        "loadedmetadata",
        handleLoadedMetadata,
        {
          once: true,
        }
      );

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener("canplay", handleCanPlay);
          videoRef.current.removeEventListener(
            "loadedmetadata",
            handleLoadedMetadata
          );
        }
      };
    }
  }, [video, formatTime]);

  // Toggle video play/pause with improved error handling
  const togglePlay = () => {
    if (!videoRef.current) return;

    try {
      console.log("Toggle play clicked, current state:", isPlaying);

      if (isPlaying) {
        // 再生中 → 停止
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        // 停止中 → 再生
        const playPromise = videoRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Video playback started successfully");
              setIsPlaying(true);
            })
            .catch((error) => {
              console.error("Error playing video:", error);
              // ブラウザの自動再生ポリシーに対応するため、一度ミュートして再生を試みる
              videoRef.current!.muted = true;
              videoRef
                .current!.play()
                .then(() => {
                  console.log("Muted playback started");
                  // 少し遅延してからミュートを解除
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

  // Navigation between videos
  const goToPreviousVideo = () => {
    if (prevVideo) {
      router.push(`/videos/${prevVideo}`);
    }
  };

  const goToNextVideo = () => {
    if (nextVideo) {
      router.push(`/videos/${nextVideo}`);
    }
  };

  // Handle swipe and wheel navigation in video area
  useEffect(() => {
    // Handle swipe gestures (mainly for mobile)
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchEndY - touchStartY;

      // If the swipe distance is significant enough
      if (Math.abs(deltaY) > 50) {
        if (deltaY > 0 && prevVideo) {
          // Swipe down - go to previous
          goToPreviousVideo();
        } else if (deltaY < 0 && nextVideo) {
          // Swipe up - go to next
          goToNextVideo();
        }
      }
    };

    // Handle wheel events (for desktop)
    const handleWheel = (e: WheelEvent) => {
      // 必ず e.preventDefault() を最初に呼び出して、デフォルトのスクロール動作を防ぐ
      e.preventDefault();

      // ビデオコンテナ内でのホイールイベントのみを処理
      // 注：progressBarRef などの操作後でもビデオコンテナ内のイベントは処理する
      if (!videoContainerRef.current?.contains(e.target as Node)) return;

      // すでに遷移処理中なら何もしない
      if (isNavigatingRef.current) return;

      // 以前のタイムアウトをクリア
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }

      // ナビゲーション処理中フラグをセット
      isNavigatingRef.current = true;

      // 十分なスクロール量でないと遷移しない
      if (Math.abs(e.deltaY) < 20) {
        isNavigatingRef.current = false;
        return;
      }

      // ログを追加して問題の診断をしやすくする
      console.log("Wheel event detected, deltaY:", e.deltaY);

      wheelTimeoutRef.current = setTimeout(() => {
        if (e.deltaY > 0 && nextVideo) {
          // 下にスクロール - 次の動画へ
          console.log("Navigating to next video");
          goToNextVideo();
        } else if (e.deltaY < 0 && prevVideo) {
          // 上にスクロール - 前の動画へ
          console.log("Navigating to previous video");
          goToPreviousVideo();
        }

        // ナビゲーションフラグをリセット
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 500);
      }, 150); // タイムアウトを短くして反応速度を上げる
    };

    const videoContainer = videoContainerRef.current;

    if (videoContainer) {
      // イベントリスナーを追加
      videoContainer.addEventListener("touchstart", handleTouchStart);
      videoContainer.addEventListener("touchend", handleTouchEnd);

      // 重要: passive: false を設定して preventDefault() が機能するようにする
      videoContainer.addEventListener("wheel", handleWheel, { passive: false });

      // ビデオ要素にも直接イベントハンドラを追加
      if (videoRef.current) {
        videoRef.current.addEventListener("wheel", handleWheel, {
          passive: false,
        });
      }

      // プログレスバー要素にもイベントハンドラを追加
      if (progressBarRef.current) {
        progressBarRef.current.addEventListener(
          "wheel",
          (e) => {
            // プログレスバー上でのホイールイベントも処理できるように
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
    // このイベントリスナーをdocumentに直接追加して、すべてのホイールイベントを捕捉
    function globalWheelHandler(e: WheelEvent) {
      // ビデオエリア内のみ処理
      if (!videoContainerRef.current?.contains(e.target as Node)) return;

      // デフォルトのスクロール防止
      e.preventDefault();
      e.stopPropagation();

      // 遷移中なら何もしない
      if (isNavigatingRef.current) return;

      // 既存のタイムアウトをクリア
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }

      // スクロール量が小さすぎる場合は無視
      if (Math.abs(e.deltaY) < 20) return;

      console.log("Global wheel handler fired with deltaY:", e.deltaY);

      // 遷移フラグをセット
      isNavigatingRef.current = true;

      // 遷移処理を実行
      if (e.deltaY > 0 && nextVideo) {
        console.log("Navigating to next video via global handler");
        goToNextVideo();
      } else if (e.deltaY < 0 && prevVideo) {
        console.log("Navigating to previous video via global handler");
        goToPreviousVideo();
      }

      // フラグリセット
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 500);
    }

    // documentレベルでイベントリスナーを追加
    document.addEventListener("wheel", globalWheelHandler, {
      passive: false,
      capture: true,
    });

    // クリーンアップ
    return () => {
      document.removeEventListener("wheel", globalWheelHandler, {
        capture: true,
      });
    };
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
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-[#d4af37] text-black rounded-md hover:bg-[#c39f35]"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col md:flex-row bg-[#1a0e26] pt-14">
      {/* Video Area - Fixed positioning to ensure it doesn't scroll */}
      <div
        ref={videoContainerRef}
        className="fixed md:relative inset-0 md:inset-auto md:flex-1 flex items-center justify-center bg-black"
        style={{
          height: "calc(100% - 30px)", // ヘッダーの高さ分を引く
          width: "100%",
          top: "30px", // ヘッダーの高さ分下にずらす
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
            muted={false} // 音声は有効にしておく
            onTimeUpdate={() => {
              // インライン更新処理を追加して確実にプログレスバーを更新
              if (videoRef.current && !isDragging) {
                const currentProgress =
                  (videoRef.current.currentTime / videoRef.current.duration) *
                  100;
                if (!isNaN(currentProgress)) {
                  setProgress(currentProgress);
                  setCurrentTime(formatTime(videoRef.current.currentTime));
                }
              }
            }}
            onLoadedMetadata={() => {
              // 動画メタデータが読み込まれた時の処理
              if (videoRef.current) {
                setDuration(formatTime(videoRef.current.duration));
              }
            }}
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
            // プログレスバー上のホイールイベントも確実に処理
            e.stopPropagation();
            e.preventDefault();

            if (isNavigatingRef.current) return;

            // スクロール量が小さすぎる場合は無視
            if (Math.abs(e.deltaY) < 20) return;

            console.log("Progress bar wheel event:", e.deltaY);

            // 遷移フラグをセット
            isNavigatingRef.current = true;

            // 遷移処理を実行
            if (e.deltaY > 0 && nextVideo) {
              console.log("Navigating to next video from progress bar");
              goToNextVideo();
            } else if (e.deltaY < 0 && prevVideo) {
              console.log("Navigating to previous video from progress bar");
              goToPreviousVideo();
            }

            // フラグリセット
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
                // プログレスバー上のスクロールも確実に処理
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

      {/* Info Section - Fixed on the right with independent scrolling */}
      <div
        className="fixed top-0 right-0 bottom-0 w-full md:w-[400px] bg-[#1a0e26] overflow-y-auto"
        style={{
          height: "calc(100vh - 86px)", // ヘッダーの高さ分を引く
          top: "86px", // ヘッダーの高さ分下にずらす
          zIndex: 10,
          borderLeft: "1px solid rgba(255, 255, 255, 0.1)", // 情報エリアの左側に薄い境界線を追加
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

          {/* Video Information */}
          <div className="space-y-4">
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
          </div>

          {/* Add some extra padding at the bottom for better scroll experience */}
          <div className="h-10"></div>
        </div>
      </div>
    </div>
  );
}
