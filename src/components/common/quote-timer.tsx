"use client"

import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import { useQuoteStore } from "@/store/quote-store"
import { useQuoteCountdown } from "@/hooks/use-quote-countdown"
import { QuoteStatus } from "@/lib/types"

/** Shows countdown or "Expired" from quote store. Re-renders only inside this component. */
export function QuoteTimer() {
  const status = useQuoteStore((s) => s.status)
  const expiresAt = useQuoteStore((s) =>
    s.status === QuoteStatus.Success || s.status === QuoteStatus.Expired ? s.expiresAt! : 0
  )
  const expire = useQuoteStore((s) => s.expire)

  const { secondsLeft, isExpired } = useQuoteCountdown(expiresAt, expire)

  if (
    (status !== QuoteStatus.Success && status !== QuoteStatus.Expired) ||
    !expiresAt
  ) {
    return null
  }

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
