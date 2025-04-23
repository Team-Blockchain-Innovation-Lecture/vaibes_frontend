import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// 生成中のタスクを格納するグローバル変数（本番環境ではRedisなどを使う）
const generatingTasks = new Map();

export async function POST(req: NextRequest) {
  try {
    // リクエストボディからパラメータを抽出
    const { prompt, genre = "EDM", instrumental = false, model_version = "v4", timeout = 120, task_id = null } = await req.json();
    
    if (!prompt) {
      return NextResponse.json({ 
        success: false, 
        message: "プロンプトが必要です" 
      }, { status: 400 });
    }
    
    // 一意のタスクIDを生成
    const taskId = task_id || uuidv4();
    
    // 生成開始を記録
    generatingTasks.set(taskId, { 
      status: "processing",
      startTime: Date.now(),
      prompt,
      genre,
      instrumental
    });
    
    console.log(`音楽生成タスク開始: ${taskId}`);
    
    try {
      // 外部APIを呼び出して音楽を生成
      const response = await fetch("https://ae73-240b-10-27c1-7e00-2425-9b44-c411-f7a7.ngrok-free.app/api/generate-with-callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          genre,
          instrumental,
          model_version,
          timeout
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`外部API呼び出しエラー: ${response.status} ${errorText}`);
        throw new Error(`外部API呼び出しエラー: ${response.status}`);
      }
      
      // 外部APIからのレスポンスを直接返す
      const resultData = await response.json();
      console.log("外部APIからのレスポンス:", resultData);
      
      // 生成ステータスを更新
      generatingTasks.set(taskId, {
        status: "completed",
        endTime: Date.now(),
        data: resultData
      });
      
      // 外部APIからのレスポンスを直接クライアントに返す
      return NextResponse.json({
        success: true,
        task_id: taskId,
        data: resultData
      });
      
    } catch (error: any) {
      console.error(`音楽生成エラー: ${error.message}`);
      
      // エラーステータスを記録
      generatingTasks.set(taskId, {
        status: "error",
        error: error.message,
        endTime: Date.now()
      });
      
      return NextResponse.json({ 
        success: false, 
        message: "音楽生成中にエラーが発生しました",
        error: error.message
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error(`リクエスト処理エラー: ${error.message}`);
    return NextResponse.json({ 
      success: false, 
      message: "リクエスト処理中にエラーが発生しました" 
    }, { status: 500 });
  }
} 