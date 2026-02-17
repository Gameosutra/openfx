"use client"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCountdown } from "@/hooks/use-countdown"
import { submitPayment } from "@/lib/api"
import { formatCurrency } from "@/lib/currencies"
import type { QuoteResponse } from "@/lib/types"
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Send,
} from "lucide-react"

type ConfirmScreenProps = {
  quote: QuoteResponse
  onPaymentSuccess: (transactionId: string) => void
  onBack: () => void
}

export function ConfirmScreen({
  quote,
  onPaymentSuccess,
  onBack,
}: ConfirmScreenProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasSubmittedRef = useRef(false) // prevent double submit

  const { secondsLeft, isExpired } = useCountdown(quote.expiresAt)

  const handlePay = useCallback(async () => {
    // Prevent double submission
    if (hasSubmittedRef.current || isSubmitting) return
    hasSubmittedRef.current = true

    if (isExpired) {
      setError("This quote has expired. Please go back and get a new quote.")
      hasSubmittedRef.current = false
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await submitPayment({ quoteId: quote.id })
      onPaymentSuccess(result.transactionId)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Payment failed. Please try again."
      )
      hasSubmittedRef.current = false // allow retry on failure
    } finally {
      setIsSubmitting(false)
    }
  }, [quote.id, isExpired, isSubmitting, onPaymentSuccess])

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col gap-5 pt-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-foreground">
              Confirm Transfer
            </h3>
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
          </div>

          <Separator />

          {/* Transfer Summary */}
          <div className="rounded-lg bg-secondary/50 p-4">
            <div className="flex flex-col gap-1 text-center">
              <span className="text-sm text-muted-foreground">You send</span>
              <span className="text-2xl font-semibold text-foreground">
                {formatCurrency(quote.totalPayable, quote.sourceCurrency)}
              </span>
            </div>
            <div className="flex items-center justify-center py-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-px w-8 bg-border" />
                <Send className="h-4 w-4" />
                <div className="h-px w-8 bg-border" />
              </div>
            </div>
            <div className="flex flex-col gap-1 text-center">
              <span className="text-sm text-muted-foreground">
                They receive
              </span>
              <span className="text-2xl font-semibold text-accent">
                {formatCurrency(
                  quote.destinationAmount,
                  quote.destinationCurrency
                )}
              </span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Exchange rate</span>
              <span className="font-mono font-medium text-foreground">
                1 {quote.sourceCurrency} = {quote.fxRate}{" "}
                {quote.destinationCurrency}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium text-foreground">
                {formatCurrency(quote.sourceAmount, quote.sourceCurrency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Transfer fee</span>
              <span className="font-medium text-foreground">
                {formatCurrency(quote.fee, quote.sourceCurrency)}
              </span>
            </div>
          </div>

          <Separator />

          {/* Security Note */}
          <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Your transfer is protected with end-to-end encryption.</span>
          </div>

          {/* Error State */}
          {error && (
            <div
              className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Expired State */}
          {isExpired && !error && (
            <div
              className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                This quote has expired. Please go back and get a new quote.
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
              className="flex-1 h-12 border-border"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handlePay}
              disabled={isSubmitting || isExpired}
              className="flex-1 h-12 text-base bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing payment...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Confirm & Pay
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
