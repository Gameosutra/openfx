"use client"

import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

type QuoteTimerProps = {
  expiresAt: number
  isExpired: boolean
}

/** Shows countdown or "Expired". Parent should drive isExpired from Date.now() vs expiresAt. */
export function QuoteTimer({ expiresAt, isExpired }: QuoteTimerProps) {
  const secondsLeft = isExpired
    ? 0
    : Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))

  return (
    <Badge
      variant={isExpired ? "destructive" : "outline"}
      className={`font-mono text-xs ${
        !isExpired && secondsLeft <= 10
          ? "border-warning text-warning-foreground bg-warning/10"
          : ""
      }`}
    >
      <Clock className="h-3 w-3" />
      {isExpired ? "Expired" : `${secondsLeft}s remaining`}
    </Badge>
  )
}
