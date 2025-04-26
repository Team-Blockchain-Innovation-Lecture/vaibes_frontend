import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;

    // Increment play count for the video
    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        playCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      message: "Play count updated successfully",
      playCount: updatedVideo.playCount,
    });
  } catch (error) {
    console.error("Error updating play count:", error);
    return NextResponse.json(
      { message: "An error occurred while updating play count" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
