"use client";

import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { WalletActionsButton } from "@/components/wallet-actions-button";

export function Header() {
  return (
    <div className="sticky top-0 z-10 flex justify-end gap-2 p-4 md:p-6 bg-[#1a0a2e]/80 backdrop-blur-sm border-b border-white/10">
      <WalletActionsButton />
      <ConnectWalletButton />
    </div>
  );
} 