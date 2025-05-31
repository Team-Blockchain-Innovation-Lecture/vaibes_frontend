"use client";

import React, { useEffect, useState } from "react";
import { VideoCard } from "./video-card";
import { useUnifiedWallet } from "@jup-ag/wallet-adapter";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type VideoListProps = {
  limit?: number;
  onPlayTrack: (track: any) => void;
};

type Video = {
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
  creator?: string;
  isLiked?: boolean;
  commentCount?: number;
};

type PaginationData = {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export function VideoList({ limit = 20, onPlayTrack }: VideoListProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const { connected } = useUnifiedWallet();

  useEffect(() => {
    async function fetchVideos() {
      try {
        const offset = (currentPage - 1) * limit;
        const response = await fetch(
          `/api/videos?limit=${limit}&offset=${offset}`
        );

        if (!response.ok) throw new Error("Failed to fetch videos");
        const data = await response.json();

        // 仮のコメント数を追加（実際のAPIにはコメント数がないため）
        const videosWithComments = data.videos.map((video: any) => ({
          ...video,
          commentCount: Math.floor(Math.random() * 20), // 仮のコメント数（0〜19）
        }));

        setVideos(videosWithComments);
        setPagination(data.pagination);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, [limit, connected, currentPage]);

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
      <div className="text-center py-12">
        <p className="text-muted-foreground">No videos found</p>
      </div>
    );
  }

  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.limit)
    : 1;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // スクロールをページトップに戻す
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPageNumbers = () => {
    const items = [];
    const maxVisiblePages = 5;

    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
          className={
            currentPage === 1
              ? "pointer-events-none opacity-50"
              : "cursor-pointer"
          }
        />
      </PaginationItem>
    );

    // Calculate start and end page numbers
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page and ellipsis if needed
    if (startPage > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => handlePageChange(1)}
            isActive={currentPage === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext
          onClick={() =>
            handlePageChange(Math.min(currentPage + 1, totalPages))
          }
          className={
            currentPage === totalPages
              ? "pointer-events-none opacity-50"
              : "cursor-pointer"
          }
        />
      </PaginationItem>
    );

    return items;
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {videos.map((video) => (
          <div key={video.id} className="h-auto">
            <VideoCard video={video} onPlayTrack={onPlayTrack} />
          </div>
        ))}
      </div>

      {/* ページネーション */}
      {pagination && totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>{renderPageNumbers()}</PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
