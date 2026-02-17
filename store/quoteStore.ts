import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { QuoteState, QuoteResponse } from "@/lib/types"

const STORAGE_KEY = "openfx-quote"

type QuoteActions = {
  setLoading: () => void
  setSuccess: (data: QuoteResponse, expiresAt: number) => void
  expire: () => void
  setError: (message: string) => void
  clearError: () => void
  reset: () => void
}

const initialState: QuoteState = { status: "idle" }

export const useQuoteStore = create<QuoteState & QuoteActions>()(
  persist(
    (set) => ({
      ...initialState,

      setLoading: () => set({ status: "loading" }),

      setSuccess: (data, expiresAt) =>
        set({ status: "success", data, expiresAt }),

      expire: () =>
        set((s) =>
          s.status === "success"
            ? { status: "expired", data: s.data, expiresAt: s.expiresAt }
            : s
        ),

      setError: (message) => set({ status: "error", message }),

      clearError: () =>
        set((s) => (s.status === "error" ? initialState : s)),

      reset: () => set(initialState),
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) =>
        s.status === "success" || s.status === "expired"
          ? { status: s.status, data: s.data, expiresAt: s.expiresAt! }
          : {},
    }
  )
)
