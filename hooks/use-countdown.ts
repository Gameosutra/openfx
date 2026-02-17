"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export function useCountdown(expiresAt: number | null) {
  const [secondsLeft, setSecondsLeft] = useState<number>(0)
  const [isExpired, setIsExpired] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const calculateRemaining = useCallback(() => {
    if (!expiresAt) return 0
    return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
  }, [expiresAt])

  useEffect(() => {
    if (!expiresAt) {
      setSecondsLeft(0)
      setIsExpired(false)
      return
    }

    const remaining = calculateRemaining()
    setSecondsLeft(remaining)
    setIsExpired(remaining <= 0)

    if (remaining <= 0) return

    intervalRef.current = setInterval(() => {
      const newRemaining = calculateRemaining()
      setSecondsLeft(newRemaining)
      if (newRemaining <= 0) {
        setIsExpired(true)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [expiresAt, calculateRemaining])

  return { secondsLeft, isExpired }
}
