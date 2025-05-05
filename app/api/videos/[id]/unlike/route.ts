import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;
    const walletAddress = request.headers.get("wallet-address");

    if (!walletAddress) {
      return NextResponse.json(
        { message: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 });
    }

    // Check if already liked
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
        { message: "You have not liked this video" },
        { status: 400 }
      );
    }

    // Remove like and update video like count in a transaction
    await prisma.$transaction([
      // Delete like
      prisma.videoLike.delete({
        where: {
          userId_videoId: {
            userId: walletAddress,
            videoId: videoId,
          },
        },
      }),
      // Decrement video like count
      prisma.video.update({
        where: { id: videoId },
        data: {
          likeCount: {
            decrement: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({
      message: "Video unliked successfully",
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
