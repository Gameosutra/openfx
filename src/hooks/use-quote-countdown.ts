"use client"

import { useEffect, useRef, useState } from "react"
import { QUOTE_EXPIRY_CHECK_INTERVAL_MS } from "@/lib/constants"

/**
 * Resolves live countdown for a quote. Only the component using this hook
 * re-renders every second; parents stay stable. Call onExpired when time runs out.
 */
export function useQuoteCountdown(
  expiresAt: number,
  onExpired?: () => void
): { secondsLeft: number; isExpired: boolean } {
  const [tick, setTick] = useState(() => Date.now())
  const onExpiredRef = useRef(onExpired)
  const firedRef = useRef(false)
  onExpiredRef.current = onExpired

  useEffect(() => {
    if (expiresAt <= 0) return
    const t = Date.now()
    if (!firedRef.current && t > expiresAt) {
      firedRef.current = true
      onExpiredRef.current?.()
    }
    const interval = setInterval(() => {
      const now = Date.now()
      setTick(now)
      if (!firedRef.current && now > expiresAt) {
        firedRef.current = true
        onExpiredRef.current?.()
      }
    }, QUOTE_EXPIRY_CHECK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [expiresAt])

  const now = tick
  const isExpired = now > expiresAt
  const secondsLeft = isExpired
    ? 0
    : Math.max(0, Math.floor((expiresAt - now) / 1000))

  return { secondsLeft, isExpired }
}
