import { Button } from "@/components/ui/button"
import { usePrivy } from "@privy-io/react-auth" 
import {PublicKey, Transaction, Connection, SystemProgram} from '@solana/web3.js';
import {useSolanaWallets} from '@privy-io/react-auth/solana';
import { SolanaIcon } from "./solana-icon";

export function ConnectWalletButton() {
  const { ready, authenticated, login, user, logout } = usePrivy();
  const { wallets } = useSolanaWallets();

  if (!ready) {
    return (
      <Button className="bg-gray-300 text-gray-600 font-medium rounded-full px-6" disabled>
        読み込み中...
      </Button>
    );
  }

  if (authenticated) {
    const solanaWallet = wallets && wallets.length > 0 ? wallets[0] : null;
    
    return (
      <Button 
        className="bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF] hover:opacity-90 text-white font-medium rounded-full px-6 transition-all duration-300 shadow-lg flex items-center gap-2" 
        onClick={() => logout()}
      >
        <SolanaIcon size={20} className="mr-1" />
        {solanaWallet?.address 
          ? `${solanaWallet.address.slice(0, 6)}...${solanaWallet.address.slice(-4)}`
          : 'ウォレット接続済み'
        }
      </Button>
    );
  }

  return (
    <Button 
      className="bg-[#d4af37] hover:bg-[#c4a027] text-black font-medium rounded-full px-6 transition-all duration-200" 
      onClick={() => login()}
    >
      ウォレットを接続
    </Button>
  )
} 

