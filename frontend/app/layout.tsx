import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletProvider } from '@/lib/walletContext'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AfriYield - AI-Powered Micro-Lending',
  description: 'Empowering smallholder farmers in East Africa with instant micro-loans',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          {children}
          <Navigation />
        </WalletProvider>
      </body>
    </html>
  )
}
