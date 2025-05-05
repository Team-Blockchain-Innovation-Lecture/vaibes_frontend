import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { Wallet } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SolanaIcon } from "./solana-icon";

export function FundSolanaWalletButton() {
  const { authenticated } = usePrivy();
  const { wallets } = useSolanaWallets();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!authenticated || !wallets || wallets.length === 0) {
    return null;
  }

  const solanaWallet = wallets[0];
  const walletAddress = solanaWallet?.address || '';

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
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
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
      
      document.body.removeChild(textArea);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF] hover:opacity-90 text-white font-medium rounded-full px-4 py-2 transition-all duration-200 shadow-md flex items-center gap-1"
        onClick={() => setDialogOpen(true)}
      >
        <Wallet size={16} className="mr-1" />
        Add Funds
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1a0a2e] text-white border border-purple-400/30 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <SolanaIcon size={24} /> 
              Add Funds to Solana Wallet
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Send SOL or other Solana tokens to your wallet address.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 bg-[#2a1242] rounded-md my-2">
            <p className="text-sm text-gray-300 mb-2">Your Solana Wallet Address:</p>
            <div 
              className="p-3 bg-[#3a1a5a] rounded border border-purple-400/30 font-mono text-sm break-all cursor-pointer hover:bg-[#4a2a6a] transition-colors"
              onClick={() => copyToClipboard(walletAddress)}
            >
              {walletAddress}
              <span className="ml-2 inline-flex items-center">
                {copied ? 
                  <span className="text-green-400 text-xs">Copied!</span> : 
                  <span className="text-purple-300 text-xs">Click to Copy</span>
                }
              </span>
            </div>
          </div>

          <div className="mt-2 space-y-2">
            <p className="text-sm text-gray-300">You can add funds by:</p>
            <ul className="list-disc list-inside text-sm space-y-1 text-gray-300">
              <li>Sending SOL from an exchange</li>
              <li>Transferring from another wallet</li>
              <li>Using a fiat on-ramp service</li>
            </ul>
          </div>

          <div className="flex justify-center mt-4">
            <Button
              className="bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF] hover:opacity-90 text-white font-medium rounded-full px-6"
              onClick={() => {
                copyToClipboard(walletAddress);
                // ここにオプションで外部サービスへのリンクなどを追加できます
              }}
            >
              Copy Address
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 