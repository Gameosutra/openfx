"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CurrencySelect } from "@/components/currency-select"
import { ArrowRightLeft, Loader2, AlertCircle } from "lucide-react"

type QuoteFormProps = {
  onRequestQuote: (params: {
    sourceCurrency: string
    destinationCurrency: string
    amount: number
  }) => void
  isLoading: boolean
  error: string | null
  onClearError: () => void
}

export function QuoteForm({
  onRequestQuote,
  isLoading,
  error,
  onClearError,
}: QuoteFormProps) {
  const [sourceCurrency, setSourceCurrency] = useState("USD")
  const [destinationCurrency, setDestinationCurrency] = useState("EUR")
  const [amount, setAmount] = useState("")

  const handleSwap = useCallback(() => {
    setSourceCurrency((c) => destinationCurrency)
    setDestinationCurrency((c) => sourceCurrency)
    onClearError()
  }, [sourceCurrency, destinationCurrency, onClearError])

  const handleSubmit = useCallback(() => {
    const parsed = parseFloat(amount)
    if (!parsed || parsed <= 0) return
    if (sourceCurrency === destinationCurrency) return
    onRequestQuote({
      sourceCurrency,
      destinationCurrency,
      amount: parsed,
    })
  }, [amount, sourceCurrency, destinationCurrency, onRequestQuote])

  const isAmountValid = parseFloat(amount) > 0

  return (
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <CurrencySelect
              label="You send"
              value={sourceCurrency}
              onValueChange={(v) => {
                setSourceCurrency(v)
                onClearError()
              }}
              excludeCode={destinationCurrency}
              disabled={isLoading}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="self-center sm:self-end h-12 w-12 shrink-0 border-border"
            onClick={handleSwap}
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
                onClearError()
              }}
              excludeCode={sourceCurrency}
              disabled={isLoading}
            />
          </div>
        </div>

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
              onClearError()
            }}
            disabled={isLoading}
            className="h-12 text-lg font-mono bg-card border-border"
          />
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

        <Button
          onClick={handleSubmit}
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
  )
}
