import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = (await params).id;
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

    if (existingLike) {
      return NextResponse.json(
        { message: "You have already liked this video" },
        { status: 400 }
      );
    }

    // Create like and update video like count in a transaction
    await prisma.$transaction([
      // Create like
      prisma.videoLike.create({
        data: {
          userId: walletAddress,
          videoId: videoId,
        },
      }),
      // Increment video like count
      prisma.video.update({
        where: { id: videoId },
        data: {
          likeCount: {
            increment: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({
      message: "Video liked successfully",
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
