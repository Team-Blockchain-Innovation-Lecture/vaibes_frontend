"use client";

import { UnifiedWalletProvider } from "@jup-ag/wallet-adapter";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { CoinbaseWalletAdapter } from "@solana/wallet-adapter-coinbase";
import { TrustWalletAdapter } from "@solana/wallet-adapter-trust";
import type { Adapter } from "@solana/wallet-adapter-base";
import { useMemo, useEffect, useState } from "react";
import { useWrappedReownAdapter } from "@jup-ag/jup-mobile-adapter";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const wallets: Adapter[] = useMemo(() => {
    // クライアントサイドでのみウォレットを初期化
    if (!isMounted || typeof window === "undefined") {
      return [];
    }

    const { reownAdapter, jupiterAdapter } = useWrappedReownAdapter({
      appKitOptions: {
        metadata: {
          name: "vaibes.fun",
          description: "vaibes.fun daps",
          url: "https://reown.com/appkit",
          icons: ["https://assets.reown.com/reown-profile-pic.png"],
        },
        projectId: process.env.NEXT_PUBLIC_REOWN_PROJECTID || "",
        features: {
          analytics: false,
          socials: ["google", "x", "apple"],
          email: false,
        },
        enableWallets: false,
      },
    });

    // 基本的なウォレットアダプターのみ使用（競合を避けるため）
    try {
      return [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
        new CoinbaseWalletAdapter(),
        new TrustWalletAdapter(),
        reownAdapter,
        jupiterAdapter,
      ].filter((item) => {
        try {
          return item && item.name && item.icon;
        } catch (error) {
          console.warn(
            `Failed to initialize wallet adapter: ${item?.name}`,
            error
          );
          return false;
        }
      }) as Adapter[];
    } catch (error) {
      console.error("Failed to initialize wallet adapters:", error);
      return [];
    }
  }, [isMounted]);

  // マウント前は何もレンダリングしない
  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <UnifiedWalletProvider
      wallets={wallets}
      config={{
        autoConnect: true,
        env: "mainnet-beta",
        metadata: {
          name: "UnifiedWallet",
          description: "UnifiedWallet",
          url: "https://jup.ag",
          iconUrls: ["https://jup.ag/favicon.ico"],
        },
        theme: "dark",
        lang: "en",
      }}
    >
      {children}
    </UnifiedWalletProvider>
  );
}
