"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";
const privyClientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID || "";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={privyAppId}
      clientId={privyClientId}
      config={{
        // Allow email and wallet login
        loginMethods: ["email", "wallet"],

        // Embedded wallet configuration
        embeddedWallets: {
          // Create wallet for all users
          createOnLogin: "all-users",

          // Explicitly disable Ethereum wallet - set according to type
          ethereum: {
            createOnLogin: "off",
          },

          // Support Solana wallet - create for all users
          solana: {
            createOnLogin: "all-users",
          },
        },

        // Appearance settings
        appearance: {
          theme: "dark",
          accentColor: "#d4af37",
          showWalletLoginFirst: true, // Show wallet login first
          walletChainType: "solana-only",
          walletList: [
            "detected_wallets",
            "phantom",
            "solflare",
            "backpack",
            "okx_wallet",
          ],
        },
        // Solana wallet connection
        externalWallets: {
          solana: {
            connectors: toSolanaWalletConnectors(), // Configure Solana wallet connectors
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
