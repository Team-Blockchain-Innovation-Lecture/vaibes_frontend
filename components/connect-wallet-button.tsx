import { Button } from "@/components/ui/button"
import { usePrivy } from "@privy-io/react-auth" 
import {PublicKey, Transaction, Connection, SystemProgram} from '@solana/web3.js';
import {useSolanaWallets} from '@privy-io/react-auth/solana';
import { SolanaIcon } from "./solana-icon";
import { LogOut } from "lucide-react";

export function ConnectWalletButton() {
  const { ready, authenticated, login, user, logout } = usePrivy();
  const { wallets } = useSolanaWallets();

  if (!ready) {
    return (
      <Button className="bg-gray-300 text-gray-600 font-medium rounded-full px-6" disabled>
        Loading...
      </Button>
    );
  }

  if (authenticated) {
    const solanaWallet = wallets && wallets.length > 0 ? wallets[0] : null;
    
    return (
      <div className="flex items-center gap-2">
        <Button 
          className="bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF] hover:opacity-90 text-white font-medium rounded-full px-6 transition-all duration-300 shadow-lg flex items-center gap-2" 
        >
          <SolanaIcon size={20} className="mr-1" />
          {solanaWallet?.address 
            ? `${solanaWallet.address.slice(0, 6)}...${solanaWallet.address.slice(-4)}`
            : 'Wallet Connected'
          }
        </Button>
        
        <Button 
          variant="outline"
          className="bg-[#2a1242] text-white border border-purple-400/30 hover:border-purple-400/50 hover:bg-[#3a1a5a] rounded-full px-4 transition-all duration-200 shadow-md flex items-center gap-1" 
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
      className="bg-[#d4af37] hover:bg-[#c4a027] text-black font-medium rounded-full px-6 transition-all duration-200" 
      onClick={() => login()}
    >
      Connect Wallet
    </Button>
  )
} 

