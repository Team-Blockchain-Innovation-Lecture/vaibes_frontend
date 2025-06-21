"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Web3プロバイダーを動的にインポート（SSRを無効化）
const Providers = dynamic(() => import("./providers"), {
  ssr: false,
  loading: () => <div>Loading wallet...</div>,
});

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ethereumプロバイダーの競合を防ぐ
    const timer = setTimeout(() => {
      setIsClient(true);
    }, 100); // 少し遅延させてページの初期化を待つ

    return () => clearTimeout(timer);
  }, []);

  // サーバーサイドレンダリング時またはクライアント初期化前
  if (!isClient) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  // クライアントサイドでのみWeb3プロバイダーを使用
  return <Providers>{children}</Providers>;
}
