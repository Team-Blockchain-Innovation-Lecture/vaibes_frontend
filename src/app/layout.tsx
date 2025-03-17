import type React from "react"
import { MobileNav } from "@/components/MobileNav"
import { ThemeProvider } from "@/components/ThemeProvider"
import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "vaibes.fun - Create Music",
  description: "Drop your ideas, make a song",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
