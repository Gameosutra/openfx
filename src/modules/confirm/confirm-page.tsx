"use client"

import { useEffect, useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { ConfirmCard } from "@/components/payment/confirm-card"
import { useQuoteStore } from "@/store/quote-store"
import { usePayMutation } from "@/hooks/use-pay-mutation"
import { QuoteStatus } from "@/lib/types"

export function ConfirmPage() {
  const router = useRouter()
  const [now, setNow] = useState(() => Date.now())

  const payMutation = usePayMutation({
    onSuccess: (data) => router.push(`/transaction/${data.transactionId}`),
  })

  const status = useQuoteStore((s) => s.status)
  const quoteData = useQuoteStore((s) =>
    s.status === QuoteStatus.Success || s.status === QuoteStatus.Expired ? s.data : null
  )
  const expiresAt = useQuoteStore((s) =>
    s.status === QuoteStatus.Success || s.status === QuoteStatus.Expired ? s.expiresAt! : 0
  )
  const expire = useQuoteStore((s) => s.expire)

  useEffect(() => {
    if (status !== QuoteStatus.Success) return
    const interval = setInterval(() => {
      setNow(Date.now())
      if (Date.now() > expiresAt) {
        expire()
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [status, expiresAt, expire])

  const isExpired =
    status === QuoteStatus.Expired || (status === QuoteStatus.Success && now > expiresAt)

  useEffect(() => {
    if (!quoteData) {
      router.replace("/quote")
      return
    }
    if (status === QuoteStatus.Expired) {
      router.replace("/quote")
      return
    }
    if (status === QuoteStatus.Success && now > expiresAt) {
      expire()
      router.replace("/quote")
    }
  }, [quoteData, status, expiresAt, now, router, expire])

  const handleBack = useCallback(() => {
    router.push("/quote")
  }, [router])

  const handleConfirm = useCallback(() => {
    if (!quoteData) return
    if (Date.now() > expiresAt) return
    payMutation.mutate({ quoteId: quoteData.id })
  }, [quoteData, expiresAt, payMutation])

  if (!quoteData || isExpired) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Redirecting...
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <ConfirmCard
        quote={quoteData}
        expiresAt={expiresAt}
        isExpired={false}
        onBack={handleBack}
        onConfirm={handleConfirm}
        isSubmitting={payMutation.isPending}
        error={
          payMutation.isError
            ? payMutation.error instanceof Error
              ? payMutation.error.message
              : "Payment failed. Please try again."
            : null
        }
      />
    </AppShell>
  )
}
