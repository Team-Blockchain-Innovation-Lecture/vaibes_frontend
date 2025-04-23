'use client';

import {PrivyProvider} from '@privy-io/react-auth';

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';
const privyClientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID || '';

export default function Providers({children}: {children: React.ReactNode}) {

  return (
    <PrivyProvider
      appId={privyAppId}
      clientId={privyClientId}
      config={{
        // Emailログインとウォレットログインを許可
        loginMethods: ['email', 'wallet'],
        
        // 外部ウォレットの設定
        walletConnectCloudProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
        
        // エンベデッドウォレットの設定
        embeddedWallets: {
          // すべてのユーザーに対してウォレットを作成
          createOnLogin: 'all-users',
          
          // Ethereumウォレットを明示的に無効化 - 型に合わせて設定
          ethereum: {
            createOnLogin: "off"
          },
          
          // Solanaウォレットをサポート - すべてのユーザーに作成
          solana: {
            createOnLogin: 'all-users'
          }
        },
        
        // 外観設定
        appearance: {
          theme: 'dark',
          accentColor: '#d4af37',
          showWalletLoginFirst: true, // ウォレットログインを先に表示
        },
        
      }}
    >
      {children}
    </PrivyProvider>
  );
}