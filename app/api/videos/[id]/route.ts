import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = (await params).id;
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("walletAddress");
    const tokenMint = searchParams.get("tokenMint"); // Get token mint address from query params

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
            mint: true, // Also include the mint address
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

    let prevVideoId = null;
    let nextVideoId = null;

    // If a token mint address is provided, find videos only for that token
    if (tokenMint) {
      // First find the token ID from the mint address
      const token = await prisma.token.findUnique({
        where: { mint: tokenMint },
        select: { id: true },
      });

      if (token) {
        // Get all videos for this token ordered by creation date
        const tokenVideos = await prisma.video.findMany({
          where: { tokenId: token.id },
          select: { id: true },
          orderBy: { createdAt: "desc" },
        });

        const tokenVideoIds = tokenVideos.map((v) => v.id);
        const currentTokenIndex = tokenVideoIds.indexOf(videoId);

        // Determine previous and next video IDs within the token's videos
        prevVideoId =
          currentTokenIndex < tokenVideoIds.length - 1
            ? tokenVideoIds[currentTokenIndex + 1]
            : null;
        nextVideoId =
          currentTokenIndex > 0 ? tokenVideoIds[currentTokenIndex - 1] : null;
      }
    } else {
      // Regular global navigation (all videos)
      const allVideos = await prisma.video.findMany({
        select: { id: true },
        orderBy: { createdAt: "desc" },
      });

      const videoIds = allVideos.map((v) => v.id);
      const currentIndex = videoIds.indexOf(videoId);

      // Determine previous and next video IDs
      prevVideoId =
        currentIndex < videoIds.length - 1 ? videoIds[currentIndex + 1] : null;
      nextVideoId = currentIndex > 0 ? videoIds[currentIndex - 1] : null;
    }

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
