import { Metadata } from "next";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const videoId = params.id;
    
    // Fetch video data
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        token: {
          select: {
            name: true,
            symbol: true,
            logo: true,
          },
        },
      },
    });

    if (!video) {
      return {
        title: "Video Not Found - Vaibes",
        description: "The video you're looking for doesn't exist.",
      };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vaibes.fun';
    const videoUrl = `${appUrl}/videos/${videoId}`;
    const embedUrl = `${appUrl}/videos/${videoId}/embed`;
    const videoTitle = video.title;
    const videoDescription = video.description || `Check out this amazing video on Vaibes!`;
    const thumbnailUrl = video.thumbnailUrl || `${appUrl}/placeholder-video.jpg`;

    return {
      title: `${videoTitle} - Vaibes`,
      description: videoDescription,
      openGraph: {
        title: videoTitle,
        description: videoDescription,
        type: "video.other",
        url: videoUrl,
        images: [
          {
            url: thumbnailUrl,
            width: 1200,
            height: 630,
            alt: videoTitle,
          },
        ],
        videos: [
          {
            url: video.url,
            width: 1080,
            height: 1920,
            type: "video/mp4",
          },
        ],
        siteName: "Vaibes",
      },
      twitter: {
        card: "player",
        title: videoTitle,
        description: videoDescription,
        images: [thumbnailUrl],
        creator: "@vaibes_fun",
        site: "@vaibes_fun",
      },
      other: {
        "twitter:player": embedUrl,
        "twitter:player:width": "1080",
        "twitter:player:height": "1920",
        "twitter:player:stream": video.url,
        "twitter:player:stream:content_type": "video/mp4",
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Video - Vaibes",
      description: "Watch amazing videos on Vaibes",
    };
  } finally {
    await prisma.$disconnect();
  }
}

export default function VideoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 