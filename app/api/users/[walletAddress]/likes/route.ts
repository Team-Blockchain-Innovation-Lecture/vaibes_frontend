import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

// GET /api/users/[walletAddress]/likes
export async function GET(
  request: NextRequest,
  { params }: { params: { walletAddress: string } }
) {
  try {
    const walletAddress = params.walletAddress;

    // Find all likes by this user and include the related videos
    const videoLikes = await prisma.videoLike.findMany({
      where: {
        userId: walletAddress, // Using userId as the wallet address
      },
      include: {
        video: {
          include: {
            token: {
              select: {
                name: true,
                symbol: true,
                logo: true,
                marketCap: true,
                mint: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Most recent likes first
      },
    });

    // Extract just the videos from the likes
    const videos = videoLikes.map((like) => ({
      ...like.video,
      isLiked: true, // Mark these videos as liked
    }));

    return NextResponse.json({ videos }, { status: 200 });
  } catch (error) {
    console.error("Error fetching liked videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch liked videos" },
      { status: 500 }
    );
  }
}
