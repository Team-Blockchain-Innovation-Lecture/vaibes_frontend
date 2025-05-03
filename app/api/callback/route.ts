import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// グローバル変数としてコールバックデータを保存
// TypeScriptの型定義
declare global {
  var callbackStorage: Map<string, any>;
}

// コールバックデータを保持するためのグローバルストレージ
// 本番環境では、Redisやデータベースなどの永続ストレージを使用することを推奨
if (typeof global.callbackStorage === 'undefined') {
  global.callbackStorage = new Map();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { callback_data, task_id, status, success } = body;

    // コールバックデータを保存
    global.callbackStorage.set(task_id, {
      callback_data,
      status,
      success,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'コールバックを受信しました',
    });
  } catch (error) {
    console.error('Error handling callback:', error);
    return NextResponse.json(
      { success: false, message: 'コールバック処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // URLパラメータからtask_idを取得
    const { searchParams } = new URL(request.url);
    const task_id = searchParams.get('task_id');

    if (!task_id) {
      return NextResponse.json({ success: false, message: 'task_idは必須です' }, { status: 400 });
    }

    // Raw_musicテーブルでtask_idとis_completedの状態を確認
    const rawMusic = await prisma.raw_music.findFirst({
      where: {
        task_id: task_id,
        is_completed: true,
      },
    });

    if (!rawMusic) {
      return NextResponse.json(
        { success: false, message: '完了した音楽が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rawMusic,
    });
  } catch (error) {
    console.error('Error retrieving callback data:', error);
    return NextResponse.json(
      { success: false, message: 'コールバックデータの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
