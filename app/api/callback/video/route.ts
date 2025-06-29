import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Get task_id from URL parameters
    const { searchParams } = new URL(request.url);
    const task_id = searchParams.get("task_id");

    if (!task_id) {
      return NextResponse.json(
        { success: false, message: "task_id is required" },
        { status: 400 }
      );
    }

    // Check task_id and is_completed status in Raw_video table
    const rawVideo = await prisma.raw_video.findFirst({
      where: {
        task_id: task_id,
        video_url: {
          not: null,
        },
      },
    });

    if (!rawVideo) {
      return NextResponse.json(
        { success: false, message: "No completed video found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rawVideo,
    });
  } catch (error) {
    console.error("Error retrieving callback data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error occurred while retrieving callback data",
      },
      { status: 500 }
    );
  }
}
