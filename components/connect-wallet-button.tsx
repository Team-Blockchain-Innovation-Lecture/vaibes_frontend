import { Button } from "@/components/ui/button"
import { usePrivy } from "@privy-io/react-auth" 
import { PublicKey } from '@solana/web3.js';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { SolanaIcon } from "./solana-icon";
import { LogOut, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ConnectWalletButton() {
  const { ready, authenticated, login, user, logout } = usePrivy();
  const { wallets } = useSolanaWallets();
  const [copied, setCopied] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'wallet' | null>(null);
  const [solanaAddress, setSolanaAddress] = useState<string>('');
  const [walletType, setWalletType] = useState<string>('');

  // Phantomウォレットに接続する関数
  const connectPhantom = async () => {
    try {
      // @ts-ignore - Phantom APIにアクセス
      const phantom = window.phantom?.solana;
      
      if (phantom) {
        try {
          // すでに接続されているか確認
          if (phantom.isConnected) {
            const publicKey = phantom.publicKey;
            if (publicKey) {
              setSolanaAddress(publicKey.toString());
              setWalletType('Phantom');
              return true;
            }
          } else {
            // 接続リクエスト
            const connection = await phantom.connect();
            if (connection.publicKey) {
              setSolanaAddress(connection.publicKey.toString());
              setWalletType('Phantom');
              return true;
            }
          }
        } catch (error) {
          console.error("Failed to connect to Phantom wallet:", error);
        }
      }
    } catch (error) {
      console.error("Error accessing Phantom wallet:", error);
    }
    return false;
  };

  // カスタムログイン処理
  const handleLogin = async () => {
    // まずPhantomウォレットへの接続を試みる
    const phantomConnected = await connectPhantom();
    
    if (!phantomConnected) {
      // Phantomに接続できなかった場合、通常のPrivyログインフローを使用
      login();
    }
  };

  // ユーザー情報が更新されたときにログイン方法を特定
  useEffect(() => {
    if (authenticated && user) {
      // ウォレットでログインしたかどうかを確認
      if (user.linkedAccounts?.some(account => account.type === 'wallet')) {
        setLoginMethod('wallet');
      } else {
        setLoginMethod('email');
      }
    } else {
      setLoginMethod(null);
    }
  }, [authenticated, user]);

  // Solanaウォレットアドレスを取得
  useEffect(() => {
    const getSolanaAddress = async () => {
      if (authenticated) {
        try {
          // 1. 直接ブラウザからPhantomウォレットにアクセスを試みる（優先）
          try {
            // @ts-ignore - Phantom APIにアクセス
            const phantom = window.phantom?.solana;
            
            if (phantom && phantom.isConnected) {
              const publicKey = phantom.publicKey;
              if (publicKey) {
                setSolanaAddress(publicKey.toString());
                setWalletType('Phantom');
                return;
              }
            }
            
            // Solflareも試す
            // @ts-ignore - Solflare APIにアクセス
            const solflare = window.solflare;
            if (solflare && solflare.isConnected) {
              const publicKey = solflare.publicKey;
              if (publicKey) {
                setSolanaAddress(publicKey.toString());
                setWalletType('Solflare');
                return;
              }
            }
          } catch (error) {
            console.error("Error accessing external Solana wallets directly:", error);
          }

          // 2. Privyのエンベデッドウォレットから取得（バックアップ方法）
          if (wallets && wallets.length > 0) {
            const solWallet = wallets[0];
            if (solWallet?.address) {
              try {
                const pubKey = new PublicKey(solWallet.address);
                setSolanaAddress(pubKey.toBase58());
                setWalletType('embedded');
                return;
              } catch (error) {
                console.error("Invalid Solana address format from embedded wallet:", error);
              }
            }
          }

          // アドレスが見つからない場合
          setSolanaAddress('');
          setWalletType('');
        } catch (error) {
          console.error("Error getting Solana address:", error);
          setSolanaAddress('');
          setWalletType('');
        }
      } else {
        // 認証されていない場合でもPhantomに接続されていないか確認
        try {
          // @ts-ignore
          const phantom = window.phantom?.solana;
          if (phantom && phantom.isConnected && phantom.publicKey) {
            setSolanaAddress(phantom.publicKey.toString());
            setWalletType('Phantom');
          } else {
            setSolanaAddress('');
            setWalletType('');
          }
        } catch (error) {
          setSolanaAddress('');
          setWalletType('');
        }
      }
    };

    getSolanaAddress();
  }, [authenticated, wallets, loginMethod]);

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

  if (!ready) {
    return (
      <Button className="bg-gray-300 text-gray-600 font-medium rounded-full px-6" disabled>
        Loading...
      </Button>
    );
  }

  if (authenticated || (walletType === 'Phantom' && solanaAddress)) {
    // アドレスがない場合は「Wallet Connected」を表示
    const formattedAddress = solanaAddress 
      ? `${solanaAddress.slice(0, 6)}...${solanaAddress.slice(-4)}` 
      : 'Wallet Connected';
    
    return (
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF] hover:opacity-90 text-white font-medium rounded-full px-6 transition-all duration-300 shadow-lg flex items-center gap-2" 
                onClick={() => solanaAddress && copyToClipboard(solanaAddress)}
              >
                <SolanaIcon size={20} className="mr-1" />
                {loginMethod === 'wallet' || walletType === 'Phantom' || walletType === 'Solflare' ? 
                  <span className="flex items-center">
                    <span className="mr-1 text-xs font-bold bg-purple-600 text-white rounded-full px-2 py-0.5">
                      {walletType || 'Wallet'}
                    </span>
                    {formattedAddress}
                  </span> : 
                  formattedAddress
                }
                {solanaAddress && (
                  <span className="ml-1">
                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="opacity-70" />}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{copied ? 'Copied!' : 'Click to copy address'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Button 
          variant="outline"
          className="bg-[#2a1242] text-white border border-purple-400/30 hover:border-purple-400/50 hover:bg-[#3a1a5a] rounded-full px-4 transition-all duration-200 shadow-md flex items-center gap-1" 
          onClick={() => {
            if (walletType === 'Phantom') {
              // @ts-ignore
              window.phantom?.solana?.disconnect();
            }
            logout();
            setSolanaAddress('');
            setWalletType('');
          }}
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
      onClick={handleLogin}
    >
      Connect Wallet
    </Button>
  )
} 

