import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Global variable to store generating tasks (use Redis in production)
const generatingTasks = new Map();

export async function POST(req: NextRequest) {
  try {
    // Extract parameters from request body
    const {
      prompt,
      genre = 'EDM',
      instrumental = false,
      model_version = 'v4',
      timeout = 3,
      task_id = null,
    } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          message: 'Prompt is required',
        },
        { status: 400 }
      );
    }

    // Generate unique task ID
    const taskId = task_id || uuidv4();

    // Record generation start
    generatingTasks.set(taskId, {
      status: 'processing',
      startTime: Date.now(),
      prompt,
      genre,
      instrumental,
    });

    console.log(`Music generation task started: ${taskId}`);

    try {
      // Check if task with same task_id exists
      const existingTask = await prisma.raw_music.findUnique({
        where: {
          task_id: task_id,
        },
      });

      if (existingTask) {
        console.log(`[Task ID: ${task_id}] Task already exists. Skipping processing.`);
        return NextResponse.json({
          success: true,
          message: 'Task already exists',
          data: existingTask,
        });
      }

      // Call external API to generate music
      if (!process.env.MUSIC_API_URL) {
        throw new Error('MUSIC_API_URL is not set in environment variables');
      }
      const response = await fetch(process.env.MUSIC_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          genre,
          instrumental,
          model_version,
          timeout,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`External API call error: ${response.status} ${errorText}`);
        throw new Error(`External API call error: ${response.status}`);
      }

      // Return response directly from external API
      const resultData = await response.json();
      console.log('Response from external API:', resultData);

      // Update generation status
      generatingTasks.set(taskId, {
        status: 'completed',
        endTime: Date.now(),
        data: resultData,
      });

      // Return external API response directly to client
      return NextResponse.json({
        success: true,
        task_id: taskId,
        data: resultData,
      });
    } catch (error: any) {
      console.error(`Music generation error: ${error.message}`);

      // Record error status
      generatingTasks.set(taskId, {
        status: 'error',
        error: error.message,
        endTime: Date.now(),
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Error occurred during music generation',
          error: error.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error(`Request processing error: ${error.message}`);
    return NextResponse.json(
      {
        success: false,
        message: 'Error occurred while processing request',
      },
      { status: 500 }
    );
  }
}
