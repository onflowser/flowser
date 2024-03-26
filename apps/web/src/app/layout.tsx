import type { Metadata } from 'next'
import localFont from "next/font/local";
import "./index.scss"

const inter = localFont({
  src: "./Inter.woff2"
})

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
