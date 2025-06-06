import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { task_id, userAddress, prompt, music_task_id } = body;

    // Create record in raw_music table
    const rawMusic = await prisma.raw_music.create({
      data: {
        task_id: task_id,
        music_task_id: music_task_id,
        userAddress: userAddress || '0x1234567890123456789012345678901234567890',
        is_completed: false,
        audio_url: '',
        image_url: '',
        prompt: prompt || '',
      },
    });

    return NextResponse.json({ success: true, data: rawMusic });
  } catch (error) {
    console.error('Error creating raw music record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create raw music record' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { task_id, is_completed, audio_url, image_url } = body;

    // Find and update record by task_id
    const updated = await prisma.raw_music.updateMany({
      where: { task_id },
      data: {
        is_completed,
        audio_url,
        image_url,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating raw music record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update raw music record' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
