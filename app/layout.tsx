import type React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import "@/app/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppLayout } from "@/components/app-layout";
import { Header } from "@/components/header";
import ClientProviders from "./client-providers";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "vaibes.fun",
  description:
    "Every second, enerate good-vibes short videos and their own tokens, giving beginner creators a brand-new way to launch content.",
  icons: {
    icon: "/favicon/logo_color.png",
    shortcut: "/favicon/logo_color.png",
    apple: "/favicon/logo_color.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <AppLayout>{children}</AppLayout>
          </ThemeProvider>
        </ClientProviders>
      </body>
    </html>
  );
}

import "./globals.css";
