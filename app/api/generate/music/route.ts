import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Extract parameters from request body
    const {
      prompt,
      genre = "EDM",
      instrumental = false,
      model_version = "v4",
      timeout = 3,
      task_id,
      walletAddress,
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

    console.log(`Music generation music started: ${task_id}`);

    try {
      // Check if task with same task_id exists
      const existingTask = await prisma.raw_music.findUnique({
        where: {
          task_id: task_id,
        },
      });

      if (existingTask) {
        console.log(
          `[Task ID: ${task_id}] Task already exists. Skipping processing.`
        );
        return NextResponse.json({
          success: true,
          message: "Task already exists",
          data: existingTask,
        });
      }

      // Call external API to generate music
      if (!process.env.MUSIC_API_URL) {
        throw new Error("MUSIC_API_URL is not set in environment variables");
      }
      const response = await fetch(process.env.MUSIC_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          genre,
          instrumental,
          model_version,
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

      // Return response directly from external API
      const resultData = await response.json();
      console.log("Response from external API:", resultData);

      if (resultData.success) {
        // Create record in raw_music table
        const music_task_id = resultData.task_id;

        await prisma.raw_music.create({
          data: {
            task_id: task_id,
            music_task_id,
            userAddress:
              walletAddress || "0x1234567890123456789012345678901234567890",
            is_completed: false,
            audio_url: "",
            image_url: "",
            prompt: prompt || "",
          },
        });

        // Return external API response directly to client
        return NextResponse.json({
          success: true,
          task_id,
          data: resultData,
        });
      } else {
        return NextResponse.json({
          success: false,
          message: "Music generation failed",
          data: resultData,
        });
      }
    } catch (error: any) {
      console.error(`Music generation error: ${error.message}`);

      return NextResponse.json(
        {
          success: false,
          message: "Error occurred during music generation",
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
