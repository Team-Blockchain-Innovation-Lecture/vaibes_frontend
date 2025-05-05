import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 環境変数の設定
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// レスポンスの型定義
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
    video: {
      task_id: string;
      status: string;
    };
  };
  error?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // リクエストのバリデーション
    if (!body.data?.task_id || !body.data?.data?.[0]) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
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
      // 同じtask_idのレコードを探して更新
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

      const updatedMusic = await prisma.raw_music.update({
        where: {
          id: existingMusic.id,
        },
        data: {
          is_completed: true,
          audio_url: musicData.audio_url,
          image_url: musicData.image_url,
          prompt: musicData.prompt,
        },
      });

      console.log(`${BACKEND_URL}/api/generate-video`);

      // 同一のvideo_task_idが存在するかチェック
      const existingVideo = await prisma.raw_video.findFirst({
        where: {
          task_id: existingMusic.task_id,
        },
      });

      if (existingVideo) {
        console.log(`[Task ID: ${existingMusic.task_id}] Video task already exists. Skipping.`);
        return NextResponse.json({
          success: false,
          message: 'Video task already exists',
          data: existingVideo,
        });
      }

      // 動画生成APIを呼び出し
      const videoResponse = await fetch(`${BACKEND_URL}/api/generate-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: updatedMusic.prompt,
        }),
      });

      if (!videoResponse.ok) {
        throw new Error(`Video generation API returned ${videoResponse.status}`);
      }
      // if (!videoResponse.ok) {
      //   throw new Error(`Video generation API returned ${videoResponse.status}`);
      // }

      const videoData = await videoResponse.json();

      if (videoData.success) {
        // 動画生成のタスクIDを取得
        const videoTaskId = videoData.request_id;

        // Raw_videoに新しいレコードを作成
        await prisma.raw_video.create({
          data: {
            userAddress: updatedMusic.userAddress,
            task_id: existingMusic.task_id,
            video_task_id: videoTaskId,
            is_completed: false,
          },
        });

        const response: MusicCallbackResponse = {
          success: true,
          data: {
            music: updatedMusic,
            video: {
              task_id: videoTaskId,
              status: 'success',
            },
          },
        };

        return NextResponse.json(response);
      } else {
        throw new Error(`Video generation failed with code: ${videoData.code}`);
      }
    } catch (error: any) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: `No record found for task_id: ${taskId}` },
          { status: 404 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error processing music callback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
