import { NextRequest, NextResponse } from 'next/server';

import { PrismaClient } from '@/lib/generated/prisma';
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const videoId = request.nextUrl.searchParams.get('video_id');
    if (!videoId) {
      return NextResponse.json({ message: 'video_id is required' }, { status: 400 });
    }
    // "Search by videoId in the Video table"
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    // "If not found"
    if (!video) {
      return NextResponse.json({ message: 'Video not found' }, { status: 404 });
    }

    // "If nft_address is null"
    if (!video.nft_address) {
      return NextResponse.json({ message: 'NFT address not found' }, { status: 404 });
    }

    // "If nft_address exists"
    return NextResponse.json(
      { data: { nft_address: video.nft_address }, success: true },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
