import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format market cap with K, M, B abbreviations
export function formatMarketCap(marketCap: number | null): string {
  if (marketCap === null || marketCap === undefined) return "N/A";

  if (marketCap >= 1_000_000_000) {
    return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
  } else if (marketCap >= 1_000_000) {
    return `$${(marketCap / 1_000_000).toFixed(2)}M`;
  } else if (marketCap >= 1_000) {
    return `$${(marketCap / 1_000).toFixed(2)}K`;
  } else {
    return `$${marketCap.toFixed(2)}`;
  }
}

// Truncate wallet address for display
export function truncateAddress(
  address: string,
  prefixLength: number = 6,
  suffixLength: number = 4
): string {
  if (!address) return "";
  if (address.length <= prefixLength + suffixLength) return address;

  return `${address.substring(0, prefixLength)}...${address.substring(
    address.length - suffixLength
  )}`;
}
