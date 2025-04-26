import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const walletAddress = searchParams.get("walletAddress") || null;

    // Fetch videos with token information
    const videos = await prisma.video.findMany({
      take: limit,
      where: {
        status: "ready",
      },
      orderBy: [
        { playCount: "desc" }, // Sort by play count
        { createdAt: "desc" }, // Then by creation date
      ],
      include: {
        token: {
          select: {
            name: true,
            symbol: true,
            logo: true,
          },
        },
      },
    });

    // If walletAddress is provided, check which videos the user has liked
    let videosWithLikeStatus = videos;

    if (walletAddress) {
      const userLikes = await prisma.videoLike.findMany({
        where: {
          userId: walletAddress,
          videoId: {
            in: videos.map((video) => video.id),
          },
        },
        select: {
          videoId: true,
        },
      });

      // Create a set of video IDs that the user has liked for faster lookup
      const likedVideoIds = new Set(userLikes.map((like) => like.videoId));

      // Add isLiked flag to each video
      videosWithLikeStatus = videos.map((video) => ({
        ...video,
        isLiked: likedVideoIds.has(video.id),
      }));
    }

    return NextResponse.json({
      videos: videosWithLikeStatus,
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching videos" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
