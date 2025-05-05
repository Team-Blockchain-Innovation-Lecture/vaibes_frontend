import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

// GET /api/users/[walletAddress]/videos
export async function GET(
  request: NextRequest,
  { params }: { params: { walletAddress: string } }
) {
  try {
    const walletAddress = params.walletAddress;

    // Fetch videos created by this user with related token data
    const videos = await prisma.video.findMany({
      where: {
        creator: walletAddress,
      },
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
      orderBy: {
        createdAt: "desc", // Most recent videos first
      },
    });

    return NextResponse.json({ videos }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch user videos" },
      { status: 500 }
    );
  }
}
