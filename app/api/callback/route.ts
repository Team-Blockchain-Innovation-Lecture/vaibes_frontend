import { NextResponse } from 'next/server';

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
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      message: "コールバックを受信しました"
    });
  } catch (error) {
    console.error("Error handling callback:", error);
    return NextResponse.json(
      { success: false, message: "コールバック処理中にエラーが発生しました" },
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
      return NextResponse.json(
        { success: false, message: "task_idは必須です" },
        { status: 400 }
      );
    }
    
    // まず、ストレージにデータがあるか確認
    const localData = global.callbackStorage.get(task_id);
    
    // ローカルストレージにデータがあれば、それを返す
    if (localData) {
      return NextResponse.json({
        success: true,
        data: localData
      });
    }
    
    // ローカルストレージになければ、外部APIからデータを取得
    try {
      const apiEndpoint = `${process.env.CALLBACK_API_URL}/${task_id}`;
      console.log(`Fetching callback data from: ${apiEndpoint}`);
      
      const response = await fetch(apiEndpoint);
      
      if (!response.ok) {
        return NextResponse.json(
          { success: false, message: `外部APIからのデータ取得に失敗しました: ${response.status}` },
          { status: response.status }
        );
      }
      
      const data = await response.json();
      
      // 取得したデータをローカルストレージに保存
      global.callbackStorage.set(task_id, data);
      
      return NextResponse.json({
        success: true,
        data: data
      });
    } catch (error) {
      console.error("Error fetching from external API:", error);
      return NextResponse.json(
        { success: false, message: "外部APIからのデータ取得中にエラーが発生しました" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error retrieving callback data:", error);
    return NextResponse.json(
      { success: false, message: "コールバックデータの取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
} 