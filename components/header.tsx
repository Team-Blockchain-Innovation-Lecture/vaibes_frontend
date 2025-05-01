"use client";

import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { WalletActionsButton } from "@/components/wallet-actions-button";
import Link from "next/link";
import Image from "next/image";

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
          <span className="hidden md:block text-4xl ">vaibes.fun</span>
        </Link>
      </div>

      <div className="flex gap-2">
        <div className="hidden md:block">
          <WalletActionsButton />
        </div>
        <ConnectWalletButton />
      </div>
    </div>
  );
}
