import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // URLパラメータからtask_idを取得
    const { searchParams } = new URL(request.url);
    const task_id = searchParams.get('task_id');

    if (!task_id) {
      return NextResponse.json({ success: false, message: 'task_idは必須です' }, { status: 400 });
    }

    // raw_videoテーブルでtask_idとis_completedの状態を確認
    const rawVideo = await prisma.raw_video.findFirst({
      where: {
        task_id: task_id,
        is_completed: true,
      },
    });

    if (!rawVideo) {
      return NextResponse.json(
        { success: false, message: '完了した音楽が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rawVideo,
    });
  } catch (error) {
    console.error('Error retrieving callback data:', error);
    return NextResponse.json(
      { success: false, message: 'コールバックデータの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
