import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AppLayout } from "@/components/app-layout"
import Providers from "./providers"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "vaibes.fun - Create Music",
  description: "Drop your ideas, make a song",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <Providers>
        <body className={inter.className}>
            <ThemeProvider attribute="class" defaultTheme="dark">
            <AppLayout>{children}</AppLayout>
            </ThemeProvider>
        </body>
      </Providers>
    </html>
  )
}



import './globals.css'