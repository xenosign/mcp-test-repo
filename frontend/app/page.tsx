'use client'

import { LocationStatus } from '@/components/LocationStatus'

export default function Home() {
  return (
    <main style={{ padding: '20px', minHeight: '100vh' }}>
      <h1>Running Man 게임</h1>
      <p>카카오톡 로그인으로 시작하세요</p>
      {/* TODO: 카카오톡 로그인 버튼 추가 */}

      <section className="mt-6 max-w-md">
        <h2 className="mb-2 text-lg font-medium">위치 확인</h2>
        <LocationStatus />
      </section>
    </main>
  )
}
