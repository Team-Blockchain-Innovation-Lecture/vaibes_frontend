import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { Wallet } from "lucide-react";

export function FundWalletButton() {
  const privy = usePrivy();

  if (!privy.authenticated) {
    return null;
  }

  // Privyの資金追加機能は実装が異なる可能性があります
  // 最新のPrivy APIに基づき、以下の方法があります:
  // 1. dappを使用して転送する
  // 2. ユーザーにメタマスク/フィアットのアドレスを表示して転送してもらう
  // 3. Privyダッシュボードへリダイレクトする
  
  const handleAddFunds = () => {
    // もしPrivyがopenFundingModalのようなメソッドを提供している場合は使用できます
    // 代わりに、ユーザーにウォレットアドレスを表示するか、外部サービスに送るなどの対応が可能です
    if (typeof privy.user?.wallet?.address === 'string') {
      // アドレスをクリップボードにコピーして、ユーザーに通知
      navigator.clipboard.writeText(privy.user.wallet.address);
      alert(`Wallet address copied: ${privy.user.wallet.address}\nYou can now send funds to this address.`);
    } else {
      alert("Wallet address not available.");
    }
  };

  return (
    <Button
      variant="outline"
      className="bg-[#2a1242] text-white border border-purple-400/30 hover:border-purple-400/50 hover:bg-[#3a1a5a] rounded-full px-4 py-2 transition-all duration-200 shadow-md flex items-center gap-1"
      onClick={handleAddFunds}
    >
      <Wallet size={16} className="opacity-80 mr-1" />
      Add Funds
    </Button>
  );
} 