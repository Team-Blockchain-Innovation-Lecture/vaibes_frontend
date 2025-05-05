import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

// Helper function to handle BigInt serialization
const serializeBigInt = (data: any): any => {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "bigint") {
    return data.toString(); // Convert BigInt to string
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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ mint: string }> }
) {
  try {
    // Correct way to handle async parameters in Next.js 14
    const params = await context.params;
    const mintAddress = params.mint;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Find token by mint address
    const token = await prisma.token.findUnique({
      where: {
        mint: mintAddress,
      },
      select: {
        id: true,
      },
    });

    if (!token) {
      return NextResponse.json({ message: "Token not found" }, { status: 404 });
    }

    // Find videos by token ID
    const videos = await prisma.video.findMany({
      where: {
        tokenId: token.id,
      },
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        token: {
          select: {
            name: true,
            symbol: true,
            logo: true,
            marketCap: true,
          },
        },
      },
    });

    // Add creator information directly from the creator field
    const videosWithCreatorInfo = videos.map((video) => ({
      ...video,
      commentCount: Math.floor(Math.random() * 20), // Random comment count (0-19)
      creator: video.creator || "Anonymous", // Use creator field directly
    }));

    // Convert BigInt values to strings before returning JSON response
    return NextResponse.json({
      videos: serializeBigInt(videosWithCreatorInfo),
    });
  } catch (error) {
    console.error("Error fetching token videos:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching token videos" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
