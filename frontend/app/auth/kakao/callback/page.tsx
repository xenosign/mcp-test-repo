'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import apiClient from '@/lib/api'

interface KakaoLoginResponse {
  id: number
  nickname?: string
  email?: string
  profileImageUrl?: string
  thumbnailImageUrl?: string
}

export default function KakaoCallbackPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [kakaoUser, setKakaoUser] = useState<KakaoLoginResponse | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) {
      setError('인가 코드가 없습니다.')
      setLoading(false)
      return
    }

    const redirectUri = `${window.location.origin}/auth/kakao/callback`

    const fetchUser = async () => {
      try {
        const response = await apiClient.post<KakaoLoginResponse>('/auth/kakao/oauth', {
          code,
          redirectUri,
        })
        setKakaoUser(response.data)
      } catch (err) {
        setError('카카오 로그인 처리에 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [searchParams])

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-xl font-semibold">카카오 로그인</h1>

      {loading && <p className="mt-4 text-sm text-slate-600">로그인 처리 중…</p>}

      {!loading && error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && kakaoUser && (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <p className="font-medium">카카오 로그인 성공</p>
          <p>닉네임: {kakaoUser.nickname ?? '알 수 없음'}</p>
          {kakaoUser.email && <p>이메일: {kakaoUser.email}</p>}
        </div>
      )}

      <div className="mt-6">
        <Link href="/" className="text-sm text-slate-600 underline hover:no-underline">
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  )
}
