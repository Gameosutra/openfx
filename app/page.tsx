"use client"

import { useState, useCallback } from "react"
import { QuoteScreen } from "@/components/quote-screen"
import { ConfirmScreen } from "@/components/confirm-screen"
import { StatusScreen } from "@/components/status-screen"
import { StepIndicator } from "@/components/step-indicator"
import type { AppStep, QuoteResponse } from "@/lib/types"
import { ArrowRightLeft } from "lucide-react"

export default function HomePage() {
  const [step, setStep] = useState<AppStep>("quote")
  const [quote, setQuote] = useState<QuoteResponse | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)

  const handleQuoteConfirm = useCallback((confirmedQuote: QuoteResponse) => {
    setQuote(confirmedQuote)
    setStep("confirm")
  }, [])

  const handlePaymentSuccess = useCallback((txnId: string) => {
    setTransactionId(txnId)
    setStep("status")
  }, [])

  const handleBack = useCallback(() => {
    setStep("quote")
  }, [])

  const handleNewTransfer = useCallback(() => {
    setQuote(null)
    setTransactionId(null)
    setStep("quote")
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <ArrowRightLeft className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground tracking-tight">
              OpenFX
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            International Transfers
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Step Indicator */}
          <StepIndicator currentStep={step} />

          {/* Step Content */}
          {step === "quote" && (
            <QuoteScreen onConfirm={handleQuoteConfirm} />
          )}

          {step === "confirm" && quote && (
            <ConfirmScreen
              quote={quote}
              onPaymentSuccess={handlePaymentSuccess}
              onBack={handleBack}
            />
          )}

          {step === "status" && transactionId && (
            <StatusScreen
              transactionId={transactionId}
              onNewTransfer={handleNewTransfer}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
            <p>
              This is a demo application. No real payments are processed.
            </p>
            <p className="font-mono">
              OpenFX &middot; Simulated FX Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
