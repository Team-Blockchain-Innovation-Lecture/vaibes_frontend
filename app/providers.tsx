'use client';

import { UnifiedWalletProvider } from '@jup-ag/wallet-adapter';
import { useMemo } from 'react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { CoinbaseWalletAdapter } from '@solana/wallet-adapter-coinbase';
import { TrustWalletAdapter } from '@solana/wallet-adapter-trust';
import { useWrappedReownAdapter } from '@jup-ag/jup-mobile-adapter';
import type { Adapter } from '@solana/wallet-adapter-base';

export default function Providers({ children }: { children: React.ReactNode }) {
  const wallets: Adapter[] = useMemo(() => {
    const { reownAdapter, jupiterAdapter } = useWrappedReownAdapter({
      appKitOptions: {
        metadata: {
          name: 'Your project name',
          description: 'Your project description',
          url: '', // origin must match your domain & subdomain
          icons: [''],
        },
        projectId: '<your-project-id>',
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
