"use client"

import { useMutation } from "@tanstack/react-query"
import { quoteFetcher } from "@/services/fetchers"
import { useQuoteStore } from "@/store/quote-store"

const QUOTE_ERROR_MESSAGE = "Failed to fetch quote. Please try again."

export function useQuoteMutation() {
  const setLoading = useQuoteStore((s) => s.setLoading)
  const setSuccess = useQuoteStore((s) => s.setSuccess)
  const setError = useQuoteStore((s) => s.setError)
  const reset = useQuoteStore((s) => s.reset)

  const mutation = useMutation({
    mutationFn: quoteFetcher,
    onMutate: () => setLoading(),
    onSuccess: (data) => setSuccess(data, data.expiresAt),
    onError: (err) =>
      setError(err instanceof Error ? err.message : QUOTE_ERROR_MESSAGE),
  })

  return {
    ...mutation,
    requestQuote: (params: Parameters<typeof quoteFetcher>[0]) => {
      reset()
      mutation.mutate(params)
    },
  }
}
