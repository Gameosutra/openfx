import type { TransactionResponse, TransactionStatus } from "./types"

/** Server-side in-memory store for mock transactions. Status derived from createdAt on read. */
const transactions = new Map<
  string,
  Omit<TransactionResponse, "status"> & { status: TransactionStatus; failed?: boolean }
>()

export function setTransaction(
  id: string,
  data: Omit<TransactionResponse, "status"> & { status: TransactionStatus; failed?: boolean }
): void {
  transactions.set(id, data)
}

export function getTransaction(id: string): TransactionResponse | null {
  const row = transactions.get(id)
  if (!row) return null

  let status = row.status
  if (status === "processing" && !row.failed) {
    const elapsed = Date.now() - new Date(row.createdAt).getTime()
    if (elapsed > 6_000) status = "settled"
    else if (elapsed > 3_000) status = "sent"
  }

  return {
    ...row,
    status,
    updatedAt: new Date().toISOString(),
  }
}
