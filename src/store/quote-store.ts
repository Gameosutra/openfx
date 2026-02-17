import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { QuoteState, QuoteResponse } from "@/lib/types"
import { QuoteStatus } from "@/lib/types"

const STORAGE_KEY = "openfx-quote"

type QuoteActions = {
  setLoading: () => void
  setSuccess: (data: QuoteResponse, expiresAt: number) => void
  expire: () => void
  setError: (message: string) => void
  clearError: () => void
  reset: () => void
}

const initialState: QuoteState = { status: QuoteStatus.Idle }

export const useQuoteStore = create<QuoteState & QuoteActions>()(
  persist(
    (set) => ({
      ...initialState,

      setLoading: () => set({ status: QuoteStatus.Loading }),

      setSuccess: (data, expiresAt) =>
        set({ status: QuoteStatus.Success, data, expiresAt }),

      expire: () =>
        set((s) =>
          s.status === QuoteStatus.Success
            ? { status: QuoteStatus.Expired, data: s.data, expiresAt: s.expiresAt }
            : s
        ),

      setError: (message) => set({ status: QuoteStatus.Error, message }),

      clearError: () =>
        set((s) => (s.status === QuoteStatus.Error ? initialState : s)),

      reset: () => set(initialState),
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) =>
        s.status === QuoteStatus.Success || s.status === QuoteStatus.Expired
          ? { status: s.status, data: s.data, expiresAt: s.expiresAt! }
          : {},
    }
  )
)
