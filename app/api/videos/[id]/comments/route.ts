import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

// GET /api/videos/[id]/comments - Fetch comments for a video
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;
    const comments = await prisma.comment.findMany({
      where: {
        videoId: videoId,
        parentId: null, // Only get top-level comments
      },
      include: {
        replies: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { message: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/videos/[id]/comments - Add a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;
    const { content, userAddress, parentId } = await request.json();

    if (!content || !userAddress) {
      return NextResponse.json(
        { message: "Content and userAddress are required" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userAddress,
        videoId,
        parentId: parentId || null,
      },
      include: {
        replies: true,
      },
    });

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { message: "Failed to create comment" },
      { status: 500 }
    );
  }
}
