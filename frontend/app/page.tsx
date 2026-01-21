'use client'

import { LocationStatus } from '@/components/LocationStatus'

export default function Home() {
  const handleKakaoLogin = async () => {
    const kakaoRestApiKey = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY
    if (!kakaoRestApiKey) {
      alert('카카오 REST API 키가 설정되지 않았습니다.')
      return
    }

    const redirectUri = `${window.location.origin}/auth/kakao/callback`
    const kakaoAuthUrl =
      'https://kauth.kakao.com/oauth/authorize' +
      `?response_type=code&client_id=${encodeURIComponent(kakaoRestApiKey)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}`

    window.location.href = kakaoAuthUrl
  }

  return (
    <main style={{ padding: '20px', minHeight: '100vh' }}>
      <h1>Running Man 게임</h1>
      <p>카카오톡 로그인으로 시작하세요</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleKakaoLogin}
          className="rounded-md bg-yellow-400 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-300"
        >
          카카오로 시작하기
        </button>
        <button
          type="button"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          로그인 없이 시작하기
        </button>
      </div>

      <section className="mt-6 max-w-md">
        <h2 className="mb-2 text-lg font-medium">위치 확인</h2>
        <LocationStatus />
      </section>
    </main>
  )
}
