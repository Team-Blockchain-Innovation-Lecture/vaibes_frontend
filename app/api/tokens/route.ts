import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

// Helper function to handle BigInt serialization
const serializeBigInt = (data: any): any => {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "bigint") {
    return data.toString(); // Convert BigInt to string
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Fetch tokens with video counts and aggregated stats
    const tokens = await prisma.token.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            videos: true,
          },
        },
      },
    });

    // For each token, calculate aggregated stats for all its videos
    const tokensWithStats = await Promise.all(
      tokens.map(async (token) => {
        // Get aggregate stats for this token's videos
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
          videoStats: {
            totalPlays: videoStats._sum.playCount || 0,
            totalLikes: videoStats._sum.likeCount || 0,
          },
        };
      })
    );

    // Convert BigInt values to strings before returning JSON response
    return NextResponse.json({
      tokens: serializeBigInt(tokensWithStats),
    });
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching tokens" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
