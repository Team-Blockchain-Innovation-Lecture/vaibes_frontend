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
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 14での非同期パラメータの正しい扱い方
    const params = await context.params;
    const tokenId = params.id;

    // Fetch the token
    const token = await prisma.token.findUnique({
      where: {
        id: tokenId,
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
