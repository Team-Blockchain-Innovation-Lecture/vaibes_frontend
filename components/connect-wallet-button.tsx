"use client";

import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { SolanaIcon } from "./solana-icon";
import { LogOut, Copy, Check } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ConnectWalletButton() {
  const { ready, authenticated, login, user, logout } = usePrivy();
  const { wallets } = useSolanaWallets();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          console.error("Failed to copy to clipboard");
        });
    } else {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }

      document.body.removeChild(textArea);
    }
  };

  if (!ready) {
    return (
      <Button
        className="bg-gray-300 text-gray-600 font-medium rounded-full px-4 py-2 w-full sm:w-auto text-base sm:text-sm"
        disabled
      >
        Loading...
      </Button>
    );
  }

  if (authenticated) {
    const solanaWallet = wallets && wallets.length > 0 ? wallets[0] : null;
    const walletAddress = solanaWallet?.address || "";

    return (
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF] hover:opacity-90 text-white font-medium rounded-full px-4 py-2 w-full sm:w-auto text-sm sm:text-base transition-all duration-300 shadow-lg flex items-center gap-2"
                onClick={() => walletAddress && copyToClipboard(walletAddress)}
              >
                <SolanaIcon size={20} className="mr-1" />
                <span className="truncate max-w-[80px] sm:max-w-none text-xs sm:text-base">
                  {walletAddress
                    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
                    : "Wallet Connected"}
                </span>
                {walletAddress && (
                  <span className="ml-1">
                    {copied ? (
                      <Check size={16} className="text-green-400" />
                    ) : (
                      <Copy size={16} className="opacity-70" />
                    )}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{copied ? "Copied!" : "Click to copy address"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button
          variant="outline"
          className="bg-[#2a1242] text-white border border-purple-400/30 hover:border-purple-400/50 hover:bg-[#3a1a5a] rounded-full px-4 py-2 w-full sm:w-auto text-base sm:text-sm transition-all duration-200 shadow-md flex items-center gap-1"
          onClick={() => logout()}
        >
          <LogOut size={16} className="opacity-80" />
          Logout
        </Button>
      </div>
    );
  }

  return (
    <Button
      className="bg-[#d4af37] hover:bg-[#c4a027] text-black font-medium rounded-full px-4 py-2 w-full sm:w-auto text-base sm:text-sm transition-all duration-200"
      onClick={() => login()}
    >
      Connect Wallet
    </Button>
  );
}
