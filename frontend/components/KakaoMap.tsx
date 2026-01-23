 'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

declare global {
  interface Window {
    kakao?: any
  }
}

interface KakaoMapProps {
  className?: string
}

export function KakaoMap({ className }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY
    if (!appKey) {
      setError('카카오 맵 키가 설정되지 않았습니다.')
      return
    }

    const initMap = () => {
      const kakao = window.kakao
      if (!kakao?.maps || !mapRef.current) {
        return
      }

      kakao.maps.load(() => {
        const center = new kakao.maps.LatLng(37.5665, 126.9780) // 서울 시청
        const map = new kakao.maps.Map(mapRef.current, {
          center,
          level: 3,
        })
        new kakao.maps.Marker({ position: center, map })
      })
    }

    if (window.kakao?.maps) {
      initMap()
      return
    }

    const scriptId = 'kakao-map-sdk'
    const existing = document.getElementById(scriptId)
    if (existing) {
      existing.addEventListener('load', initMap)
      return () => existing.removeEventListener('load', initMap)
    }

    const script = document.createElement('script')
    script.id = scriptId
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`
    script.async = true
    script.onload = initMap
    script.onerror = () => setError('카카오 맵 로딩에 실패했습니다.')
    document.head.appendChild(script)

    return () => {
      script.onload = null
      script.onerror = null
    }
  }, [])

  if (error) {
    return (
      <div className={cn('rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800', className)}>
        {error}
      </div>
    )
  }

  return (
    <div
      ref={mapRef}
      className={cn('h-64 w-full rounded-lg border border-slate-200 bg-slate-50', className)}
    />
  )
}
