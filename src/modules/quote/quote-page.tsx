"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { QuoteForm } from "@/components/quote/quote-form"
import { QuoteTimer } from "@/components/quote/quote-timer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useQuoteStore } from "@/store/quote-store"
import { useQuoteMutation } from "@/hooks/use-quote-mutation"
import { formatCurrency } from "@/lib/currencies"
import { QuoteStatus } from "@/lib/types"
import { ArrowRight, RefreshCw, Loader2 } from "lucide-react"

export function QuotePage() {
  const router = useRouter()
  const { requestQuote, mutate } = useQuoteMutation()

  const status = useQuoteStore((s) => s.status)
  const quoteData = useQuoteStore((s) =>
    s.status === QuoteStatus.Success || s.status === QuoteStatus.Expired ? s.data : null
  )
  const clearError = useQuoteStore((s) => s.clearError)

  const handleRequestQuote = useCallback(
    (params: { sourceCurrency: string; destinationCurrency: string; amount: number }) => {
      requestQuote(params)
    },
    [requestQuote]
  )

  const handleContinue = useCallback(() => {
    const state = useQuoteStore.getState()
    if (state.status === QuoteStatus.Success && Date.now() <= state.expiresAt) {
      router.push("/confirm")
    }
  }, [router])

  const handleRefreshQuote = useCallback(() => {
    if (!quoteData) return
    mutate({
      sourceCurrency: quoteData.sourceCurrency,
      destinationCurrency: quoteData.destinationCurrency,
      amount: quoteData.sourceAmount,
    })
  }, [quoteData, mutate])

  const isLoading = status === QuoteStatus.Loading
  const errorMessage = useQuoteStore((s) =>
    s.status === QuoteStatus.Error ? s.message : null
  )
  const isQuoteExpired = status === QuoteStatus.Expired

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <QuoteForm
          onRequestQuote={handleRequestQuote}
          isLoading={isLoading}
          error={errorMessage}
          onClearError={clearError}
        />

        {(status === QuoteStatus.Success || status === QuoteStatus.Expired) && quoteData && (
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col gap-5 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Your Quote</h3>
                <QuoteTimer />
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
