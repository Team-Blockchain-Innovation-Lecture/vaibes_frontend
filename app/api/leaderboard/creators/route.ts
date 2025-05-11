import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

// Helper function to handle BigInt serialization
const serializeBigInt = (data: any): any => {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "bigint") {
    return data.toString();
  }

  if (Array.isArray(data)) {
    return data.map(serializeBigInt);
  }

  if (typeof data === "object") {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, serializeBigInt(value)])
    );
  }

  return data;
};

// GET /api/leaderboard/creators
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Aggregate play counts and video counts by creator
    const creators = await prisma.video.groupBy({
      by: ["creator"],
      _sum: {
        playCount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          playCount: "desc",
        },
      },
      take: limit,
    });

    // Format the data for the leaderboard with ranks
    const creatorsWithRank = creators.map((creator, index) => ({
      rank: index + 1,
      walletAddress: creator.creator,
      totalPlays: creator._sum.playCount || 0,
      videoCount: creator._count.id,
    }));

    return NextResponse.json({
      creators: serializeBigInt(creatorsWithRank),
    });
  } catch (error) {
    console.error("Error fetching creator leaderboard:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching creator leaderboard" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
