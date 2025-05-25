import { UnifiedWalletButton } from '@jup-ag/wallet-adapter';
import { useUnifiedWallet } from '@jup-ag/wallet-adapter';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export const ConnectJupiterButton = () => {
  return (
    <>
      <UnifiedWalletButton
        overrideContent={
          <Button className="bg-[#d4af37] hover:bg-[#c4a027] text-black font-medium rounded-full px-4 py-2 w-full sm:w-auto text-base sm:text-sm transition-all duration-200">
            Connect Wallet
          </Button>
        }
        currentUserClassName="bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF] hover:opacity-90 text-white font-medium rounded-full px-4 py-2 w-full sm:w-auto text-sm sm:text-base transition-all duration-300 shadow-lg flex items-center gap-2"
      />
      <ReleaseButton />
    </>
  );
};

export default function ReleaseButton() {
  const { disconnect, connected } = useUnifiedWallet();

  return (
    <>
      {connected && (
        <>
          <Button
            variant="outline"
            className="bg-[#2a1242] text-white border border-purple-400/30 hover:border-purple-400/50 hover:bg-[#3a1a5a] rounded-full px-4 py-2 w-full sm:w-auto text-base sm:text-sm transition-all duration-200 shadow-md flex items-center gap-1"
            onClick={disconnect}
          >
            <LogOut size={16} className="opacity-80" />
            Logout
          </Button>
        </>
      )}
    </>
  );
}
