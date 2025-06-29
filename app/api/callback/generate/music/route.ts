import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Raw_music型の拡張
interface RawMusicWithVideoStyle {
  id: number;
  userAddress: string;
  task_id: string;
  music_task_id: string | null;
  is_completed: boolean;
  audio_url: string | null;
  image_url: string | null;
  prompt: string | null;
  video_style: string | null;
}

// Response type definition
interface MusicCallbackResponse {
  success: boolean;
  data?: {
    music: {
      task_id: string;
      userAddress: string;
      is_completed: boolean;
      audio_url: string | null;
      image_url: string | null;
      prompt: string | null;
    };
  };
  error?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Request validation
    if (!body.data?.task_id || !body.data?.data?.[0]) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    const taskId = body.data.task_id;
    const musicData = body.data.data[0];

    if (!musicData.audio_url || !musicData.image_url) {
      console.log(`[Task ID: ${taskId}] Audio URL:`, musicData.audio_url);
      console.log(`[Task ID: ${taskId}] Image URL:`, musicData.image_url);
      return NextResponse.json(
        { error: `[Task ID: ${taskId}] Suno still generating` },
        { status: 200 }
      );
    }

    try {
      // Find and update record with same task_id
      const existingMusic = await prisma.raw_music.findFirst({
        where: {
          music_task_id: taskId,
        },
      });

      if (!existingMusic) {
        return NextResponse.json(
          { error: `No record found for task_id: ${taskId}` },
          { status: 404 }
        );
      }

      const updatedMusic = (await prisma.raw_music.update({
        where: {
          id: existingMusic.id,
        },
        data: {
          is_completed: true,
          audio_url: musicData.audio_url,
          image_url: musicData.image_url,
          prompt: musicData.prompt,
        },
      })) as RawMusicWithVideoStyle;

      const response: MusicCallbackResponse = {
        success: true,
        data: {
          music: updatedMusic,
        },
      };

      return NextResponse.json(response);
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
    console.error("Error processing music callback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
