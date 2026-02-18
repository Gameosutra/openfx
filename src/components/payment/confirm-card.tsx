"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/currencies"
import type { QuoteResponse } from "@/lib/types"
import { ArrowLeft, ShieldCheck, Send, AlertCircle, Loader2 } from "lucide-react"
import { QuoteTimer } from "@/components/common/quote-timer"

type ConfirmCardProps = {
  quote: QuoteResponse
  isExpired: boolean
  onBack: () => void
  onConfirm: () => void
  isSubmitting: boolean
  error: string | null
}

export function ConfirmCard({
  quote,
  isExpired,
  onBack,
  onConfirm,
  isSubmitting,
  error,
}: ConfirmCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col gap-5 pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-foreground">
            Confirm Transfer
          </h3>
          <QuoteTimer />
        </div>

        <Separator />

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
            <span className="text-sm text-muted-foreground">They receive</span>
            <span className="text-2xl font-semibold text-accent">
              {formatCurrency(quote.destinationAmount, quote.destinationCurrency)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Exchange rate</span>
            <span className="font-mono font-medium text-foreground">
              1 {quote.sourceCurrency} = {quote.fxRate} {quote.destinationCurrency}
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

        <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>Your transfer is protected with end-to-end encryption.</span>
        </div>

        {error && (
          <div
            className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isExpired && !error && (
          <div
            className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>This quote has expired. Please go back and get a new quote.</span>
          </div>
        )}

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
            onClick={onConfirm}
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
  )
}
