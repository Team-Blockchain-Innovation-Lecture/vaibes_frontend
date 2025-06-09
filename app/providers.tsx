'use client';

import { UnifiedWalletProvider } from '@jup-ag/wallet-adapter';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { CoinbaseWalletAdapter } from '@solana/wallet-adapter-coinbase';
import { TrustWalletAdapter } from '@solana/wallet-adapter-trust';
import { useWrappedReownAdapter } from '@jup-ag/jup-mobile-adapter';
import type { Adapter } from '@solana/wallet-adapter-base';
import { useMemo } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const wallets: Adapter[] = useMemo(() => {
    const { reownAdapter, jupiterAdapter } = useWrappedReownAdapter({
      appKitOptions: {
        metadata: {
          name: 'vaibes.fun',
          description: 'vaibes.fun daps',
          url: 'https://reown.com/appkit',
          icons: ['https://assets.reown.com/reown-profile-pic.png'],
        },
        projectId: process.env.NEXT_PUBLIC_REOWN_PROJECTID || '',
        features: {
          analytics: false,
          socials: ['google', 'x', 'apple'],
          email: false,
        },
        enableWallets: false,
      },
    });
    return [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new TrustWalletAdapter(),
      reownAdapter,
      jupiterAdapter,
    ].filter((item) => item && item.name && item.icon) as Adapter[];
  }, []);

  return (
    <UnifiedWalletProvider
      wallets={wallets}
      config={{
        autoConnect: true,
        env: 'mainnet-beta',
        metadata: {
          name: 'UnifiedWallet',
          description: 'UnifiedWallet',
          url: 'https://jup.ag',
          iconUrls: ['https://jup.ag/favicon.ico'],
        },
        theme: 'dark',
        lang: 'en',
      }}
    >
      {children}
    </UnifiedWalletProvider>
  );
}
