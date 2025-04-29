import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("walletAddress");

    // Fetch the current video with token information
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        token: {
          select: {
            id: true,
            name: true,
            symbol: true,
            logo: true,
            marketCap: true,
          },
        },
      },
    });

    if (!video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 });
    }

    // Check if the user has liked this video
    let isLiked = false;
    if (walletAddress) {
      const like = await prisma.videoLike.findUnique({
        where: {
          userId_videoId: {
            userId: walletAddress,
            videoId: videoId,
          },
        },
      });
      isLiked = !!like;
    }

    // Find the previous and next videos
    // Get all video IDs ordered by creation date
    const allVideos = await prisma.video.findMany({
      select: { id: true },
      orderBy: { createdAt: "desc" },
    });

    const videoIds = allVideos.map((v) => v.id);
    const currentIndex = videoIds.indexOf(videoId);

    // Determine previous and next video IDs
    const prevVideoId =
      currentIndex < videoIds.length - 1 ? videoIds[currentIndex + 1] : null;
    const nextVideoId = currentIndex > 0 ? videoIds[currentIndex - 1] : null;

    // Update the play count
    await prisma.video.update({
      where: { id: videoId },
      data: {
        playCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      video: {
        ...video,
        isLiked,
      },
      prevVideoId,
      nextVideoId,
    });
  } catch (error) {
    console.error("Error fetching video:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the video" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
