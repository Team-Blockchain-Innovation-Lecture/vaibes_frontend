import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Request validation
    if (!body.payload?.video?.url) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    // Get task_id from request
    const taskId = body.request_id; // or appropriate task_id retrieval method

    try {
      // Find record based on task_id
      const existingVideo = await prisma.raw_video.findFirst({
        where: {
          video_task_id: taskId,
        },
      });

      if (!existingVideo) {
        return NextResponse.json(
          { error: `No record found for task_id: ${taskId}` },
          { status: 404 }
        );
      }

      // Update record
      const updatedVideo = await prisma.raw_video.update({
        where: {
          id: existingVideo.id,
        },
        data: {
          video_url: body.payload.video.url,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          video: updatedVideo,
        },
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        // Record not found
        return NextResponse.json(
          { error: `No record found for task_id: ${taskId}` },
          { status: 404 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Error processing video callback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
