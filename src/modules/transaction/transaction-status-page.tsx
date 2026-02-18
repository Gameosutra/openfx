"use client"

import { useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { StatusCard } from "@/components/transaction/status-card"
import { useTransactionQuery } from "@/hooks/use-transaction-query"
import { useQuoteStore } from "@/store/quote-store"

export function TransactionStatusPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === "string" ? params.id : ""
  const resetQuote = useQuoteStore((s) => s.reset)

  const { data: transaction, isLoading, error, refetch } = useTransactionQuery(id)

  const onNewTransfer = useCallback(() => {
    resetQuote()
    router.push("/quote")
  }, [resetQuote, router])

  if (!id) {
    return (
      <AppShell>
        <div className="text-center text-muted-foreground py-12">
          Missing transaction ID.
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <StatusCard
        transactionId={id}
        transaction={transaction}
        isLoading={isLoading}
        error={
          error
            ? error instanceof Error
              ? error.message
              : "Failed to load status"
            : null
        }
        onRetry={() => refetch()}
        onNewTransfer={onNewTransfer}
      />
    </AppShell>
  )
}
