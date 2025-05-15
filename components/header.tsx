'use client';

import { ConnectWalletButton } from '@/components/connect-wallet-button';
import { WalletActionsButton } from '@/components/wallet-actions-button';
import { ConnectJupiterButton } from '@/components/connect-jupiter-button';
import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  return (
    <div className="sticky top-0 z-10 flex justify-between items-center px-4 md:px-6 bg-[#1a0a2e]/80 backdrop-blur-sm border-b border-white/10">
      <div className="flex items-center">
        <Link href="/" className="flex items-center ">
          <Image
            src="/images/logo.png"
            alt="Vaibes Logo"
            width={80}
            height={32}
            className="cursor-pointer object-contain"
          />
          <h1 className="hidden md:block text-4xl font-bold">
            <span className="text-white">v</span>
            <span className="bg-gradient-to-r from-[#00e5ff] to-[#ff16e2] text-transparent bg-clip-text">
              ai
            </span>
            <span className="text-white">bes.fun</span>
          </h1>
        </Link>
      </div>

      <div className="flex gap-2">
        <div className="hidden md:block">
          <WalletActionsButton />
        </div>
        <ConnectWalletButton />
        <ConnectJupiterButton />
      </div>
    </div>
  );
}
