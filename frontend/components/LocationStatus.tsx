'use client'

import { useGeolocation } from '@/hooks/useGeolocation'
import { cn } from '@/lib/utils'

interface LocationStatusProps {
  className?: string
  /** 위치 조회 실패 시 표시할 대체 메시지 */
  fallbackMessage?: string
}

/**
 * 현재 위치 상태를 표시하는 UI 컴포넌트
 * - HTTPS 또는 localhost에서만 동작 (브라우저 Geolocation API)
 */
export function LocationStatus({ className, fallbackMessage }: LocationStatusProps) {
  const { position, loading, error, isSupported, isSecure, refetch } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 10000,
  })

  if (!isSupported) {
    return (
      <div className={cn('rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800', className)}>
        이 브라우저는 위치 조회를 지원하지 않습니다.
      </div>
    )
  }

  if (!isSecure) {
    return (
      <div className={cn('rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800', className)}>
        위치 조회는 HTTPS 또는 localhost에서만 가능합니다.
      </div>
    )
  }

  if (loading && !position) {
    return (
      <div className={cn('rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600', className)}>
        위치 확인 중…
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800', className)}>
        <p>{error.message}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-2 text-red-600 underline hover:no-underline"
        >
          다시 시도
        </button>
      </div>
    )
  }

  if (!position) {
    return (
      <div className={cn('rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600', className)}>
        {fallbackMessage ?? '위치를 조회할 수 없습니다.'}
        <button
          type="button"
          onClick={() => refetch()}
          className="ml-2 text-slate-600 underline hover:no-underline"
        >
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <div className={cn('rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800', className)}>
      <p className="font-medium">현재 위치</p>
      <p>
        위도 {position.latitude.toFixed(6)}, 경도 {position.longitude.toFixed(6)}
      </p>
      {position.accuracy != null && (
        <p className="text-emerald-600">정확도 ±{Math.round(position.accuracy)}m</p>
      )}
      <button
        type="button"
        onClick={() => refetch()}
        className="mt-1 text-emerald-600 underline hover:no-underline"
      >
        위치 새로고침
      </button>
    </div>
  )
}
