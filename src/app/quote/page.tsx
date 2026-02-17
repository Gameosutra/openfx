"use client"

import { useEffect, useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { AppShell } from "@/components/app-shell"
import { QuoteForm } from "@/components/quote/quote-form"
import { QuoteTimer } from "@/components/quote/quote-timer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useQuoteStore } from "@/store/quote-store"
import { fetchQuote } from "@/lib/api"
import { formatCurrency } from "@/lib/currencies"
import { QUOTE_EXPIRY_CHECK_INTERVAL_MS } from "@/lib/constants"
import { ArrowRight, RefreshCw, Loader2 } from "lucide-react"

export default function QuotePage() {
  const router = useRouter()
  const [now, setNow] = useState(() => Date.now())
  const status = useQuoteStore((s) => s.status)
  const quoteData = useQuoteStore((s) =>
    s.status === "success" || s.status === "expired" ? s.data : null
  )
  const expiresAt = useQuoteStore((s) =>
    s.status === "success" || s.status === "expired" ? s.expiresAt! : 0
  )
  const setLoading = useQuoteStore((s) => s.setLoading)
  const setSuccess = useQuoteStore((s) => s.setSuccess)
  const setError = useQuoteStore((s) => s.setError)
  const clearError = useQuoteStore((s) => s.clearError)
  const expire = useQuoteStore((s) => s.expire)
  const reset = useQuoteStore((s) => s.reset)

  const quoteMutation = useMutation({
    mutationFn: fetchQuote,
    onMutate: () => setLoading(),
    onSuccess: (data) => setSuccess(data, data.expiresAt),
    onError: (err) =>
      setError(
        err instanceof Error ? err.message : "Failed to fetch quote. Please try again."
      ),
  })

  // Tick every second so timer UI updates and we can transition to expired
  useEffect(() => {
    if (status !== "success" && status !== "expired") return
    const interval = setInterval(() => {
      const t = Date.now()
      setNow(t)
      const state = useQuoteStore.getState()
      if (state.status === "success" && t > state.expiresAt) {
        expire()
      }
    }, QUOTE_EXPIRY_CHECK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [status, expire])

  const handleRequestQuote = useCallback(
    (params: {
      sourceCurrency: string
      destinationCurrency: string
      amount: number
    }) => {
      reset()
      quoteMutation.mutate(params)
    },
    [quoteMutation, reset]
  )

  const handleContinue = useCallback(() => {
    const state = useQuoteStore.getState()
    if (state.status === "success" && Date.now() <= state.expiresAt) {
      router.push("/confirm")
    }
  }, [router])

  const handleRefreshQuote = useCallback(() => {
    if (!quoteData) return
    quoteMutation.mutate({
      sourceCurrency: quoteData.sourceCurrency,
      destinationCurrency: quoteData.destinationCurrency,
      amount: quoteData.sourceAmount,
    })
  }, [quoteData, quoteMutation])

  const isLoading = status === "loading"
  const error = useQuoteStore((s) =>
    s.status === "error" ? s.message : null
  )
  const isQuoteExpired =
    status === "expired" || (status === "success" && now > expiresAt)

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <QuoteForm
          onRequestQuote={handleRequestQuote}
          isLoading={isLoading}
          error={error}
          onClearError={clearError}
        />

        {(status === "success" || status === "expired") && quoteData && (
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col gap-5 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Your Quote</h3>
                <QuoteTimer
                  expiresAt={expiresAt}
                  isExpired={isQuoteExpired}
                />
              </div>
              <Separator />
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Exchange Rate</span>
                  <span className="font-mono font-medium text-foreground">
                    1 {quoteData.sourceCurrency} = {quoteData.fxRate}{" "}
                    {quoteData.destinationCurrency}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">You send</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(quoteData.sourceAmount, quoteData.sourceCurrency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Transfer fee</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(quoteData.fee, quoteData.sourceCurrency)}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Total payable
                  </span>
                  <span className="text-lg font-semibold text-foreground">
                    {formatCurrency(quoteData.totalPayable, quoteData.sourceCurrency)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    They receive
                  </span>
                  <span className="text-lg font-semibold text-accent">
                    {formatCurrency(
                      quoteData.destinationAmount,
                      quoteData.destinationCurrency
                    )}
                  </span>
                </div>
              </div>
              <Separator />
              <div className="flex flex-col gap-3 sm:flex-row">
                {isQuoteExpired ? (
                  <Button
                    onClick={handleRefreshQuote}
                    disabled={isLoading}
                    className="flex-1 h-12 text-base bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Refresh Quote
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleRefreshQuote}
                      disabled={isLoading}
                      className="flex-1 h-12 border-border"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </Button>
                    <Button
                      onClick={handleContinue}
                      className="flex-1 h-12 text-base bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
