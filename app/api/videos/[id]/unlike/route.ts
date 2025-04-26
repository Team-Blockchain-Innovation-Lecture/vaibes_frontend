import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;
    // ヘッダーから直接ウォレットアドレスを取得
    const walletAddress = request.headers.get("wallet-address");

    if (!walletAddress) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if the user has liked this video
    const existingLike = await prisma.videoLike.findUnique({
      where: {
        userId_videoId: {
          userId: walletAddress,
          videoId: videoId,
        },
      },
    });

    if (!existingLike) {
      return NextResponse.json(
        { message: "User has not liked this video" },
        { status: 400 }
      );
    }

    // Delete the like record
    await prisma.videoLike.delete({
      where: {
        id: existingLike.id,
      },
    });

    // Decrement the like count on the video (ensure it doesn't go below 0)
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { likeCount: true },
    });

    if (!video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 });
    }

    const newLikeCount = Math.max(0, video.likeCount - 1);

    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        likeCount: newLikeCount,
      },
    });

    return NextResponse.json({
      message: "Video unliked successfully",
      likeCount: updatedVideo.likeCount,
    });
  } catch (error) {
    console.error("Error unliking video:", error);
    return NextResponse.json(
      { message: "An error occurred while unliking the video" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
