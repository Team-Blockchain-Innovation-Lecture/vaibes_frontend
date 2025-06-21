"use client";

import React, { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  useUnifiedWallet,
  useUnifiedWalletContext,
} from "@jup-ag/wallet-adapter";

interface MobileHamburgerMenuProps {
  className?: string;
}

export function MobileHamburgerMenu({
  className = "",
}: MobileHamburgerMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { setShowModal } = useUnifiedWalletContext();
  const { publicKey, connected, disconnect } = useUnifiedWallet();

  const walletAddress = publicKey ? publicKey.toBase58() : null;

  const openWalletModal = () => {
    setShowModal(true);
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setShowMenu(false);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  return (
    <>
      {/* Hamburger Menu Button */}
      <div className={`fixed top-6 left-6 z-40 ${className}`}>
        <button
          onClick={() => setShowMenu(true)}
          className="p-3 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-sm"
          aria-label="Open menu"
        >
          <Menu size={24} className="text-white" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {showMenu && (
        <div className="fixed inset-0 z-[100] bg-black/50">
          <div className="fixed top-0 left-0 h-full w-80 bg-[#1a0e26] transform transition-transform duration-300">
            {/* Menu Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <Link
                href="/"
                className="flex items-center"
                onClick={() => setShowMenu(false)}
              >
                <Image
                  src="/images/logo.png"
                  alt="Vaibes Logo"
                  width={60}
                  height={24}
                  className="cursor-pointer object-contain"
                />
                <h1 className="text-2xl font-bold ml-2 cursor-pointer">
                  <span className="text-white">v</span>
                  <span className="bg-gradient-to-r from-[#00e5ff] to-[#ff16e2] text-transparent bg-clip-text">
                    ai
                  </span>
                  <span className="text-white">bes.fun</span>
                </h1>
              </Link>
              <button
                onClick={() => setShowMenu(false)}
                className="p-2 hover:bg-white/10 rounded-full"
                aria-label="Close menu"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            {/* Menu Content */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Connect Wallet Button */}
                <div className="w-full">
                  {connected ? (
                    <div className="space-y-2">
                      <div className="p-3 bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF] rounded-full text-center">
                        <span className="text-white font-medium text-sm">
                          {walletAddress?.substring(0, 8)}...
                          {walletAddress?.substring(walletAddress.length - 4)}
                        </span>
                      </div>
                      <Button
                        onClick={handleDisconnect}
                        variant="outline"
                        className="w-full border-white/20 text-white hover:bg-white/10"
                      >
                        <LogOut size={16} className="mr-2" />
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        openWalletModal();
                        setShowMenu(false);
                      }}
                      className="w-full bg-[#d4af37] hover:bg-[#c4a027] text-black font-medium"
                    >
                      Connect Wallet
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
