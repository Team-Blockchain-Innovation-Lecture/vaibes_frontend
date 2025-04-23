import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { Wallet, ArrowDownToLine, ArrowUpRight, Copy, Check, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SolanaIcon } from "./solana-icon";
import { 
  Connection, 
  PublicKey, 
  LAMPORTS_PER_SOL, 
  SystemProgram, 
  Transaction 
} from "@solana/web3.js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Solana RPC URL
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

export function WalletActionsButton({
  externalWalletAddress,
  externalWalletType
}: {
  externalWalletAddress?: string;
  externalWalletType?: string;
}) {
  const { authenticated } = usePrivy();
  const { wallets } = useSolanaWallets();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // 送金関連の状態
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [sendingStatus, setSendingStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [sendingError, setSendingError] = useState("");
  const [sendingTxHash, setSendingTxHash] = useState("");

  // ウォレットアドレスの決定（外部ウォレットを優先）
  const solanaWallet = wallets && wallets.length > 0 ? wallets[0] : null;
  const privyWalletAddress = solanaWallet?.address || '';
  const walletAddress = externalWalletAddress || privyWalletAddress;
  const isExternalWallet = !!externalWalletAddress;

  // 残高を取得する関数
  const fetchBalance = useCallback(async () => {
    if (!walletAddress) return;
    
    try {
      setLoadingBalance(true);
      const connection = new Connection(SOLANA_RPC_URL);
      const publicKey = new PublicKey(walletAddress);
      const balanceInLamports = await connection.getBalance(publicKey);
      const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;
      setBalance(balanceInSOL);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
    } finally {
      setLoadingBalance(false);
    }
  }, [walletAddress]);

  // ダイアログが開かれたときに残高を取得
  useEffect(() => {
    if (dialogOpen && walletAddress) {
      fetchBalance();
    }
  }, [dialogOpen, walletAddress, fetchBalance]);

  const copyToClipboard = useCallback((text: string) => {
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
  }, []);

  // 送金処理
  const handleSendTransaction = useCallback(async () => {
    if ((!solanaWallet && !isExternalWallet) || !recipientAddress || !amount) {
      setSendingError("Please fill in all fields");
      return;
    }

    try {
      setSendingStatus("loading");
      setSendingError("");

      // 送金先アドレスの検証
      let toPublicKey: PublicKey;
      try {
        toPublicKey = new PublicKey(recipientAddress);
      } catch (err) {
        setSendingError("Invalid recipient address");
        setSendingStatus("error");
        return;
      }

      // 送金額の検証
      const amountInLamports = parseFloat(amount) * LAMPORTS_PER_SOL;
      if (isNaN(amountInLamports) || amountInLamports <= 0) {
        setSendingError("Invalid amount");
        setSendingStatus("error");
        return;
      }

      // 残高チェック
      if (balance !== null && parseFloat(amount) > balance) {
        setSendingError("Insufficient balance");
        setSendingStatus("error");
        return;
      }

      // Solanaコネクションの作成
      const connection = new Connection(SOLANA_RPC_URL);

      // トランザクションの作成
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(walletAddress),
          toPubkey: toPublicKey,
          lamports: amountInLamports,
        })
      );

      // 最新のブロックハッシュを取得
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(walletAddress);

      let signature: string;

      if (isExternalWallet) {
        // 外部ウォレット（Phantom等）を使用する場合
        try {
          // @ts-ignore - Phantom APIにアクセス
          const phantom = window.phantom?.solana;
          
          if (!phantom) {
            throw new Error("Phantom wallet not found");
          }
          
          // Phantomウォレットでトランザクションに署名して送信
          const { signature: txSignature } = await phantom.signAndSendTransaction(transaction);
          signature = txSignature;
        } catch (error) {
          console.error("Error with external wallet transaction:", error);
          throw new Error("Failed to sign transaction with external wallet");
        }
      } else {
        // Privy埋め込みウォレットを使用する場合
        if (!solanaWallet) {
          throw new Error("No wallet available");
        }
        
        const signedTransaction = await solanaWallet.signTransaction(transaction);
        signature = await connection.sendRawTransaction(signedTransaction.serialize());
      }

      // トランザクションの確認
      await connection.confirmTransaction(signature);
      
      setSendingTxHash(signature);
      setSendingStatus("success");
      setRecipientAddress("");
      setAmount("");
      
      // 送金後に残高を更新
      fetchBalance();
    } catch (error) {
      console.error("Error sending transaction:", error);
      setSendingError(error instanceof Error ? error.message : "Failed to send transaction");
      setSendingStatus("error");
    }
  }, [solanaWallet, isExternalWallet, recipientAddress, amount, balance, walletAddress, fetchBalance]);

  // 早期リターン - ウォレットがない場合は表示しない
  if ((!authenticated && !isExternalWallet) || (!solanaWallet && !isExternalWallet)) {
    return null;
  }

  // クライアントサイドでのみ実行されるコンポーネントを返す
  return (
    <>
      <Button
        variant="outline"
        className="bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF] hover:opacity-90 text-white font-medium rounded-full px-4 py-2 transition-all duration-200 shadow-md flex items-center gap-1"
        onClick={() => setDialogOpen(true)}
      >
        <Wallet size={16} className="mr-1" />
        {balance !== null ? `${balance.toFixed(4)} SOL` : "Wallet"}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1a0a2e] text-white border border-purple-400/30 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <SolanaIcon size={24} /> 
              {isExternalWallet && externalWalletType ? `${externalWalletType} Wallet` : "Solana Wallet"}
            </DialogTitle>
            <DialogDescription className="text-gray-300 flex flex-col">
              <div className="flex justify-between items-center">
                <span>Send and receive SOL or other Solana tokens.</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full text-gray-300 hover:text-white hover:bg-[#3a1a5a]"
                  onClick={fetchBalance}
                  disabled={loadingBalance}
                >
                  <RefreshCw size={14} className={`${loadingBalance ? 'animate-spin' : ''}`} />
                  <span className="sr-only">Refresh balance</span>
                </Button>
              </div>
              <div className="mt-2 py-2 px-3 bg-[#2a1242] rounded-md flex justify-between items-center">
                <span className="text-sm font-medium">Balance:</span>
                <span className="font-mono font-semibold text-lg">
                  {loadingBalance ? (
                    <span className="text-gray-400 text-sm">Loading...</span>
                  ) : balance !== null ? (
                    `${balance.toFixed(6)} SOL`
                  ) : (
                    <span className="text-gray-400 text-sm">Unknown</span>
                  )}
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="receive" className="w-full">
            <TabsList className="w-full bg-[#2a1242] mb-4">
              <TabsTrigger value="receive" className="w-1/2 data-[state=active]:bg-[#3a1a5a]">
                <ArrowDownToLine size={16} className="mr-2" />
                Receive
              </TabsTrigger>
              <TabsTrigger value="send" className="w-1/2 data-[state=active]:bg-[#3a1a5a]">
                <ArrowUpRight size={16} className="mr-2" />
                Send
              </TabsTrigger>
            </TabsList>

            <TabsContent value="receive" className="mt-0">
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
                <p className="text-sm text-gray-300">You can receive funds by:</p>
                <ul className="list-disc list-inside text-sm space-y-1 text-gray-300">
                  <li>Sharing your address with others</li>
                  <li>Receiving SOL from an exchange</li>
                  <li>Using a fiat on-ramp service</li>
                </ul>
              </div>

              <div className="flex justify-center mt-4">
                <Button
                  className="bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF] hover:opacity-90 text-white font-medium rounded-full px-6"
                  onClick={() => copyToClipboard(walletAddress)}
                >
                  <Copy size={16} className="mr-2" />
                  {copied ? "Copied!" : "Copy Address"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="send" className="mt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient" className="text-white">Recipient Address</Label>
                  <Input
                    id="recipient"
                    placeholder="Enter Solana address"
                    className="bg-[#2a1242] border-purple-400/30 text-white"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="amount" className="text-white">Amount (SOL)</Label>
                    {balance !== null && (
                      <button
                        type="button"
                        className="text-xs text-purple-300 hover:text-purple-200"
                        onClick={() => setAmount(balance.toString())}
                      >
                        Max: {balance.toFixed(6)} SOL
                      </button>
                    )}
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.0"
                    className="bg-[#2a1242] border-purple-400/30 text-white"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="0.001"
                  />
                </div>

                {sendingStatus === "error" && (
                  <div className="p-2 bg-red-900/40 border border-red-500 rounded text-red-200 text-sm">
                    {sendingError || "An error occurred"}
                  </div>
                )}

                {sendingStatus === "success" && (
                  <div className="p-2 bg-green-900/40 border border-green-500 rounded text-green-200 text-sm">
                    Transaction successful! 
                    <a 
                      href={`https://explorer.solana.com/tx/${sendingTxHash}?cluster=devnet`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-1 underline"
                    >
                      View on explorer
                    </a>
                  </div>
                )}
              </div>

              <DialogFooter className="mt-4">
                <Button
                  className="bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF] hover:opacity-90 text-white font-medium rounded-full w-full"
                  onClick={handleSendTransaction}
                  disabled={sendingStatus === "loading" || loadingBalance}
                >
                  {sendingStatus === "loading" ? "Sending..." : "Send SOL"}
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
} 