import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import "./index.scss"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Flowser',
  description: 'Supercharged development on Flow blockchain 🏄‍♂️ ⚡',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
