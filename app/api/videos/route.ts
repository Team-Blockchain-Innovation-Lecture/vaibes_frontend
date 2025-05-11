import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const sort = searchParams.get("sort") || "createdAt"; // Default is sort by playCount
    const order = searchParams.get("order") || "desc"; // Default is descending order
    const tokenId = searchParams.get("tokenId") || undefined; // Get videos related to a specific token
    const walletAddress = searchParams.get("walletAddress") || null; // User's wallet address for like status check

    // Search conditions
    const search = searchParams.get("search") || undefined; // Search keyword

    // Build filter conditions
    let whereCondition: any = {};

    const status = searchParams.get("status");
    // Add status condition if filtering is needed
    // Filter by status only if the status parameter is specified
    if (status) {
      whereCondition.status = status;
    }
    // Return all videos (including those in preparation) if no filtering is needed

    // Add search conditions
    if (search) {
      whereCondition.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Get videos for a specific token
    if (tokenId) {
      whereCondition.tokenId = tokenId;
    }

    // Get videos
    const videos = await prisma.video.findMany({
      where: whereCondition,
      take: limit,
      skip: offset,
      orderBy: {
        [sort]: order,
      },
      include: {
        token: {
          select: {
            id: true,
            name: true,
            symbol: true,
            logo: true,
            marketCap: true, // Add marketCap to the selection
          },
        },
      },
    });
    console.log("videos", videos);

    // Get user's like information
    let videosWithLikeStatus = videos;

    if (walletAddress) {
      const userLikes = await prisma.videoLike.findMany({
        where: {
          userId: walletAddress,
          videoId: {
            in: videos.map((video) => video.id),
          },
        },
        select: {
          videoId: true,
        },
      });

      // Create a set of liked video IDs
      const likedVideoIds = new Set(userLikes.map((like) => like.videoId));

      // Add isLiked flag to each video
      videosWithLikeStatus = videos.map((video) => ({
        ...video,
        isLiked: likedVideoIds.has(video.id),
      }));
    }

    // Get total video count
    const totalCount = await prisma.video.count({
      where: whereCondition,
    });
    console.log("totalCount", totalCount);

    return NextResponse.json({
      videos: videosWithLikeStatus,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + videos.length < totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching videos" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
