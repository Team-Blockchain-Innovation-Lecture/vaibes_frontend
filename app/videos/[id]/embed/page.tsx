"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";

type Video = {
  id: string;
  url: string;
};

export default function VideoEmbedPage() {
  const params = useParams();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function fetchVideo() {
      try {
        setLoading(true);
        const videoId = params.id as string;
        const response = await fetch(`/api/videos/${videoId}`);
        if (!response.ok) throw new Error("Failed to fetch video");

        const data = await response.json();
        setVideo(data.video);
      } catch (error) {
        console.error("Error fetching video:", error);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) {
      fetchVideo();
    }
  }, [params.id]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Autoplay failed:", error);
        // Autoplay was prevented.
        // Show a play button or handle it gracefully.
      });
    }
  }, [video]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-black">
        <div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-black text-white">
        Video not found
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-black">
      <video
        ref={videoRef}
        src={video.url}
        className="w-full h-full object-contain"
        controls
        autoPlay
        playsInline
        muted
      />
    </div>
  );
} 