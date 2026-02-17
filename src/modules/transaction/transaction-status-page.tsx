"use client"

import { useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { AppShell } from "@/components/app-shell"
import { StatusCard } from "@/components/transaction/status-card"
import { fetchTransactionStatus } from "@/lib/api"
import { TRANSACTION_POLL_INTERVAL_MS } from "@/lib/constants"
import { TransactionStatusValue } from "@/lib/types"
import { useQuoteStore } from "@/store/quote-store"

export function TransactionStatusPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === "string" ? params.id : ""
  const resetQuote = useQuoteStore((s) => s.reset)

  const {
    data: transaction,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["transaction", id],
    queryFn: () => fetchTransactionStatus(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === TransactionStatusValue.Settled || status === TransactionStatusValue.Failed) return false
      if (status === TransactionStatusValue.Processing || status === TransactionStatusValue.Sent)
        return TRANSACTION_POLL_INTERVAL_MS
      return false
    },
  })

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
        error={error ? (error instanceof Error ? error.message : "Failed to load status") : null}
        onRetry={() => refetch()}
        onNewTransfer={onNewTransfer}
      />
    </AppShell>
  )
}
