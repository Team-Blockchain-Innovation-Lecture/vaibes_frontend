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

// GET /api/leaderboard/videos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Get videos sorted by play count in descending order
    const videos = await prisma.video.findMany({
      take: limit,
      orderBy: {
        playCount: "desc",
      },
      include: {
        token: {
          select: {
            name: true,
            symbol: true,
            logo: true,
            mint: true,
          },
        },
      },
    });

    // Add rank information to each video
    const videosWithRank = videos.map((video, index) => ({
      ...video,
      rank: index + 1,
      creator: video.creator || "Anonymous",
    }));

    return NextResponse.json({
      videos: serializeBigInt(videosWithRank),
    });
  } catch (error) {
    console.error("Error fetching video leaderboard:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching video leaderboard" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
