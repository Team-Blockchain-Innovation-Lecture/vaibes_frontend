import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

// Helper function to handle BigInt serialization
const serializeBigInt = (data: any): any => {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "bigint") {
    return data.toString();
  }

  if (Array.isArray(data)) {
    return data.map(serializeBigInt);
  }

  if (typeof data === "object") {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, serializeBigInt(value)])
    );
  }

  return data;
};

// GET /api/leaderboard/tokens
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Get all tokens
    const tokens = await prisma.token.findMany({
      include: {
        _count: {
          select: {
            videos: true,
          },
        },
      },
      take: limit,
    });

    // For each token, get the total play counts from all its videos
    const tokensWithStats = await Promise.all(
      tokens.map(async (token) => {
        const videoStats = await prisma.video.aggregate({
          where: {
            tokenId: token.id,
          },
          _sum: {
            playCount: true,
            likeCount: true,
          },
        });

        return {
          ...token,
          totalPlays: videoStats._sum.playCount || 0,
          totalLikes: videoStats._sum.likeCount || 0,
          videoCount: token._count.videos,
        };
      })
    );

    // Sort by total plays and add rank
    const sortedTokens = tokensWithStats
      .sort((a, b) => (b.totalPlays as number) - (a.totalPlays as number))
      .slice(0, limit)
      .map((token, index) => ({
        ...token,
        rank: index + 1,
      }));

    return NextResponse.json({
      tokens: serializeBigInt(sortedTokens),
    });
  } catch (error) {
    console.error("Error fetching token leaderboard:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching token leaderboard" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
