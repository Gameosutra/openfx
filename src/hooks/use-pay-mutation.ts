"use client"

import { useMutation } from "@tanstack/react-query"
import { payFetcher } from "@/services/fetchers"

type UsePayMutationOptions = {
  onSuccess: (data: Awaited<ReturnType<typeof payFetcher>>) => void
}

export function usePayMutation({ onSuccess }: UsePayMutationOptions) {
  return useMutation({
    mutationFn: payFetcher,
    retry: 0,
    onSuccess,
  })
}
