import { Button } from "@/components/ui/button"
import { usePrivy } from "@privy-io/react-auth" 

export function ConnectWalletButton() {
  const { ready, authenticated, login, user, logout } = usePrivy();

  if (!ready) {
    return (
      <Button className="bg-gray-300 text-gray-600 font-medium rounded-full px-6" disabled>
        読み込み中...
      </Button>
    );
  }

  if (authenticated) {
    return (
      <Button 
        className="bg-[#d4af37] hover:bg-[#c4a027] text-black font-medium rounded-full px-6" 
        onClick={() => logout()}
      >
        {user?.wallet?.address 
          ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
          : 'ウォレット接続済み'
        }
      </Button>
    );
  }

  return (
    <Button 
      className="bg-[#d4af37] hover:bg-[#c4a027] text-black font-medium rounded-full px-6" 
      onClick={() => login()}
    >
      ウォレットを接続
    </Button>
  )
} 

