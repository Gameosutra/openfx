"use client"

import { useEffect, useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { AppShell } from "@/components/app-shell"
import { ConfirmCard } from "@/components/payment/ConfirmCard"
import { useQuoteStore } from "@/store/quoteStore"
import { submitPayment } from "@/lib/api"

export default function ConfirmPage() {
  const router = useRouter()
  const [now, setNow] = useState(() => Date.now())
  const status = useQuoteStore((s) => s.status)
  const quoteData = useQuoteStore((s) =>
    s.status === "success" || s.status === "expired" ? s.data : null
  )
  const expiresAt = useQuoteStore((s) =>
    s.status === "success" || s.status === "expired" ? s.expiresAt! : 0
  )
  const expire = useQuoteStore((s) => s.expire)

  const payMutation = useMutation({
    mutationFn: submitPayment,
    retry: 0,
    onSuccess: (data) => {
      router.push(`/transaction/${data.transactionId}`)
    },
  })

  // Timer: re-check expiry every second and transition to expired
  useEffect(() => {
    if (status !== "success") return
    const interval = setInterval(() => {
      setNow(Date.now())
      if (Date.now() > expiresAt) {
        expire()
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [status, expiresAt, expire])

  const isExpired =
    status === "expired" || (status === "success" && now > expiresAt)

  useEffect(() => {
    if (!quoteData) {
      router.replace("/quote")
      return
    }
    if (status === "expired") {
      router.replace("/quote")
      return
    }
    if (status === "success" && now > expiresAt) {
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
