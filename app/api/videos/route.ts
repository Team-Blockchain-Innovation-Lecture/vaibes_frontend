import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const sort = searchParams.get("sort") || "playCount"; // デフォルトは再生数でソート
    const order = searchParams.get("order") || "desc"; // デフォルトは降順
    const tokenId = searchParams.get("tokenId") || undefined; // 特定のトークンに関連する動画のみを取得
    const walletAddress = searchParams.get("walletAddress") || null; // ユーザーのウォレットアドレス（いいね状態の確認用）

    // 検索条件
    const search = searchParams.get("search") || undefined; // 検索キーワード

    // フィルター条件の構築
    let whereCondition: any = {};

    // フィルタリングが必要な場合は、status条件を追加
    // ステータスパラメータが指定された場合のみステータスでフィルタリング
    const status = searchParams.get("status");
    if (status) {
      whereCondition.status = status;
    }
    // それ以外はすべてのビデオを返す（準備中も含む）

    // 検索条件を追加
    if (search) {
      whereCondition.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // 特定のトークンの動画のみを取得する場合
    if (tokenId) {
      whereCondition.tokenId = tokenId;
    }

    // 動画を取得
    const videos = await prisma.video.findMany({
      where: whereCondition,
      take: limit,
      skip: offset,
      orderBy: {
        [sort]: order,
      },
      include: {
        token: {
          select: {
            id: true,
            name: true,
            symbol: true,
            logo: true,
            marketCap: true, // Add marketCap to the selection
          },
        },
      },
    });
    console.log("videos", videos);

    // ユーザーのいいね情報を取得
    let videosWithLikeStatus = videos;

    if (walletAddress) {
      const userLikes = await prisma.videoLike.findMany({
        where: {
          userId: walletAddress,
          videoId: {
            in: videos.map((video) => video.id),
          },
        },
        select: {
          videoId: true,
        },
      });

      // いいねしたビデオIDのセットを作成
      const likedVideoIds = new Set(userLikes.map((like) => like.videoId));

      // 各ビデオにisLikedフラグを追加
      videosWithLikeStatus = videos.map((video) => ({
        ...video,
        isLiked: likedVideoIds.has(video.id),
      }));
    }

    // ビデオの総数を取得
    const totalCount = await prisma.video.count({
      where: whereCondition,
    });
    console.log("totalCount", totalCount);

    return NextResponse.json({
      videos: videosWithLikeStatus,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + videos.length < totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching videos" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
