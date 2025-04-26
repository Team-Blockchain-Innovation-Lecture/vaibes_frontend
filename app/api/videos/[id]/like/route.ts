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

    // Check if the user has already liked this video
    const existingLike = await prisma.videoLike.findUnique({
      where: {
        userId_videoId: {
          userId: walletAddress,
          videoId: videoId,
        },
      },
    });

    if (existingLike) {
      return NextResponse.json(
        { message: "User already liked this video" },
        { status: 400 }
      );
    }

    // Create a new like record
    await prisma.videoLike.create({
      data: {
        userId: walletAddress,
        videoId: videoId,
      },
    });

    // Increment the like count on the video
    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        likeCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      message: "Video liked successfully",
      likeCount: updatedVideo.likeCount,
    });
  } catch (error) {
    console.error("Error liking video:", error);
    return NextResponse.json(
      { message: "An error occurred while liking the video" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
