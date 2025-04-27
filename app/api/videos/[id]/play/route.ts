import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;

    // 動画の存在を確認
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 });
    }

    // 再生回数をインクリメント
    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        playCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      message: "Play count incremented successfully",
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
