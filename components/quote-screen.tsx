"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CurrencySelect } from "@/components/currency-select"
import { useCountdown } from "@/hooks/use-countdown"
import { fetchQuote } from "@/lib/api"
import { formatCurrency } from "@/lib/currencies"
import type { QuoteResponse } from "@/lib/types"
import {
  ArrowRightLeft,
  Clock,
  RefreshCw,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react"

type QuoteScreenProps = {
  onConfirm: (quote: QuoteResponse) => void
}

export function QuoteScreen({ onConfirm }: QuoteScreenProps) {
  const [sourceCurrency, setSourceCurrency] = useState("USD")
  const [destinationCurrency, setDestinationCurrency] = useState("EUR")
  const [amount, setAmount] = useState("")
  const [quote, setQuote] = useState<QuoteResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { secondsLeft, isExpired } = useCountdown(quote?.expiresAt ?? null)

  const handleSwapCurrencies = () => {
    setSourceCurrency(destinationCurrency)
    setDestinationCurrency(sourceCurrency)
    setQuote(null)
    setError(null)
  }

  const handleGetQuote = useCallback(async () => {
    const parsedAmount = parseFloat(amount)
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Please enter a valid amount greater than 0.")
      return
    }
    if (sourceCurrency === destinationCurrency) {
      setError("Source and destination currencies must be different.")
      return
    }

    setIsLoading(true)
    setError(null)
    setQuote(null)

    try {
      const result = await fetchQuote({
        sourceCurrency,
        destinationCurrency,
        amount: parsedAmount,
      })
      setQuote(result)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch quote. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }, [amount, sourceCurrency, destinationCurrency])

  const handleRefreshQuote = () => {
    handleGetQuote()
  }

  const handleContinue = () => {
    if (quote && !isExpired) {
      onConfirm(quote)
    }
  }

  const isAmountValid = parseFloat(amount) > 0

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-foreground">
            Get a Quote
          </CardTitle>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Select your currencies and amount to receive a live exchange rate.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Currency Selection */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <CurrencySelect
                label="You send"
                value={sourceCurrency}
                onValueChange={(v) => {
                  setSourceCurrency(v)
                  setQuote(null)
                }}
                excludeCode={destinationCurrency}
                disabled={isLoading}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="self-center sm:self-end h-12 w-12 shrink-0 border-border"
              onClick={handleSwapCurrencies}
              disabled={isLoading}
              aria-label="Swap currencies"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <CurrencySelect
                label="They receive"
                value={destinationCurrency}
                onValueChange={(v) => {
                  setDestinationCurrency(v)
                  setQuote(null)
                }}
                excludeCode={sourceCurrency}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Amount Input */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="amount"
              className="text-sm font-medium text-muted-foreground"
            >
              Amount ({sourceCurrency})
            </Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setQuote(null)
                setError(null)
              }}
              disabled={isLoading}
              className="h-12 text-lg font-mono bg-card border-border"
            />
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

          {/* Get Quote Button */}
          <Button
            onClick={handleGetQuote}
            disabled={isLoading || !isAmountValid}
            className="h-12 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Fetching quote...
              </>
            ) : (
              "Get Quote"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Quote Result */}
      {quote && (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col gap-5 pt-6">
            {/* Timer Badge */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">
                Your Quote
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

            {/* Rate Details */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Exchange Rate</span>
                <span className="font-mono font-medium text-foreground">
                  1 {quote.sourceCurrency} = {quote.fxRate}{" "}
                  {quote.destinationCurrency}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">You send</span>
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

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Total payable
                </span>
                <span className="text-lg font-semibold text-foreground">
                  {formatCurrency(quote.totalPayable, quote.sourceCurrency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  They receive
                </span>
                <span className="text-lg font-semibold text-accent">
                  {formatCurrency(
                    quote.destinationAmount,
                    quote.destinationCurrency
                  )}
                </span>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row">
              {isExpired ? (
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
  )
}
