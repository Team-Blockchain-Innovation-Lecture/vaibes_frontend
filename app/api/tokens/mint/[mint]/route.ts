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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ mint: string }> }
) {
  try {
    // Correct way to handle async parameters in Next.js 14
    const params = await context.params;
    const mintAddress = params.mint;

    // Find token by mint address
    const token = await prisma.token.findUnique({
      where: {
        mint: mintAddress,
      },
      include: {
        _count: {
          select: {
            videos: true,
          },
        },
      },
    });

    if (!token) {
      return NextResponse.json({ message: "Token not found" }, { status: 404 });
    }

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

    // Get all tokens ranked by total play count
    const tokensWithPlayCounts = await prisma.token.findMany({
      select: {
        id: true,
        videos: {
          select: {
            playCount: true,
          },
        },
      },
    });

    // Calculate total play count for each token and determine rank
    const tokenPlayCounts = tokensWithPlayCounts.map((t) => ({
      id: t.id,
      totalPlays: t.videos.reduce((sum, video) => sum + video.playCount, 0),
    }));

    // Sort tokens by total play count in descending order
    tokenPlayCounts.sort((a, b) => b.totalPlays - a.totalPlays);

    // Find rank of current token
    const rank = tokenPlayCounts.findIndex((t) => t.id === token.id) + 1;

    // Format creator as an object
    const tokenWithCreator = {
      ...token,
      creator: {
        username: token.creator || "Anonymous", // Use creator field as username
        walletAddress: token.creator || "0x000", // Use creator field as walletAddress too
      },
      videoStats: {
        totalPlays: videoStats._sum.playCount || 0,
        totalLikes: videoStats._sum.likeCount || 0,
        rank: rank, // Add rank to videoStats
      },
    };

    // Convert BigInt values to strings before returning JSON response
    return NextResponse.json({
      token: serializeBigInt(tokenWithCreator),
    });
  } catch (error) {
    console.error("Error fetching token:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the token" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
