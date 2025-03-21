import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, message: "プロンプトは必須です" },
        { status: 400 }
      );
    }

    // 外部APIにリクエストを送信
    const response = await fetch("http://localhost:5001/api/generate/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "画像生成に失敗しました");
    }

    // 成功レスポンスを返す
    return NextResponse.json({
      success: true,
      message: "画像生成が完了しました",
      image_url: data.image_url,
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { success: false, message: "画像生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
} 