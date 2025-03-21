import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, genre } = body;

    if (!prompt || !genre) {
      return NextResponse.json(
        { success: false, message: "プロンプトとジャンルは必須です" },
        { status: 400 }
      );
    }

    // 外部APIにリクエストを送信
    const response = await fetch("http://localhost:5001/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, genre }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "音楽生成に失敗しました");
    }

    // 成功レスポンスを返す
    return NextResponse.json({
      success: true,
      message: "音楽生成が完了しました",
      audio_url: data.audio_url,
      genre: genre
    });
  } catch (error) {
    console.error("Error generating music:", error);
    return NextResponse.json(
      { success: false, message: "音楽生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
} 