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
        {/* 左側のロゴエリア - カード幅の約半分を占める */}
        <div className="w-1/2 bg-secondary/10 flex items-center justify-center p-4">
          {token.logo ? (
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              <img
                src={token.logo}
                alt={token.name}
                className="w-full h-auto max-h-48 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-logo.svg";
                }}
              />
            </div>
          ) : (
            <div className="w-full aspect-square max-h-48 bg-secondary flex items-center justify-center text-5xl font-bold">
              {token.symbol?.substring(0, 2) || "??"}
            </div>
          )}
        </div>

        {/* 右側のコンテンツエリア - カード幅の約半分を占める */}
        <div className="w-1/2 flex flex-col">
          <CardHeader className="pb-1 pt-3 px-4">
            <div>
              <CardTitle className="text-lg line-clamp-1">
                {token.name}
              </CardTitle>
              <CardDescription className="text-xs">
                {token.symbol}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-4 pt-0">
            <div className="text-sm text-muted-foreground min-h-[4.5rem] mb-auto">
              <p className="line-clamp-3 whitespace-pre-line">
                {token.description || "No description available"}
              </p>
            </div>
          </CardContent>
        </div>
      </div>

      {/* カード下部の統計情報 - 横並びに4つの情報を表示 */}
      <CardFooter className="p-4 grid grid-cols-4 gap-2 text-sm border-t">
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
