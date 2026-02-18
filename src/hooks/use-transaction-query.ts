"use client"

import { useQuery } from "@tanstack/react-query"
import { transactionFetcher } from "@/services/fetchers"
import { TRANSACTION_POLL_INTERVAL_MS } from "@/lib/constants"
import { TransactionStatusValue } from "@/lib/types"

export function useTransactionQuery(transactionId: string) {
  return useQuery({
    queryKey: ["transaction", transactionId],
    queryFn: () => transactionFetcher(transactionId),
    enabled: !!transactionId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === TransactionStatusValue.Settled || status === TransactionStatusValue.Failed)
        return false
      if (
        status === TransactionStatusValue.Processing ||
        status === TransactionStatusValue.Sent
      )
        return TRANSACTION_POLL_INTERVAL_MS
      return false
    },
  })
}
