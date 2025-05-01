import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const BACKEND_URL = process.env.BACKEND__URL || 'http://localhost:8000';
const S3_BUCKET = process.env.S3_BUCKET;

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

      // マージされた動画データを取得（バイナリ）
      const videoBuffer = await mergeResponse.arrayBuffer();

      // S3に保存
      const fileName = `merged-videos/${Date.now()}-${taskId}.mp4`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: fileName,
          Body: Buffer.from(videoBuffer),
          ContentType: 'video/mp4',
        })
      );

      // S3のURLを生成
      const s3Url = `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`;

      // Raw_videoテーブルを更新
      const finalVideo = await prisma.raw_video.update({
        where: {
          id: existingVideo.id,
        },
        data: {
          video_url: s3Url,
        },
      });

      // Videoテーブルに新しいレコードを作成
      const video = await prisma.video.create({
        data: {
          url: s3Url,
          creator: updatedVideo.userAddress,
          duration: 8,
          title: `Generated Video ${Date.now()}`,
          tokenId: 'default_token_id', // TODO: 適切なtokenIdを設定する必要があります
          status: 'ready',
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          video: finalVideo,
          s3_url: s3Url,
          created_video: video,
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
