import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

// GET /api/users/[walletAddress]/stats
export async function GET(
  request: NextRequest,
  { params }: { params: { walletAddress: string } }
) {
  try {
    const walletAddress = params.walletAddress;

    // Get total number of videos created by the user
    const totalVideos = await prisma.video.count({
      where: {
        creator: walletAddress,
      },
    });

    // Get total play count for all videos created by the user
    const videoStats = await prisma.video.aggregate({
      where: {
        creator: walletAddress,
      },
      _sum: {
        playCount: true,
        likeCount: true,
      },
    });

    // ここを単純化: ランキング情報はオプショナルにして、エラーが発生しても基本情報は返す
    let rank = null;

    try {
      // ビデオが1つ以上ある場合のみランキングを取得
      if (totalVideos > 0) {
        // クリエイターごとの合計再生数を取得 (シンプルなクエリに変更)
        const creatorStats = await prisma.$queryRaw`
          SELECT creator, SUM(playCount) as totalPlays
          FROM Video
          WHERE creator IS NOT NULL
          GROUP BY creator
          ORDER BY totalPlays DESC
        `;

        // creatorStatsは配列として返ってくるはず
        if (Array.isArray(creatorStats)) {
          // indexOf+1でランキングを計算
          const creatorIndex = creatorStats.findIndex(
            (stat: any) => stat.creator === walletAddress
          );

          if (creatorIndex !== -1) {
            rank = creatorIndex + 1;
          }
        }
      }
    } catch (rankError) {
      console.error("Error calculating rank:", rankError);
      // ランキング計算でエラーが発生しても、他の統計情報は返す
    }

    const stats = {
      totalVideos,
      totalPlays: videoStats._sum.playCount || 0,
      totalLikes: videoStats._sum.likeCount || 0,
      rank: rank, // ランキング情報（null の場合もある）
    };

    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
