"use client";

import React, { useEffect, useState } from "react";
import { TokenCard } from "./token-card";

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

export function TokenList({ limit = 100 }: TokenListProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTokens() {
      try {
        const response = await fetch(`/api/tokens?limit=${limit}`);
        if (!response.ok) throw new Error("Failed to fetch tokens");
        const data = await response.json();
        setTokens(data.tokens);
      } catch (error) {
        console.error("Error fetching tokens:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTokens();
  }, [limit]);

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

  return (
    // レスポンシブグリッドレイアウト - PCでは3列表示
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tokens.map((token) => (
        <TokenCard key={token.id} token={token} />
      ))}
    </div>
  );
}
