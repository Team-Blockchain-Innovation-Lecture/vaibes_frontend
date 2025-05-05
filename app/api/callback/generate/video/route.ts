import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// Initialize S3 client
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

    // Request validation
    if (!body.payload?.video?.url) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
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

      // Get related music data
      const musicData = await prisma.raw_music.findFirst({
        where: {
          userAddress: updatedVideo.userAddress,
        },
        orderBy: {
          id: 'desc',
        },
      });

      if (!musicData?.audio_url) {
        throw new Error('No audio URL found for merging');
      }

      // Call API to merge audio and video
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

      const margedData = await mergeResponse.json();

      if (!mergeResponse.ok) {
        throw new Error('Video-audio merge request failed');
      }

      console.log(`[Task ID: ${taskId}] Merged Data:`, margedData);

      // Create new record in Video table
      // const video = await prisma.video.create({
      //   data: {
      //     url: margedData.output_path,
      //     duration: 8,
      //     title: `Generated Video ${Date.now()}`,
      //     tokenId: updatedVideo.userAddress, // TODO: Set appropriate tokenId
      //     status: 'ready',
      //   },
      // });

      // Update record
      const updatedMergedVideo = await prisma.raw_video.update({
        where: {
          id: existingVideo.id,
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
