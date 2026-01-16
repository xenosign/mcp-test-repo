import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '경찰과 도둑 게임',
  description: '경찰과 도둑 게임 웹 앱',
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
