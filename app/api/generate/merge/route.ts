import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Environment variable settings
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    // Extract parameters from request body
    const { task_id } = await req.json();

    console.log(`Video Audio Merge started: ${task_id}`);

    try {
      // Check if task with same task_id exists
      const existingTask = await prisma.raw_video.findFirst({
        where: {
          task_id: task_id,
          merged_video_url: {
            not: null,
          },
        },
      });

      if (existingTask) {
        console.log(
          `[Task ID: ${task_id}] Task already exists. Skipping merge.`
        );
        return NextResponse.json({
          success: true,
          message: "Task already exists",
          data: {
            s3_url: existingTask.merged_video_url,
          },
        });
      }

      const videoData = await prisma.raw_video.findFirst({
        where: {
          task_id,
        },
        orderBy: {
          id: "desc",
        },
      });

      if (!videoData?.video_url) {
        throw new Error("No video_url URL found for merging");
      }

      // Get related music data
      const musicData = await prisma.raw_music.findFirst({
        where: {
          task_id,
        },
        orderBy: {
          id: "desc",
        },
      });

      if (!musicData?.audio_url) {
        throw new Error("No audio URL found for merging");
      }

      // Call API to merge audio and video
      const mergeResponse = await fetch(
        `${BACKEND_URL}/api/merge-video-audio`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            audio_url: musicData.audio_url,
            video_url: videoData.video_url,
          }),
        }
      );

      const margedData = await mergeResponse.json();

      if (!mergeResponse.ok) {
        throw new Error("Video-audio merge request failed");
      }

      console.log(`[Task ID: ${task_id}] Merged Data:`, margedData);

      // Update record
      const updatedMergedVideo = await prisma.raw_video.update({
        where: {
          id: videoData.id,
        },
        data: {
          merged_video_url: margedData.s3_url,
          is_completed: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          s3_url: updatedMergedVideo.merged_video_url,
        },
      });
    } catch (error: any) {
      console.error(`Video generation error: ${error.message}`);

      return NextResponse.json(
        {
          success: false,
          message: "Error occurred during video generation",
          error: error.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error(`Request processing error: ${error.message}`);
    return NextResponse.json(
      {
        success: false,
        message: "Error occurred while processing request",
      },
      { status: 500 }
    );
  }
}
