import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Environment variable settings
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    // Extract parameters from request body
    const {
      prompt,
      timeout = 3,
      task_id,
      walletAddress,
      video_style = "anime",
    } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          message: "Prompt is required",
        },
        { status: 400 }
      );
    }

    console.log(`Video generation started: ${task_id}`);

    try {
      // Check if video task already exists
      const existingVideo = await prisma.raw_video.findFirst({
        where: {
          task_id,
        },
      });

      if (existingVideo) {
        console.log(
          `[Task ID: ${task_id}] Video task already exists. Skipping.`
        );
        return NextResponse.json({
          success: true,
          message: "Video task already exists",
          data: existingVideo,
        });
      }

      // Call video generation API
      const response = await fetch(`${BACKEND_URL}/api/generate-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          style: video_style,
          timeout,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `External API call error: ${response.status} ${errorText}`
        );
        throw new Error(`External API call error: ${response.status}`);
      }

      const resultData = await response.json();
      console.log("Response from external API:", resultData);

      if (resultData.success) {
        // Get video task ID from response
        const video_task_id = resultData.request_id;

        // Record video generation task
        await prisma.raw_video.create({
          data: {
            userAddress: walletAddress,
            task_id,
            video_task_id,
            is_completed: false,
          },
        });
        return NextResponse.json({
          success: true,
          task_id,
          data: resultData,
        });
      } else {
        return NextResponse.json({
          success: false,
          message: "Video generation failed",
          data: resultData,
        });
      }
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
