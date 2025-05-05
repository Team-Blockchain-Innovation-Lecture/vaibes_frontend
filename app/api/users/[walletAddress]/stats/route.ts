import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

// GET /api/users/[walletAddress]/stats
export async function GET(
  request: NextRequest,
  { params }: { params: { walletAddress: string } }
) {
  try {
    const walletAddress = params.walletAddress;

    // Get total number of videos created by the user
    const totalVideos = await prisma.video.count({
      where: {
        creator: walletAddress,
      },
    });

    // Get total play count for all videos created by the user
    const videoStats = await prisma.video.aggregate({
      where: {
        creator: walletAddress,
      },
      _sum: {
        playCount: true,
        likeCount: true,
      },
    });

    const stats = {
      totalVideos,
      totalPlays: videoStats._sum.playCount || 0,
      totalLikes: videoStats._sum.likeCount || 0,
    };

    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
