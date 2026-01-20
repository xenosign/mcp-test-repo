import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Running Man 게임',
  description: 'Running Man 게임 웹 앱',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
