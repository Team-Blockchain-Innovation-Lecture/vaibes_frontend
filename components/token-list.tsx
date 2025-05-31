"use client";

import React, { useEffect, useState } from "react";
import { TokenCard } from "./token-card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type TokenListProps = {
  limit?: number;
};

type Token = {
  id: string;
  mint: string;
  name: string;
  symbol: string;
  description: string | null;
  logo: string | null;
  marketCap: number | null;
  _count: {
    videos: number;
  };
  videoStats: {
    totalPlays: number;
    totalLikes: number;
  };
};

type PaginationData = {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export function TokenList({ limit = 21 }: TokenListProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);

  useEffect(() => {
    async function fetchTokens() {
      try {
        const offset = (currentPage - 1) * limit;
        const response = await fetch(
          `/api/tokens?limit=${limit}&offset=${offset}`
        );
        if (!response.ok) throw new Error("Failed to fetch tokens");
        const data = await response.json();
        setTokens(data.tokens);
        setPagination(data.pagination);
      } catch (error) {
        console.error("Error fetching tokens:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTokens();
  }, [limit, currentPage]);

  if (loading) {
    return (
      // レスポンシブグリッドレイアウト - PCでは3列表示
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-64 bg-secondary/30 animate-pulse rounded-lg"
          ></div>
        ))}
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No tokens found</p>
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
      {/* レスポンシブグリッドレイアウト - PCでは3列表示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tokens.map((token) => (
          <TokenCard key={token.id} token={token} />
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
