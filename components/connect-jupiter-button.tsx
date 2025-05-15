import { UnifiedWalletProvider, UnifiedWalletButton } from '@jup-ag/wallet-adapter';
import { useMemo } from 'react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { CoinbaseWalletAdapter } from '@solana/wallet-adapter-coinbase';
import { TrustWalletAdapter } from '@solana/wallet-adapter-trust';
import { useWrappedReownAdapter } from '@jup-ag/jup-mobile-adapter';
import type { Adapter } from '@solana/wallet-adapter-base';
import { useUnifiedWallet } from '@jup-ag/wallet-adapter';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export const ConnectJupiterButton = () => {
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
        notificationCallback: {
          onConnect: () => {},
          onConnecting: () => {},
          onDisconnect: () => {},
          onNotInstalled: () => {},
        },
        walletlistExplanation: {
          href: 'https://station.jup.ag/docs/additional-topics/wallet-list',
        },
        theme: 'dark',
        lang: 'en',
      }}
    >
      <UnifiedWalletButton />
      <ReleaseButton />
    </UnifiedWalletProvider>
  );
};

export default function ReleaseButton() {
  const { publicKey, disconnect, connected } = useUnifiedWallet();

  return (
    <>
      {connected && (
        <>
          <Button
            variant="outline"
            className="bg-[#2a1242] text-white border border-purple-400/30 hover:border-purple-400/50 hover:bg-[#3a1a5a] rounded-full px-4 py-2 w-full sm:w-auto text-base sm:text-sm transition-all duration-200 shadow-md flex items-center gap-1"
            onClick={disconnect}
          >
            <LogOut size={16} className="opacity-80" />
            Logout
          </Button>
        </>
      )}
    </>
  );
}
