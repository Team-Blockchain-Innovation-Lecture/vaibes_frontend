import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMarketCap } from "@/lib/utils";
import Link from "next/link";

type TokenCardProps = {
  token: {
    id: string;
    name: string;
    symbol: string;
    description: string | null;
    logo: string | null;
    marketCap: number | null;
    _count?: {
      videos: number;
    };
    videoStats?: {
      totalPlays: number;
      totalLikes: number;
    };
  };
};

export function TokenCard({ token }: TokenCardProps) {
  // Format description to show only first 3 lines
  const truncateDescription = (desc: string | null) => {
    if (!desc) return "";
    const lines = desc.split("\n").slice(0, 3);
    let truncated = lines.join("\n");
    if (desc.length > truncated.length) {
      truncated += "...";
    }
    return truncated;
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="flex flex-row h-full">
        {/* 左側のロゴエリア - VideoCardと同じ幅に調整 */}
        <div className="w-2/5 bg-secondary/10 flex items-center justify-center relative">
          <Link
            href={`/tokens/${token.id}`}
            className="w-full h-full flex items-center justify-center"
          >
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
              <div className="w-full h-full bg-secondary flex items-center justify-center text-5xl font-bold">
                {token.symbol?.substring(0, 2) || "??"}
              </div>
            )}
            {/* ホバー効果を追加 */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40">
              <span className="text-white font-medium">View Details</span>
            </div>
          </Link>
        </div>

        {/* 右側のコンテンツエリア - VideoCardと同じ幅に調整 */}
        <div className="w-3/5 flex flex-col relative">
          <CardHeader className="pb-1 pt-3 px-4">
            <div>
              <CardTitle className="text-lg line-clamp-1">
                {token.name}
              </CardTitle>
              <CardDescription className="text-xs">
                ${token.symbol}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-4 pt-0">
            <div className="text-sm text-muted-foreground mb-auto min-h-[4.5rem]">
              <p className="line-clamp-3 whitespace-pre-line">
                {token.description || "No description available"}
              </p>
            </div>
          </CardContent>
        </div>
      </div>

      {/* カード下部の統計情報 - パディングをVideoCardに合わせる */}
      <CardFooter className="p-2 grid grid-cols-4 gap-2 text-sm border-t">
        <div>
          <p className="text-muted-foreground text-xs">Market Cap</p>
          <p className="font-medium">{formatMarketCap(token.marketCap)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Videos</p>
          <p className="font-medium">{token._count?.videos || 0}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Total Plays</p>
          <p className="font-medium">
            {token.videoStats?.totalPlays?.toLocaleString() || 0}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Total Likes</p>
          <p className="font-medium">
            {token.videoStats?.totalLikes?.toLocaleString() || 0}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
