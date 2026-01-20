/**
 * Geolocation 유틸리티
 * - 브라우저 내장 Geolocation API 사용 (HTTPS 또는 localhost에서 동작)
 * - 별도 npm 의존성 없음
 */

/** 위도·경도 좌표 */
export interface GeoCoordinates {
  latitude: number
  longitude: number
  /** 미터 단위 정확도 (가능한 경우) */
  accuracy?: number
  /** 고도 미터 (가능한 경우) */
  altitude?: number | null
  /** 고도 정확도 (가능한 경우) */
  altitudeAccuracy?: number | null
  /** 이동 속도 m/s (가능한 경우) */
  speed?: number | null
  /** 나침반 방향 0~360 (가능한 경우) */
  heading?: number | null
}

/** getCurrentPosition / watchPosition 옵션 */
export interface GeolocationOptions {
  /** 고정밀(GPS) 사용 시도, 배터리 소모 증가 */
  enableHighAccuracy?: boolean
  /** 대기 최대 시간(ms) */
  timeout?: number
  /** 캐시된 위치 허용 최대 나이(ms), 0이면 새로 조회 */
  maximumAge?: number
}

/** Geolocation 에러 코드 */
export type GeolocationErrorCode =
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'NOT_SUPPORTED'
  | 'SECURE_CONTEXT_REQUIRED'

export interface GeolocationError {
  code: GeolocationErrorCode
  message: string
}

/** 보안 컨텍스트(HTTPS/localhost) 여부 */
export function isGeolocationSupported(): boolean {
  if (typeof window === 'undefined') return false
  return 'geolocation' in navigator
}

/** HTTPS 또는 localhost 여부 (Geolocation 필수 조건) */
export function isSecureContext(): boolean {
  if (typeof window === 'undefined') return false
  return window.isSecureContext === true
}

/** 한 번만 현재 위치 조회 (Promise) */
export function getCurrentPosition(
  options: GeolocationOptions = {}
): Promise<GeoCoordinates> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject({
        code: 'NOT_SUPPORTED' as const,
        message: '이 브라우저는 Geolocation을 지원하지 않습니다.',
      } satisfies GeolocationError)
      return
    }
    if (!isSecureContext()) {
      reject({
        code: 'SECURE_CONTEXT_REQUIRED' as const,
        message: '위치 조회는 HTTPS 또는 localhost에서만 가능합니다.',
      } satisfies GeolocationError)
      return
    }

    const { enableHighAccuracy = true, timeout = 10000, maximumAge = 0 } = options

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? undefined,
          altitude: pos.coords.altitude ?? null,
          altitudeAccuracy: pos.coords.altitudeAccuracy ?? null,
          speed: pos.coords.speed ?? null,
          heading: pos.coords.heading ?? null,
        })
      },
      (err) => {
        const code = mapErrorCode(err.code)
        const message = err.message || getDefaultErrorMessage(code)
        reject({ code, message } satisfies GeolocationError)
      },
      { enableHighAccuracy, timeout, maximumAge }
    )
  })
}

/** 브라우저 에러 코드 → 우리 타입 */
function mapErrorCode(code: number): GeolocationErrorCode {
  switch (code) {
    case 1:
      return 'PERMISSION_DENIED'
    case 2:
      return 'POSITION_UNAVAILABLE'
    case 3:
      return 'TIMEOUT'
    default:
      return 'POSITION_UNAVAILABLE'
  }
}

function getDefaultErrorMessage(code: GeolocationErrorCode): string {
  switch (code) {
    case 'PERMISSION_DENIED':
      return '위치 권한이 거부되었습니다.'
    case 'POSITION_UNAVAILABLE':
      return '위치를 확인할 수 없습니다.'
    case 'TIMEOUT':
      return '위치 조회 시간이 초과되었습니다.'
    case 'NOT_SUPPORTED':
      return 'Geolocation을 지원하지 않는 환경입니다.'
    case 'SECURE_CONTEXT_REQUIRED':
      return 'HTTPS 또는 localhost에서만 위치 조회가 가능합니다.'
    default:
      return '위치 조회 중 오류가 발생했습니다.'
  }
}

/** watchPosition ID 타입 (clear 시 사용) */
export type WatchId = number

/**
 * 위치 변경 감시 시작.
 * 반환된 id로 clearWatch(id) 호출 시 감시 해제.
 */
export function watchPosition(
  onSuccess: (coords: GeoCoordinates) => void,
  onError?: (err: GeolocationError) => void,
  options: GeolocationOptions = {}
): WatchId | null {
  if (!isGeolocationSupported() || !isSecureContext()) {
    onError?.({
      code: isGeolocationSupported() ? 'SECURE_CONTEXT_REQUIRED' : 'NOT_SUPPORTED',
      message: isGeolocationSupported()
        ? 'HTTPS 또는 localhost에서만 위치 조회가 가능합니다.'
        : '이 브라우저는 Geolocation을 지원하지 않습니다.',
    })
    return null
  }

  const { enableHighAccuracy = true, timeout = 10000, maximumAge = 0 } = options

  const id = navigator.geolocation.watchPosition(
    (pos) => {
      onSuccess({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy ?? undefined,
        altitude: pos.coords.altitude ?? null,
        altitudeAccuracy: pos.coords.altitudeAccuracy ?? null,
        speed: pos.coords.speed ?? null,
        heading: pos.coords.heading ?? null,
      })
    },
    (err) => {
      onError?.({
        code: mapErrorCode(err.code),
        message: err.message || getDefaultErrorMessage(mapErrorCode(err.code)),
      })
    },
    { enableHighAccuracy, timeout, maximumAge }
  )
  return id
}

/** watchPosition 해제 (브라우저 API 그대로 사용) */
export function clearWatch(watchId: WatchId): void {
  if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    navigator.geolocation.clearWatch(watchId)
  }
}
