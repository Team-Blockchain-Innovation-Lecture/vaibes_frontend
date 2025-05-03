import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// S3クライアントの初期化
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // リクエストのバリデーション
    if (!body.payload?.video?.url) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    // task_idを取得（リクエストから取得する必要があります）
    const taskId = body.request_id; // または適切なtask_idの取得方法

    try {
      // task_idに基づいてレコードを検索
      const existingVideo = await prisma.raw_video.findFirst({
        where: {
          task_id: taskId,
        },
      });

      if (!existingVideo) {
        return NextResponse.json(
          { error: `No record found for task_id: ${taskId}` },
          { status: 404 }
        );
      }

      // レコードを更新
      const updatedVideo = await prisma.raw_video.update({
        where: {
          id: existingVideo.id,
        },
        data: {
          video_url: body.payload.video.url,
          is_completed: true,
        },
      });

      // 関連する音楽データを取得
      const musicData = await prisma.raw_music.findFirst({
        where: {
          userAddress: updatedVideo.userAddress,
          is_completed: true,
        },
        orderBy: {
          id: 'desc',
        },
      });

      if (!musicData?.audio_url) {
        throw new Error('No audio URL found for merging');
      }

      // 音声と動画をマージするAPIを呼び出す
      const mergeResponse = await fetch(`${BACKEND_URL}/api/merge-video-audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_url: musicData.audio_url,
          video_url: body.payload.video.url,
        }),
      });

      if (!mergeResponse.ok) {
        throw new Error('Video-audio merge request failed');
      }

      // Videoテーブルに新しいレコードを作成
      // const video = await prisma.video.create({
      //   data: {
      //     url: margedData.output_path,
      //     duration: 8,
      //     title: `Generated Video ${Date.now()}`,
      //     tokenId: updatedVideo.userAddress, // TODO: 適切なtokenIdを設定する必要があります
      //     status: 'ready',
      //   },
      // });

      return NextResponse.json({
        success: true,
        data: {
          s3_url: margedData.output_path,
          // video: video,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        // Record not found
        return NextResponse.json(
          { error: `No record found for task_id: ${taskId}` },
          { status: 404 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error processing video callback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
