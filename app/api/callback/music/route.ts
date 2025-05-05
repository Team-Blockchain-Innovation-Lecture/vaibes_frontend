import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Store callback data as global variable
// TypeScript type definitions
declare global {
  var callbackStorage: Map<string, any>;
}

// Store callback data in global storage
// In production, it is recommended to use persistent storage such as Redis or database
if (typeof global.callbackStorage === 'undefined') {
  global.callbackStorage = new Map();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { callback_data, task_id, status, success } = body;

    // Save callback data
    global.callbackStorage.set(task_id, {
      callback_data,
      status,
      success,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Callback received',
    });
  } catch (error) {
    console.error('Error handling callback:', error);
    return NextResponse.json(
      { success: false, message: 'Error occurred while processing callback' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Get task_id from URL parameters
    const { searchParams } = new URL(request.url);
    const task_id = searchParams.get('task_id');

    if (!task_id) {
      return NextResponse.json({ success: false, message: 'task_id is required' }, { status: 400 });
    }

    // Check task_id and is_completed status in Raw_music table
    const rawMusic = await prisma.raw_music.findFirst({
      where: {
        task_id: task_id,
        is_completed: true,
      },
    });

    if (!rawMusic) {
      return NextResponse.json(
        { success: false, message: 'No completed music found' },
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
      { success: false, message: 'Error occurred while retrieving callback data' },
      { status: 500 }
    );
  }
}
