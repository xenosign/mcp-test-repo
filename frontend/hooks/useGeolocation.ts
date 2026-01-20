'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getCurrentPosition,
  watchPosition,
  clearWatch,
  isGeolocationSupported,
  isSecureContext,
  type GeoCoordinates,
  type GeolocationError,
  type GeolocationOptions,
  type WatchId,
} from '@/lib/geolocation'

export interface UseGeolocationOptions extends GeolocationOptions {
  /** true면 watchPosition으로 계속 추적, false면 getCurrentPosition 1회 */
  watch?: boolean
  /** watch일 때만: 마운트 시 자동 시작. false면 trigger() 호출 시 시작 */
  immediate?: boolean
}

export interface UseGeolocationResult {
  /** 현재 좌표 (로드 전/에러 시 null) */
  position: GeoCoordinates | null
  /** 조회 중 */
  loading: boolean
  /** 에러 (권한 거부, 타임아웃 등) */
  error: GeolocationError | null
  /** 지원 여부 */
  isSupported: boolean
  /** HTTPS/localhost 여부 */
  isSecure: boolean
  /** 수동으로 한 번만 위치 재조회 (watch 모드와 무관) */
  refetch: () => Promise<void>
  /** watch 모드일 때: 감시 시작 (이미 동작 중이면 무시) */
  startWatching: () => void
  /** watch 모드일 때: 감시 중지 */
  stopWatching: () => void
}

/**
 * Geolocation React 훅
 * - HTTPS 또는 localhost에서만 동작 (브라우저 제한)
 * - 1회 조회(getCurrentPosition) 또는 지속 감시(watchPosition) 선택 가능
 */
export function useGeolocation(
  options: UseGeolocationOptions = {}
): UseGeolocationResult {
  const {
    watch = false,
    immediate = true,
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
  } = options

  const [position, setPosition] = useState<GeoCoordinates | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<GeolocationError | null>(null)
  const [watchId, setWatchId] = useState<WatchId | null>(null)

  const isSupported = isGeolocationSupported()
  const isSecure = isSecureContext()

  const geoOptions: GeolocationOptions = {
    enableHighAccuracy,
    timeout,
    maximumAge,
  }

  const refetch = useCallback(async () => {
    if (!isSupported || !isSecure) return
    setError(null)
    setLoading(true)
    try {
      const coords = await getCurrentPosition(geoOptions)
      setPosition(coords)
    } catch (e) {
      setError(e as GeolocationError)
    } finally {
      setLoading(false)
    }
  }, [isSupported, isSecure, enableHighAccuracy, timeout, maximumAge])

  const startWatching = useCallback(() => {
    if (!isSupported || !isSecure || watchId !== null) return
    setError(null)
    setLoading(true)
    const id = watchPosition(
      (coords) => {
        setPosition(coords)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      },
      geoOptions
    )
    if (id !== null) setWatchId(id)
  }, [isSupported, isSecure, watchId, enableHighAccuracy, timeout, maximumAge])

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      clearWatch(watchId)
      setWatchId(null)
    }
  }, [watchId])

  // 1회 조회: 마운트 시 또는 refetch 호출 시
  useEffect(() => {
    if (!watch && isSupported && isSecure && immediate) {
      refetch()
    }
  }, [watch, immediate, isSupported, isSecure]) // refetch는 안 넣음 - 무한루프 방지

  // watch 모드: 마운트 시 시작, 언마운트 시 해제
  useEffect(() => {
    if (!watch) return
    if (immediate) startWatching()
    return () => stopWatching()
  }, [watch, immediate]) // startWatching/stopWatching 의존성 제한으로 안정화

  return {
    position,
    loading,
    error,
    isSupported,
    isSecure,
    refetch,
    startWatching,
    stopWatching,
  }
}
