import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Laptop Fix Makassar | Jual Beli & Servis Laptop Bekas Berkualitas',
  description: 'Jual beli & tukar tambah laptop bekas berkualitas bergaransi di Makassar. Lokasi Jl. Sultan Alauddin No. 137E, Makassar.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${spaceGrotesk.variable} dark`}>
      <body className="min-h-screen bg-[#0A0A0F] text-slate-100 font-sans antialiased selection:bg-[#2E5FE8]/30 selection:text-white">
        {children}
      </body>
    </html>
  )
}
